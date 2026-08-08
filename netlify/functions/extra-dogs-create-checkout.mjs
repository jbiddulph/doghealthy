import { createClient } from '@supabase/supabase-js'
import { createPlaceholderDogs } from './_lib/extra-dogs.mjs'

const SUPABASE_URL = process.env.SUPABASE_URL
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY
const STRIPE_SECRET_KEY = (process.env.STRIPE_SECRET_KEY || '').trim()
const PUBLIC_BASE_URL = (process.env.NUXT_PUBLIC_BASE_URL || 'https://doghealthy.co.uk').replace(/\/$/, '')

const FREE_DOG_LIMIT = 3
const UNIT_PRICE_CENTS = Number(process.env.EXTRA_DOG_PRICE_CENTS || 200)
const POSTAGE_FIRST_CENTS = Number(process.env.NFC_POSTAGE_FIRST_CENTS || 180)
const POSTAGE_SECOND_CENTS = Number(process.env.NFC_POSTAGE_SECOND_CENTS || 91)
const MAX_QTY = 100

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
 * Stripe Checkout for extra dogs after the 3 free profiles.
 * Body: { quantity, postageClass: 'first'|'second', shipping: {...} }
 */
export async function handler(event) {
  if (event.httpMethod === 'OPTIONS') return json(204, {})
  if (event.httpMethod !== 'POST') return json(405, { error: 'Method not allowed' })

  try {
    if (!SUPABASE_URL || !SUPABASE_ANON_KEY || !SUPABASE_SERVICE_ROLE_KEY) {
      return json(503, { error: 'Supabase environment is not configured' })
    }

    const authHeader = event.headers.authorization || event.headers.Authorization
    if (!authHeader?.startsWith('Bearer ')) return json(401, { error: 'Missing auth token' })
    const accessToken = authHeader.slice(7)

    const body = JSON.parse(event.body || '{}')
    const quantity = Math.floor(Number(body.quantity || 0))
    const postageClass = body.postageClass === 'first' ? 'first' : 'second'
    const shipping = body.shipping || {}

    if (!Number.isFinite(quantity) || quantity < 1 || quantity > MAX_QTY) {
      return json(400, { error: `Choose between 1 and ${MAX_QTY} dogs` })
    }

    const authClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      global: { headers: { Authorization: `Bearer ${accessToken}` } }
    })
    const { data: userData, error: userError } = await authClient.auth.getUser()
    if (userError || !userData?.user) return json(401, { error: 'Invalid or expired session' })
    const user = userData.user

    const admin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
    const { count, error: countError } = await admin
      .from('doghealthy_dogs')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .eq('is_active', true)

    if (countError) {
      console.error('extra-dogs count:', countError)
      return json(500, { error: 'Failed to count existing dogs' })
    }

    const existing = count || 0
    const freeSlots = Math.max(0, FREE_DOG_LIMIT - existing)
    const freeInOrder = Math.min(quantity, freeSlots)
    const paidQty = quantity - freeInOrder

    if (paidQty === 0) {
      const created = await createPlaceholderDogs(admin, {
        userId: user.id,
        quantity,
        nfcCount: 0
      })
      return json(200, {
        free: true,
        quantity,
        names: created.names,
        dogIds: created.dogIds
      })
    }

    if (!STRIPE_SECRET_KEY || STRIPE_SECRET_KEY.includes('REPLACE_ME')) {
      return json(503, { error: 'STRIPE_SECRET_KEY is not configured' })
    }
    if (!shipping.name || !shipping.email || !shipping.line1 || !shipping.city || !shipping.postcode) {
      return json(400, { error: 'Complete shipping details are required for NFC postage' })
    }

    const postageCents = postageClass === 'first' ? POSTAGE_FIRST_CENTS : POSTAGE_SECOND_CENTS
    const subtotalCents = UNIT_PRICE_CENTS * paidQty
    const totalCents = subtotalCents + postageCents
    const postageLabel = postageClass === 'first' ? '1st Class stamp' : '2nd Class stamp'
    const orderId = crypto.randomUUID()
    const baseUrl = resolveReturnBase(event)

    const { error: insertError } = await admin.from('doghealthy_extra_dog_orders').insert({
      id: orderId,
      user_id: user.id,
      quantity,
      unit_price_cents: UNIT_PRICE_CENTS,
      postage_class: postageClass,
      postage_cents: postageCents,
      subtotal_cents: subtotalCents,
      total_cents: totalCents,
      currency: 'gbp',
      status: 'pending_payment',
      payment_status: 'unpaid',
      shipping_name: shipping.name,
      shipping_email: shipping.email,
      shipping_phone: shipping.phone || null,
      shipping_line1: shipping.line1,
      shipping_line2: shipping.line2 || null,
      shipping_city: shipping.city,
      shipping_postcode: shipping.postcode,
      shipping_country: shipping.country || 'GB'
    })

    if (insertError) {
      console.error('extra-dogs insert:', insertError)
      return json(500, { error: 'Failed to create extra dog order' })
    }

    const successUrl =
      `${baseUrl}/dogs?pack=success&session_id={CHECKOUT_SESSION_ID}&order_id=${orderId}`
    const cancelUrl = `${baseUrl}/dogs?pack=cancelled&order_id=${orderId}`

    const params = new URLSearchParams()
    params.set('mode', 'payment')
    params.set('success_url', successUrl)
    params.set('cancel_url', cancelUrl)
    params.set('client_reference_id', orderId)
    params.set('customer_email', shipping.email || user.email || '')
    params.set('metadata[order_id]', orderId)
    params.set('metadata[user_id]', user.id)
    params.set('metadata[type]', 'extra_dog_pack')
    params.set('metadata[quantity]', String(quantity))
    params.set('metadata[paid_quantity]', String(paidQty))

    params.set('line_items[0][quantity]', String(paidQty))
    params.set('line_items[0][price_data][currency]', 'gbp')
    params.set('line_items[0][price_data][unit_amount]', String(UNIT_PRICE_CENTS))
    params.set('line_items[0][price_data][product_data][name]', 'Extra dog + NFC / QR')
    params.set(
      'line_items[0][price_data][product_data][description]',
      'Additional dog profile with NFC sticker pair and QR code'
    )

    params.set('line_items[1][quantity]', '1')
    params.set('line_items[1][price_data][currency]', 'gbp')
    params.set('line_items[1][price_data][unit_amount]', String(postageCents))
    params.set('line_items[1][price_data][product_data][name]', postageLabel)
    params.set(
      'line_items[1][price_data][product_data][description]',
      'Royal Mail stamp — one parcel for all NFC stickers in this pack'
    )

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
      console.error('Stripe extra-dog checkout error:', session)
      await admin
        .from('doghealthy_extra_dog_orders')
        .update({
          status: 'failed',
          error_message: session?.error?.message || 'Stripe checkout failed'
        })
        .eq('id', orderId)
      return json(502, { error: session?.error?.message || 'Failed to start payment' })
    }

    await admin
      .from('doghealthy_extra_dog_orders')
      .update({ stripe_checkout_session_id: session.id })
      .eq('id', orderId)

    return json(200, {
      url: session.url,
      sessionId: session.id,
      orderId,
      quantity,
      postageCents,
      subtotalCents,
      totalCents
    })
  } catch (error) {
    console.error('extra-dogs-create-checkout error:', error)
    return json(500, { error: error?.message || 'Unexpected server error' })
  }
}
