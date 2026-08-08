import { createClient } from '@supabase/supabase-js'
import { createPlaceholderDogs } from './_lib/extra-dogs.mjs'

const NFC_API_BASE = (
  process.env.NFC_ME_BASE_URL ||
  process.env.NFC_ME_API_BASE_URL ||
  'https://nfc-me-a3a3437da95d.herokuapp.com/api/v1'
).replace(/\/$/, '')
const NFC_API_KEY = process.env.NFC_ME_API_KEY
const NFC_PRODUCT_SKU = (process.env.NFC_ME_PRODUCT_SKU || 'NFC-WHITE-25MM').toUpperCase()
const SUPABASE_URL = process.env.SUPABASE_URL
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY
const STRIPE_SECRET_KEY = (process.env.STRIPE_SECRET_KEY || '').trim()
const PUBLIC_BASE_URL = (process.env.NUXT_PUBLIC_BASE_URL || 'https://doghealthy.co.uk').replace(/\/$/, '')
const NFC_ORDERS_URL = `${NFC_API_BASE}/orders/`
const TAGS_PER_DOG = 2

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

export async function fulfilExtraDogOrder(admin, order) {
  if (order.status === 'fulfilled' && Array.isArray(order.dog_ids) && order.dog_ids.length) {
    return { alreadyProcessed: true, dogIds: order.dog_ids, names: [] }
  }

  const unitPrice = Number(order.unit_price_cents) || 200
  const paidQty = Math.max(0, Math.round((Number(order.subtotal_cents) || 0) / unitPrice))
  const created = await createPlaceholderDogs(admin, {
    userId: order.user_id,
    quantity: order.quantity,
    nfcCount: paidQty
  })
  const dogIds = created.dogIds
  const names = created.names
  const nowIso = created.nowIso
  const nfcDogs = created.nfcDogs || []

  let nfcMeOrderId = order.nfc_me_order_id || null
  let nfcError = null

  if (NFC_API_KEY && nfcDogs.length) {
    const profileLines = nfcDogs.map(
      (dog) => `${dog.name}: ${PUBLIC_BASE_URL}/dogs/${dog.id}`
    )
    const stickerQty = nfcDogs.length * TAGS_PER_DOG
    const nfcPayload = {
      external_reference: order.id,
      items: [{ sku: NFC_PRODUCT_SKU, quantity: stickerQty }],
      shipping: {
        name: order.shipping_name,
        line1: order.shipping_line1,
        line2: order.shipping_line2 || null,
        city: order.shipping_city,
        postal_code: order.shipping_postcode,
        country: order.shipping_country || 'GB'
      },
      notes: [
        `DogHealthy extra-dog pack for ${order.shipping_email}`,
        `Phone: ${order.shipping_phone || 'n/a'}`,
        `Dogs: ${nfcDogs.length} × ${TAGS_PER_DOG} stickers = ${stickerQty}`,
        'Profile URLs:',
        ...profileLines
      ].join('\n')
    }

    try {
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
      if (nfcResponse.ok) {
        const remote = responseJson?.order || responseJson
        nfcMeOrderId =
          remote?.id || remote?.order_number || responseJson?.id || responseJson?.order_id || null
        if (nfcMeOrderId) nfcMeOrderId = String(nfcMeOrderId)
      } else {
        nfcError = `NFC API error ${nfcResponse.status}`
      }
    } catch (err) {
      nfcError = err?.message || 'NFC fulfilment failed'
    }
  }

  await admin
    .from('doghealthy_extra_dog_orders')
    .update({
      status: 'fulfilled',
      payment_status: 'paid',
      dog_ids: dogIds,
      nfc_me_order_id: nfcMeOrderId,
      error_message: nfcError,
      fulfilled_at: nowIso
    })
    .eq('id', order.id)

  return { alreadyProcessed: false, dogIds, names, nfcMeOrderId, nfcError }
}

/**
 * After Stripe Checkout: create placeholder dogs + NFC/QR tags.
 * Body: { sessionId: string }
 */
export async function handler(event) {
  if (event.httpMethod === 'OPTIONS') return json(204, {})
  if (event.httpMethod !== 'POST') return json(405, { error: 'Method not allowed' })

  try {
    if (!STRIPE_SECRET_KEY || !SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      return json(503, { error: 'Server not configured' })
    }

    const body = JSON.parse(event.body || '{}')
    const sessionId = String(body.sessionId || '').trim()
    if (!sessionId.startsWith('cs_')) return json(400, { error: 'sessionId is required' })

    let authedUserId = null
    const authHeader = event.headers.authorization || event.headers.Authorization
    if (authHeader?.startsWith('Bearer ') && SUPABASE_ANON_KEY) {
      const authClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
        global: { headers: { Authorization: `Bearer ${authHeader.slice(7)}` } }
      })
      const { data } = await authClient.auth.getUser()
      authedUserId = data?.user?.id || null
    }

    const stripeRes = await fetch(
      `https://api.stripe.com/v1/checkout/sessions/${encodeURIComponent(sessionId)}`,
      { headers: { Authorization: `Bearer ${STRIPE_SECRET_KEY}` } }
    )
    const session = await stripeRes.json().catch(() => ({}))
    if (!stripeRes.ok) {
      return json(502, { error: session?.error?.message || 'Failed to verify payment' })
    }

    if (session.payment_status !== 'paid' && session.status !== 'complete') {
      return json(402, { error: 'Payment is not complete yet' })
    }

    const orderId = session.metadata?.order_id || session.client_reference_id || body.orderId
    if (!orderId) return json(400, { error: 'Checkout session missing order_id' })

    const admin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
    const { data: order, error: orderError } = await admin
      .from('doghealthy_extra_dog_orders')
      .select('*')
      .eq('id', orderId)
      .maybeSingle()

    if (orderError || !order) return json(404, { error: 'Order not found' })
    if (authedUserId && order.user_id !== authedUserId) {
      return json(403, { error: 'This order belongs to another account' })
    }

    const paymentIntent =
      typeof session.payment_intent === 'string' ? session.payment_intent : session.payment_intent?.id

    await admin
      .from('doghealthy_extra_dog_orders')
      .update({
        payment_status: 'paid',
        paid_at: order.paid_at || new Date().toISOString(),
        stripe_checkout_session_id: sessionId,
        stripe_payment_intent_id: paymentIntent || null
      })
      .eq('id', orderId)

    const result = await fulfilExtraDogOrder(admin, { ...order, payment_status: 'paid' })

    return json(200, {
      ok: true,
      orderId,
      quantity: order.quantity,
      dogIds: result.dogIds,
      names: result.names,
      alreadyProcessed: result.alreadyProcessed,
      nfcMeOrderId: result.nfcMeOrderId || null
    })
  } catch (error) {
    console.error('extra-dogs-confirm error:', error)
    return json(500, { error: error?.message || 'Unexpected server error' })
  }
}
