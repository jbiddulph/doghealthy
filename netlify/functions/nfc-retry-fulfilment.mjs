import { createClient } from '@supabase/supabase-js'
import { submitNfcMeOrder } from './_lib/nfc-me.mjs'
import { formatShipLine, notifyAdmins } from './_lib/admin-notify.mjs'

const SUPABASE_URL = process.env.SUPABASE_URL
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

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
 * Re-submit a paid NFC sticker order to NFC Me (admin or owning user).
 * Body: { orderId: string }
 */
export async function handler(event) {
  if (event.httpMethod === 'OPTIONS') return json(204, {})
  if (event.httpMethod !== 'POST') return json(405, { error: 'Method not allowed' })

  try {
    if (!SUPABASE_URL || !SUPABASE_ANON_KEY || !SUPABASE_SERVICE_ROLE_KEY) {
      return json(503, { error: 'Server not configured' })
    }

    const authHeader = event.headers.authorization || event.headers.Authorization
    if (!authHeader?.startsWith('Bearer ')) return json(401, { error: 'Missing auth token' })

    const authClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      global: { headers: { Authorization: `Bearer ${authHeader.slice(7)}` } }
    })
    const { data: userData, error: userError } = await authClient.auth.getUser()
    if (userError || !userData?.user) return json(401, { error: 'Invalid session' })

    const body = JSON.parse(event.body || '{}')
    const orderId = String(body.orderId || '').trim()
    if (!orderId) return json(400, { error: 'orderId is required' })

    const admin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
    const { data: actor } = await admin
      .from('doghealthy_users')
      .select('id, is_admin')
      .eq('id', userData.user.id)
      .maybeSingle()

    const { data: order, error: orderError } = await admin
      .from('doghealthy_nfc_orders')
      .select('*')
      .eq('id', orderId)
      .maybeSingle()

    if (orderError || !order) return json(404, { error: 'Order not found' })
    if (!actor?.is_admin && order.user_id !== userData.user.id) {
      return json(403, { error: 'Not allowed to retry this order' })
    }
    if (order.payment_status !== 'paid') {
      return json(400, { error: 'Only paid orders can be submitted to NFC Me' })
    }
    if (order.status === 'submitted' && order.nfc_me_order_id) {
      return json(200, { ok: true, alreadyProcessed: true, nfcMeOrderId: order.nfc_me_order_id })
    }
    if (!order.request_payload) return json(500, { error: 'Order is missing NFC payload' })

    const submitted = await submitNfcMeOrder(order.request_payload, order.product_sku)
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
          request_payload: submitted.payload || order.request_payload
        })
        .eq('id', orderId)
      return json(502, { error: String(detail), details: submitted.json })
    }

    await admin
      .from('doghealthy_nfc_orders')
      .update({
        status: 'submitted',
        nfc_me_order_id: submitted.nfcMeOrderId,
        response_payload: submitted.json,
        request_payload: submitted.payload || order.request_payload,
        error_message: null
      })
      .eq('id', orderId)

    await notifyAdmins(admin, {
      type: 'nfc_order',
      referenceId: orderId,
      title: 'NFC order submitted to NFC Me',
      message: `${formatShipLine(order)}. ${order.tag_quantity || 0} stickers. NFC Me #${submitted.nfcMeOrderId || '—'}.`
    })

    return json(200, { ok: true, orderId, nfcMeOrderId: submitted.nfcMeOrderId, sku: submitted.sku })
  } catch (error) {
    console.error('nfc-retry-fulfilment error:', error)
    return json(500, { error: error?.message || 'Unexpected server error' })
  }
}
