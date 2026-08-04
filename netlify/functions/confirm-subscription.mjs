import { createClient } from '@supabase/supabase-js'

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

function resolveStripeSecret() {
  return String(process.env.STRIPE_SECRET_KEY || '').trim()
}

/**
 * After Stripe Checkout success, verify the session and mark the user subscribed in DB.
 * Body: { sessionId: string }
 *
 * Auth is preferred but not required: a paid Checkout session id is enough to activate
 * the user_id stored in session metadata (PayPal returns can drop the browser session).
 */
export async function handler(event) {
  if (event.httpMethod === 'OPTIONS') return json(204, {})
  if (event.httpMethod !== 'POST') return json(405, { error: 'Method not allowed' })

  try {
    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      return json(503, { error: 'Supabase is not configured' })
    }
    const STRIPE_SECRET_KEY = resolveStripeSecret()
    if (!STRIPE_SECRET_KEY) {
      return json(503, { error: 'STRIPE_SECRET_KEY is not configured' })
    }

    const body = JSON.parse(event.body || '{}')
    const sessionId = String(body.sessionId || '').trim()
    if (!sessionId.startsWith('cs_')) {
      return json(400, { error: 'sessionId is required' })
    }

    let authedUserId = null
    const authHeader = event.headers.authorization || event.headers.Authorization
    if (authHeader?.startsWith('Bearer ') && SUPABASE_ANON_KEY) {
      const accessToken = authHeader.slice(7)
      const authClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
        global: { headers: { Authorization: `Bearer ${accessToken}` } }
      })
      const { data: userData } = await authClient.auth.getUser()
      authedUserId = userData?.user?.id || null
    }

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

    // PayPal / async methods may be complete with paid, or unpaid briefly while processing
    const okStatus =
      session.status === 'complete' ||
      session.payment_status === 'paid' ||
      session.payment_status === 'no_payment_required'
    if (!okStatus) {
      return json(402, {
        error: 'Payment is not complete yet',
        payment_status: session.payment_status,
        status: session.status
      })
    }

    const metaUserId = session.metadata?.user_id || session.client_reference_id
    if (!metaUserId) {
      return json(400, { error: 'Checkout session is missing user metadata' })
    }

    if (authedUserId && authedUserId !== metaUserId) {
      return json(403, { error: 'This checkout session belongs to another account' })
    }

    const userId = metaUserId
    const plan =
      session.metadata?.subscription_type ||
      session.subscription?.metadata?.subscription_type ||
      'monthly'

    let subscriptionStatus = 'active'
    let subscriptionId =
      typeof session.subscription === 'string' ? session.subscription : session.subscription?.id
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

    // If Stripe has not attached a period end yet, grant 31 days so limits unlock immediately
    if (!periodEnd) {
      periodEnd = new Date(Date.now() + 31 * 24 * 60 * 60 * 1000).toISOString()
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
      .eq('id', userId)

    if (updateError) {
      console.error('confirm-subscription user update:', updateError)
      return json(500, { error: 'Payment succeeded but failed to update your account' })
    }

    return json(200, {
      ok: true,
      subscriptionStatus,
      plan,
      periodEnd,
      userId,
      authenticated: Boolean(authedUserId)
    })
  } catch (error) {
    console.error('confirm-subscription error:', error)
    return json(500, { error: error?.message || 'Unexpected server error' })
  }
}
