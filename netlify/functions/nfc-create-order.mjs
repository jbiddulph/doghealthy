import { createClient } from '@supabase/supabase-js'

// Accept either NFC_ME_BASE_URL or NFC_ME_API_BASE_URL from Netlify env
const NFC_API_BASE = (
  process.env.NFC_ME_BASE_URL ||
  process.env.NFC_ME_API_BASE_URL ||
  'https://nfc-me-a3a3437da95d.herokuapp.com/api/v1'
).replace(/\/$/, '')
const NFC_API_KEY = process.env.NFC_ME_API_KEY
// Must match an active product SKU in NFC Me (see GET /api/v1/products/)
const NFC_PRODUCT_SKU = (process.env.NFC_ME_PRODUCT_SKU || 'DOG-NFC-TAG').toUpperCase()
const SUPABASE_URL = process.env.SUPABASE_URL
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY
const PUBLIC_BASE_URL = process.env.NUXT_PUBLIC_BASE_URL || 'https://doghealthy.co.uk'

// Django APPEND_SLASH requires the trailing slash on POST
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

export async function handler(event) {
  if (event.httpMethod === 'OPTIONS') {
    return json(204, {})
  }

  if (event.httpMethod !== 'POST') {
    return json(405, { error: 'Method not allowed' })
  }

  try {
    if (!NFC_API_KEY) {
      return json(503, { error: 'NFC_ME_API_KEY is not configured' })
    }
    if (!SUPABASE_URL || !SUPABASE_ANON_KEY || !SUPABASE_SERVICE_ROLE_KEY) {
      return json(503, { error: 'Supabase environment is not configured' })
    }

    const authHeader = event.headers.authorization || event.headers.Authorization
    if (!authHeader?.startsWith('Bearer ')) {
      return json(401, { error: 'Missing auth token' })
    }
    const accessToken = authHeader.slice(7)

    const body = JSON.parse(event.body || '{}')
    const {
      dogIds,
      shipping,
      productSku,
      productId
    } = body

    if (!Array.isArray(dogIds) || dogIds.length === 0) {
      return json(400, { error: 'Select at least one dog' })
    }

    if (!shipping?.name || !shipping?.email || !shipping?.line1 || !shipping?.city || !shipping?.postcode) {
      return json(400, { error: 'Complete shipping details are required' })
    }

    // Verify the caller with their JWT
    const authClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      global: { headers: { Authorization: `Bearer ${accessToken}` } }
    })
    const { data: userData, error: userError } = await authClient.auth.getUser()
    if (userError || !userData?.user) {
      return json(401, { error: 'Invalid or expired session' })
    }
    const user = userData.user

    // Service role for ownership checks + order writes that need elevated update
    const admin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

    // Resolve product from shared nfcme_products table (user choice, else env default)
    let productQuery = admin
      .from('nfcme_products')
      .select('id, sku, name, unit_price_cents, currency, min_order_qty, is_active')
      .eq('is_active', true)

    if (productId) {
      productQuery = productQuery.eq('id', productId)
    } else {
      const requestedSku = String(productSku || NFC_PRODUCT_SKU).trim().toUpperCase()
      productQuery = productQuery.eq('sku', requestedSku)
    }

    const { data: productRows, error: productError } = await productQuery.limit(1)
    if (productError) {
      console.error('Product lookup error:', productError)
      return json(500, { error: 'Failed to look up NFC product' })
    }

    const product = productRows?.[0]
    if (!product) {
      return json(400, {
        error: `Unknown or inactive product: ${productSku || productId || NFC_PRODUCT_SKU}`
      })
    }

    const { data: dogs, error: dogsError } = await admin
      .from('doghealthy_dogs')
      .select('id, name, breed, photo_url, gender, color, microchip_number')
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

    const quantity = dogs.length
    const minQty = Number(product.min_order_qty || 1)
    if (quantity < minQty) {
      return json(400, {
        error: `Minimum order quantity for ${product.sku} is ${minQty}. Select at least ${minQty} dogs, or choose a different product.`
      })
    }

    const orderId = crypto.randomUUID()
    const profileBase = PUBLIC_BASE_URL.replace(/\/$/, '')
    const profileLines = dogs.map(
      (dog) => `${dog.name}: ${profileBase}/dogs/${dog.id}`
    )

    // Payload shape from NFC Me docs (POST /api/v1/orders/)
    const nfcPayload = {
      external_reference: orderId,
      items: [
        {
          sku: product.sku,
          quantity
        }
      ],
      shipping: {
        name: shipping.name,
        line1: shipping.line1,
        line2: shipping.line2 || null,
        city: shipping.city,
        postal_code: shipping.postcode,
        country: shipping.country || 'GB'
      },
      notes: [
        `DogHealthy order for ${shipping.email}`,
        `Phone: ${shipping.phone || 'n/a'}`,
        'Profile URLs:',
        ...profileLines
      ].join('\n')
    }

    // Create local order first
    const { error: insertError } = await admin
      .from('doghealthy_nfc_orders')
      .insert({
        id: orderId,
        user_id: user.id,
        dog_ids: dogIds,
        status: 'pending',
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

    // Forward to nfc-me (supports X-API-Key or Bearer)
    const nfcResponse = await fetch(NFC_ORDERS_URL, {
      method: 'POST',
      headers: {
        'X-API-Key': NFC_API_KEY,
        Authorization: `Bearer ${NFC_API_KEY}`,
        'Content-Type': 'application/json',
        Accept: 'application/json'
      },
      body: JSON.stringify(nfcPayload)
    })

    const responseText = await nfcResponse.text()
    let responseJson = null
    try {
      responseJson = responseText ? JSON.parse(responseText) : null
    } catch {
      responseJson = { raw: responseText }
    }

    if (!nfcResponse.ok) {
      await admin
        .from('doghealthy_nfc_orders')
        .update({
          status: 'failed',
          response_payload: responseJson,
          error_message: `NFC API error ${nfcResponse.status}`
        })
        .eq('id', orderId)

      return json(502, {
        error: 'Failed to submit order to NFC provider',
        details: responseJson,
        orderId
      })
    }

    const remoteOrder =
      responseJson?.order ||
      responseJson
    const remoteOrderId =
      remoteOrder?.id ||
      remoteOrder?.order_number ||
      responseJson?.id ||
      responseJson?.order_id ||
      null

    await admin
      .from('doghealthy_nfc_orders')
      .update({
        status: 'submitted',
        nfc_me_order_id: remoteOrderId ? String(remoteOrderId) : null,
        response_payload: responseJson
      })
      .eq('id', orderId)

    // Mark selected dogs as NFC-enabled and ensure one active tag each
    const nowIso = new Date().toISOString()
    await admin
      .from('doghealthy_dogs')
      .update({
        nfc_tag_enabled: true,
        nfc_ordered_at: nowIso
      })
      .in('id', dogIds)
      .eq('user_id', user.id)

    for (const dog of dogs) {
      const { data: existingTag } = await admin
        .from('doghealthy_tags')
        .select('id')
        .eq('pet_id', dog.id)
        .eq('status', 'active')
        .maybeSingle()

      if (!existingTag) {
        await admin.from('doghealthy_tags').insert({
          uid: crypto.randomUUID().replace(/-/g, '').slice(0, 16),
          pet_id: dog.id,
          status: 'active',
          manufacturer_id: product.sku,
          activated_at: nowIso
        })
      }
    }

    return json(200, {
      success: true,
      orderId,
      nfcMeOrderId: remoteOrderId,
      product: {
        id: product.id,
        sku: product.sku,
        name: product.name
      },
      dogs: dogs.map((d) => ({
        id: d.id,
        name: d.name,
        profileUrl: `${profileBase}/dogs/${d.id}`
      }))
    })
  } catch (error) {
    console.error('nfc-create-order error:', error)
    return json(500, { error: error?.message || 'Unexpected server error' })
  }
}
