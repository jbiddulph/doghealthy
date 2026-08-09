import { createClient } from '@supabase/supabase-js'
import { NFC_API_KEY, submitNfcMeOrder } from './_lib/nfc-me.mjs'
import { formatShipLine, notifyAdmins } from './_lib/admin-notify.mjs'

const SUPABASE_URL = process.env.SUPABASE_URL
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY
const STRIPE_SECRET_KEY = (process.env.STRIPE_SECRET_KEY || '').trim()
const PUBLIC_BASE_URL = (process.env.NUXT_PUBLIC_BASE_URL || 'https://doghealthy.co.uk').replace(/\/$/, '')

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

/**
 * After Stripe Checkout success: mark order paid and submit to NFC Me (once).
 * Body: { sessionId: string, orderId?: string }
 */
export async function handler(event) {
  if (event.httpMethod === 'OPTIONS') return json(204, {})
  if (event.httpMethod !== 'POST') return json(405, { error: 'Method not allowed' })

  try {
    if (!NFC_API_KEY || !STRIPE_SECRET_KEY || !SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
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
      .from('doghealthy_nfc_orders')
      .select('*')
      .eq('id', orderId)
      .maybeSingle()

    if (orderError || !order) return json(404, { error: 'Order not found' })
    if (authedUserId && order.user_id !== authedUserId) {
      return json(403, { error: 'This order belongs to another account' })
    }

    // Already submitted — idempotent success
    if (order.status === 'submitted' && order.payment_status === 'paid') {
      return json(200, { ok: true, orderId, alreadyProcessed: true })
    }

    const paymentIntent =
      typeof session.payment_intent === 'string' ? session.payment_intent : session.payment_intent?.id

    await admin
      .from('doghealthy_nfc_orders')
      .update({
        payment_status: 'paid',
        paid_at: new Date().toISOString(),
        stripe_checkout_session_id: sessionId,
        stripe_payment_intent_id: paymentIntent || null,
        status: 'paid'
      })
      .eq('id', orderId)

    const nfcPayload = order.request_payload
    if (!nfcPayload) return json(500, { error: 'Order is missing NFC payload' })

    const submitted = await submitNfcMeOrder(nfcPayload, order.product_sku)
    if (!submitted.ok) {
      const detail =
        submitted.json?.error ||
        submitted.json?.detail ||
        submitted.json?.message ||
        `NFC API error ${submitted.status}`
      await admin
        .from('doghealthy_nfc_orders')
        .update({
          status: 'failed',
          response_payload: submitted.json,
          error_message: String(detail),
          request_payload: submitted.payload || nfcPayload
        })
        .eq('id', orderId)

      await notifyAdmins(admin, {
        type: 'nfc_order',
        referenceId: orderId,
        title: 'NFC payment received — fulfilment failed',
        message: `${formatShipLine(order)}. ${order.tag_quantity || 0} stickers. ${detail}`
      })

      return json(502, {
        error: 'Payment succeeded but NFC fulfilment failed — support will retry',
        orderId,
        details: submitted.json
      })
    }

    await admin
      .from('doghealthy_nfc_orders')
      .update({
        status: 'submitted',
        nfc_me_order_id: submitted.nfcMeOrderId,
        response_payload: submitted.json,
        request_payload: submitted.payload || nfcPayload,
        error_message: null
      })
      .eq('id', orderId)

    await notifyAdmins(admin, {
      type: 'nfc_order',
      referenceId: orderId,
      title: 'NFC order sent to NFC Me',
      message: `${formatShipLine(order)}. ${order.dog_ids?.length || 0} dog(s) × ${order.tags_per_dog || 2} = ${order.tag_quantity || 0} stickers. NFC Me #${submitted.nfcMeOrderId || '—'}.`
    })

    const dogIds = order.dog_ids || []
    const nowIso = new Date().toISOString()
    if (dogIds.length) {
      await admin
        .from('doghealthy_dogs')
        .update({ nfc_tag_enabled: true, nfc_ordered_at: nowIso })
        .in('id', dogIds)
        .eq('user_id', order.user_id)

      const { data: dogs } = await admin
        .from('doghealthy_dogs')
        .select('id')
        .in('id', dogIds)

      for (const dog of dogs || []) {
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
            manufacturer_id: order.product_sku || null,
            activated_at: nowIso
          })
        }
      }
    }

    return json(200, {
      ok: true,
      orderId,
      nfcMeOrderId: submitted.nfcMeOrderId,
      tagQuantity: order.tag_quantity,
      dogCount: dogIds.length,
      orderType: order.order_type
    })
  } catch (error) {
    console.error('nfc-confirm-order error:', error)
    return json(500, { error: error?.message || 'Unexpected server error' })
  }
}
