import { createClient } from '@supabase/supabase-js'

const NFC_API_BASE = (
  process.env.NFC_ME_BASE_URL ||
  process.env.NFC_ME_API_BASE_URL ||
  'https://nfc-me-a3a3437da95d.herokuapp.com/api/v1'
).replace(/\/$/, '')
const NFC_API_KEY = process.env.NFC_ME_API_KEY
const NFC_PRODUCT_SKU = (process.env.NFC_ME_PRODUCT_SKU || 'NFC-WHITE-25MM').toUpperCase()
const STRIPE_NFC_STICKER_PRICE_ID = (process.env.STRIPE_NFC_STICKER_PRICE_ID || '').trim()
const STRIPE_NFC_POSTAGE_PRICE_ID = (process.env.STRIPE_NFC_POSTAGE_PRICE_ID || '').trim()
const SUPABASE_URL = process.env.SUPABASE_URL
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY
const STRIPE_SECRET_KEY = (process.env.STRIPE_SECRET_KEY || '').trim()
const PUBLIC_BASE_URL = (process.env.NUXT_PUBLIC_BASE_URL || 'https://doghealthy.co.uk').replace(/\/$/, '')

/** Default stickers per dog; replacements may order 1 or 2. */
const DEFAULT_TAGS_PER_DOG = 2
/** Flat UK postage once per order (pence). */
const POSTAGE_CENTS = Number(process.env.NFC_POSTAGE_CENTS || 100)
/** Free postage when ordering this many stickers or more. */
const FREE_POSTAGE_TAG_THRESHOLD = Number(process.env.NFC_FREE_POSTAGE_TAG_THRESHOLD || 20)

const NFC_ORDERS_URL = `${NFC_API_BASE}/orders/`

const json = (statusCode, body) => ({
  statusCode,
  headers: {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'POST, OPTIONS'
  },
  body: JSON.stringify(body)
})

function resolveReturnBase(event) {
  const headers = event.headers || {}
  const origin = headers.origin || headers.Origin || ''
  try {
    if (origin) {
      const host = new URL(origin).hostname
      if (['doghealthy.co.uk', 'www.doghealthy.co.uk', 'doghealthy.netlify.app'].includes(host)) {
        return origin.replace(/\/$/, '')
      }
    }
  } catch {
    // ignore
  }
  return PUBLIC_BASE_URL
}

/**
 * Create a batch NFC sticker order (dogs × tags_per_dog) with one postage fee,
 * then redirect to Stripe Checkout. NFC Me is called after payment via nfc-confirm-order.
 *
 * Body: {
 *   dogIds: string[],
 *   shipping: {...},
 *   productId?: string,
 *   productSku?: string,
 *   tagsPerDog?: 1 | 2,
 *   orderType?: 'new' | 'replacement'
 * }
 */
export async function handler(event) {
  if (event.httpMethod === 'OPTIONS') return json(204, {})
  if (event.httpMethod !== 'POST') return json(405, { error: 'Method not allowed' })

  try {
    if (!NFC_API_KEY) return json(503, { error: 'NFC_ME_API_KEY is not configured' })
    if (!STRIPE_SECRET_KEY || STRIPE_SECRET_KEY.includes('REPLACE_ME')) {
      return json(503, { error: 'STRIPE_SECRET_KEY is not configured' })
    }
    if (!SUPABASE_URL || !SUPABASE_ANON_KEY || !SUPABASE_SERVICE_ROLE_KEY) {
      return json(503, { error: 'Supabase environment is not configured' })
    }

    const authHeader = event.headers.authorization || event.headers.Authorization
    if (!authHeader?.startsWith('Bearer ')) return json(401, { error: 'Missing auth token' })
    const accessToken = authHeader.slice(7)

    const body = JSON.parse(event.body || '{}')
    const { dogIds, shipping } = body
    const orderType = body.orderType === 'replacement' ? 'replacement' : 'new'
    let tagsPerDog = Number(body.tagsPerDog || DEFAULT_TAGS_PER_DOG)
    if (tagsPerDog !== 1 && tagsPerDog !== 2) tagsPerDog = DEFAULT_TAGS_PER_DOG
    if (orderType === 'new') tagsPerDog = DEFAULT_TAGS_PER_DOG

    if (!Array.isArray(dogIds) || dogIds.length === 0) {
      return json(400, { error: 'Select at least one dog' })
    }
    if (!shipping?.name || !shipping?.email || !shipping?.line1 || !shipping?.city || !shipping?.postcode) {
      return json(400, { error: 'Complete shipping details are required' })
    }

    const authClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      global: { headers: { Authorization: `Bearer ${accessToken}` } }
    })
    const { data: userData, error: userError } = await authClient.auth.getUser()
    if (userError || !userData?.user) return json(401, { error: 'Invalid or expired session' })
    const user = userData.user

    const admin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

    let productQuery = admin
      .from('nfcme_products')
      .select('id, sku, name, unit_price_cents, currency, min_order_qty, is_active')
      .eq('is_active', true)
      .eq('sku', NFC_PRODUCT_SKU)

    // Only allow the configured DogHealthy sticker SKU (ignore other catalogue IDs).
    const { data: productRows, error: productError } = await productQuery.limit(1)
    if (productError) {
      console.error('Product lookup error:', productError)
      return json(500, { error: 'Failed to look up NFC product' })
    }
    const product = productRows?.[0]
    if (!product) {
      return json(400, { error: `Unknown or inactive product: ${NFC_PRODUCT_SKU}` })
    }

    const { data: dogs, error: dogsError } = await admin
      .from('doghealthy_dogs')
      .select('id, name, breed, photo_url')
      .eq('user_id', user.id)
      .eq('is_active', true)
      .in('id', dogIds)

    if (dogsError) {
      console.error('Dogs fetch error:', dogsError)
      return json(500, { error: 'Failed to load selected dogs' })
    }
    if (!dogs || dogs.length !== dogIds.length) {
      return json(400, { error: 'One or more selected dogs were not found on your account' })
    }

    const tagQuantity = dogs.length * tagsPerDog
    const minQty = Number(product.min_order_qty || 1)
    // Replacements may be a single sticker; new orders must meet catalogue min on sticker qty
    if (orderType === 'new' && tagQuantity < minQty) {
      return json(400, {
        error: `Minimum order is ${minQty} stickers (${Math.ceil(minQty / tagsPerDog)} dogs at ${tagsPerDog} each).`
      })
    }

    const unitPrice = Number(product.unit_price_cents || 0)
    const subtotalCents = unitPrice * tagQuantity
    const postageCents = tagQuantity >= FREE_POSTAGE_TAG_THRESHOLD ? 0 : POSTAGE_CENTS
    const totalCents = subtotalCents + postageCents
    const currency = String(product.currency || 'gbp').toLowerCase()

    const orderId = crypto.randomUUID()
    const baseUrl = resolveReturnBase(event)
    const profileBase = PUBLIC_BASE_URL
    const profileLines = dogs.map((dog) => `${dog.name}: ${profileBase}/dogs/${dog.id}`)

    const nfcPayload = {
      external_reference: orderId,
      items: [{ sku: product.sku, quantity: tagQuantity }],
      shipping: {
        name: shipping.name,
        line1: shipping.line1,
        line2: shipping.line2 || null,
        city: shipping.city,
        postal_code: shipping.postcode,
        country: shipping.country || 'GB'
      },
      notes: [
        `DogHealthy ${orderType} order for ${shipping.email}`,
        `Phone: ${shipping.phone || 'n/a'}`,
        `Dogs: ${dogs.length} × ${tagsPerDog} stickers = ${tagQuantity}`,
        'Profile URLs (encode each sticker to its dog):',
        ...profileLines
      ].join('\n')
    }

    const { error: insertError } = await admin.from('doghealthy_nfc_orders').insert({
      id: orderId,
      user_id: user.id,
      dog_ids: dogIds,
      status: 'pending_payment',
      order_type: orderType,
      tags_per_dog: tagsPerDog,
      tag_quantity: tagQuantity,
      unit_price_cents: unitPrice,
      postage_cents: postageCents,
      subtotal_cents: subtotalCents,
      total_cents: totalCents,
      currency,
      product_sku: product.sku,
      payment_status: 'unpaid',
      shipping_name: shipping.name,
      shipping_email: shipping.email,
      shipping_phone: shipping.phone || null,
      shipping_line1: shipping.line1,
      shipping_line2: shipping.line2 || null,
      shipping_city: shipping.city,
      shipping_postcode: shipping.postcode,
      shipping_country: shipping.country || 'GB',
      request_payload: nfcPayload
    })

    if (insertError) {
      console.error('Order insert error:', insertError)
      return json(500, { error: 'Failed to create local NFC order' })
    }

    const successUrl =
      `${baseUrl}/nfc-tags?order=success&session_id={CHECKOUT_SESSION_ID}&order_id=${orderId}`
    const cancelUrl = `${baseUrl}/nfc-tags?order=cancelled&order_id=${orderId}`

    const params = new URLSearchParams()
    params.set('mode', 'payment')
    params.set('success_url', successUrl)
    params.set('cancel_url', cancelUrl)
    params.set('client_reference_id', orderId)
    params.set('customer_email', shipping.email || user.email || '')
    params.set('metadata[order_id]', orderId)
    params.set('metadata[user_id]', user.id)
    params.set('metadata[order_type]', orderType)
    params.append('payment_method_types[0]', 'card')

    // Prefer catalogue Price IDs from Stripe Dashboard when configured;
    // otherwise charge £1/sticker (and postage) via inline price_data.
    if (STRIPE_NFC_STICKER_PRICE_ID) {
      params.set('line_items[0][price]', STRIPE_NFC_STICKER_PRICE_ID)
      params.set('line_items[0][quantity]', String(tagQuantity))
    } else {
      params.set('line_items[0][quantity]', String(tagQuantity))
      params.set('line_items[0][price_data][currency]', currency)
      params.set('line_items[0][price_data][unit_amount]', String(unitPrice))
      params.set(
        'line_items[0][price_data][product_data][name]',
        orderType === 'replacement'
          ? `${product.name} (replacement)`
          : product.name
      )
      params.set(
        'line_items[0][price_data][product_data][description]',
        `${dogs.length} dog(s) × ${tagsPerDog} sticker(s) = ${tagQuantity}`
      )
    }

    if (postageCents > 0) {
      if (STRIPE_NFC_POSTAGE_PRICE_ID) {
        params.set('line_items[1][price]', STRIPE_NFC_POSTAGE_PRICE_ID)
        params.set('line_items[1][quantity]', '1')
      } else {
        params.set('line_items[1][quantity]', '1')
        params.set('line_items[1][price_data][currency]', currency)
        params.set('line_items[1][price_data][unit_amount]', String(postageCents))
        params.set('line_items[1][price_data][product_data][name]', 'UK postage')
        params.set(
          'line_items[1][price_data][product_data][description]',
          'Flat rate — one parcel for the whole order'
        )
      }
    }

    const stripeRes = await fetch('https://api.stripe.com/v1/checkout/sessions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${STRIPE_SECRET_KEY}`,
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: params.toString()
    })
    const session = await stripeRes.json().catch(() => ({}))
    if (!stripeRes.ok) {
      console.error('Stripe NFC checkout error:', session)
      await admin
        .from('doghealthy_nfc_orders')
        .update({ status: 'failed', error_message: session?.error?.message || 'Stripe checkout failed' })
        .eq('id', orderId)
      return json(502, { error: session?.error?.message || 'Failed to start payment' })
    }

    await admin
      .from('doghealthy_nfc_orders')
      .update({ stripe_checkout_session_id: session.id })
      .eq('id', orderId)

    return json(200, {
      url: session.url,
      sessionId: session.id,
      orderId,
      tagQuantity,
      tagsPerDog,
      dogCount: dogs.length,
      postageCents,
      subtotalCents,
      totalCents,
      currency,
      freePostage: postageCents === 0
    })
  } catch (error) {
    console.error('nfc-create-order error:', error)
    return json(500, { error: error?.message || 'Unexpected server error' })
  }
}
