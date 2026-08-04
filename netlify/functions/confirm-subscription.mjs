import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = process.env.SUPABASE_URL
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY
const STRIPE_SECRET_KEY = (process.env.STRIPE_SECRET_KEY || '').trim()

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
 * After Stripe Checkout success, verify the session and mark the user subscribed in DB.
 * Body: { sessionId: string }
 * Also works when webhooks are not configured yet (useful for sandbox testing).
 */
export async function handler(event) {
  if (event.httpMethod === 'OPTIONS') return json(204, {})
  if (event.httpMethod !== 'POST') return json(405, { error: 'Method not allowed' })

  try {
    if (!SUPABASE_URL || !SUPABASE_ANON_KEY || !SUPABASE_SERVICE_ROLE_KEY) {
      return json(503, { error: 'Supabase is not configured' })
    }
    if (!STRIPE_SECRET_KEY) {
      return json(503, { error: 'STRIPE_SECRET_KEY is not configured' })
    }

    const authHeader = event.headers.authorization || event.headers.Authorization
    if (!authHeader?.startsWith('Bearer ')) {
      return json(401, { error: 'Missing auth token' })
    }
    const accessToken = authHeader.slice(7)

    const body = JSON.parse(event.body || '{}')
    const sessionId = String(body.sessionId || '').trim()
    if (!sessionId.startsWith('cs_')) {
      return json(400, { error: 'sessionId is required' })
    }

    const authClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      global: { headers: { Authorization: `Bearer ${accessToken}` } }
    })
    const { data: userData, error: userError } = await authClient.auth.getUser()
    if (userError || !userData?.user) {
      return json(401, { error: 'Invalid or expired session' })
    }
    const user = userData.user

    const response = await fetch(
      `https://api.stripe.com/v1/checkout/sessions/${encodeURIComponent(sessionId)}?expand[]=subscription`,
      {
        headers: { Authorization: `Bearer ${STRIPE_SECRET_KEY}` }
      }
    )
    const session = await response.json().catch(() => ({}))
    if (!response.ok) {
      console.error('Stripe session retrieve error:', session)
      return json(502, { error: session?.error?.message || 'Failed to verify payment session' })
    }

    if (session.payment_status !== 'paid' && session.status !== 'complete') {
      return json(402, { error: 'Payment is not complete yet' })
    }

    const metaUserId = session.metadata?.user_id || session.client_reference_id
    if (metaUserId && metaUserId !== user.id) {
      return json(403, { error: 'This checkout session belongs to another account' })
    }

    const plan =
      session.metadata?.subscription_type ||
      session.subscription?.metadata?.subscription_type ||
      'monthly'

    let subscriptionStatus = 'active'
    let subscriptionId = typeof session.subscription === 'string' ? session.subscription : session.subscription?.id
    let periodEnd = null
    let customerId = typeof session.customer === 'string' ? session.customer : session.customer?.id

    if (session.subscription && typeof session.subscription === 'object') {
      subscriptionStatus = session.subscription.status || 'active'
      subscriptionId = session.subscription.id
      if (session.subscription.current_period_end) {
        periodEnd = new Date(session.subscription.current_period_end * 1000).toISOString()
      }
    } else if (subscriptionId) {
      const subRes = await fetch(
        `https://api.stripe.com/v1/subscriptions/${encodeURIComponent(subscriptionId)}`,
        { headers: { Authorization: `Bearer ${STRIPE_SECRET_KEY}` } }
      )
      const sub = await subRes.json().catch(() => ({}))
      if (subRes.ok) {
        subscriptionStatus = sub.status || 'active'
        if (sub.current_period_end) {
          periodEnd = new Date(sub.current_period_end * 1000).toISOString()
        }
        if (!customerId && sub.customer) {
          customerId = typeof sub.customer === 'string' ? sub.customer : sub.customer.id
        }
      }
    }

    const admin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
    const { error: updateError } = await admin
      .from('doghealthy_users')
      .update({
        stripe_customer_id: customerId || null,
        stripe_subscription_id: subscriptionId || null,
        subscription_status: subscriptionStatus,
        subscription_plan: plan,
        subscription_current_period_end: periodEnd
      })
      .eq('id', user.id)

    if (updateError) {
      console.error('confirm-subscription user update:', updateError)
      return json(500, { error: 'Payment succeeded but failed to update your account' })
    }

    return json(200, {
      ok: true,
      subscriptionStatus,
      plan,
      periodEnd
    })
  } catch (error) {
    console.error('confirm-subscription error:', error)
    return json(500, { error: error?.message || 'Unexpected server error' })
  }
}
