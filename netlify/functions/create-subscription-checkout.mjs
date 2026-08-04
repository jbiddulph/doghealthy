import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = process.env.SUPABASE_URL
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY
const DEFAULT_BASE_URL = (process.env.NUXT_PUBLIC_BASE_URL || 'https://doghealthy.co.uk').replace(/\/$/, '')

const ALLOWED_RETURN_HOSTS = new Set([
  'doghealthy.co.uk',
  'www.doghealthy.co.uk',
  'doghealthy.netlify.app'
])

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

function stripeKeyMode(secret) {
  if (secret.startsWith('sk_test_')) return 'test'
  if (secret.startsWith('sk_live_')) return 'live'
  return 'unknown'
}

/**
 * Prefer the browser Origin/Referer so Stripe returns users to the same host
 * they started on (doghealthy.co.uk vs netlify.app). Auth cookies do not
 * transfer across those hosts.
 */
function resolveReturnBaseUrl(event) {
  const headers = event.headers || {}
  const origin = headers.origin || headers.Origin || ''
  const referer = headers.referer || headers.Referer || ''

  for (const candidate of [origin, referer]) {
    if (!candidate) continue
    try {
      const url = new URL(candidate)
      if (ALLOWED_RETURN_HOSTS.has(url.hostname)) {
        return `${url.protocol}//${url.host}`
      }
    } catch {
      // ignore
    }
  }
  return DEFAULT_BASE_URL
}

/**
 * Create a Stripe Checkout Session (subscription) for DogHealthy.
 * Body: { plan: 'monthly' | 'yearly', next?: string }
 *
 * STRIPE_MODE=live requires sk_live_…; STRIPE_MODE=test requires sk_test_….
 * If STRIPE_MODE is unset, the key prefix decides the mode.
 */
export async function handler(event) {
  if (event.httpMethod === 'OPTIONS') return json(204, {})
  if (event.httpMethod !== 'POST') return json(405, { error: 'Method not allowed' })

  try {
    if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
      return json(503, { error: 'Supabase is not configured' })
    }

    const STRIPE_SECRET_KEY = resolveStripeSecret()
    if (!STRIPE_SECRET_KEY || STRIPE_SECRET_KEY.includes('REPLACE_ME')) {
      return json(503, {
        error:
          'STRIPE_SECRET_KEY is not set. Add sk_live_… (production) or sk_test_… (sandbox) in Netlify Environment variables and redeploy.'
      })
    }

    const keyMode = stripeKeyMode(STRIPE_SECRET_KEY)
    const forcedMode = String(process.env.STRIPE_MODE || '').trim().toLowerCase()

    if (forcedMode === 'live' && keyMode !== 'live') {
      return json(503, {
        error:
          'STRIPE_MODE=live but STRIPE_SECRET_KEY is not a LIVE key. Set STRIPE_SECRET_KEY to sk_live_… from https://dashboard.stripe.com/apikeys (Test mode OFF) and redeploy.',
        mode: keyMode
      })
    }

    if (forcedMode === 'test' && keyMode !== 'test') {
      return json(503, {
        error:
          'STRIPE_MODE=test but STRIPE_SECRET_KEY is not a TEST key. Set STRIPE_SECRET_KEY to sk_test_… or set STRIPE_MODE=live for production.',
        mode: keyMode
      })
    }

    if (keyMode === 'unknown') {
      return json(503, {
        error: 'STRIPE_SECRET_KEY must start with sk_test_ or sk_live_.',
        mode: keyMode
      })
    }

    const authHeader = event.headers.authorization || event.headers.Authorization
    if (!authHeader?.startsWith('Bearer ')) {
      return json(401, { error: 'Missing auth token' })
    }
    const accessToken = authHeader.slice(7)

    const body = JSON.parse(event.body || '{}')
    const plan = body.plan === 'yearly' ? 'yearly' : body.plan === 'monthly' ? 'monthly' : null
    if (!plan) return json(400, { error: 'plan must be monthly or yearly' })

    const next =
      typeof body.next === 'string' && body.next.startsWith('/') ? body.next : ''

    const authClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      global: { headers: { Authorization: `Bearer ${accessToken}` } }
    })
    const { data: userData, error: userError } = await authClient.auth.getUser()
    if (userError || !userData?.user) {
      return json(401, { error: 'Invalid or expired session' })
    }
    const user = userData.user

    const isMonthly = plan === 'monthly'
    const unitAmount = isMonthly ? 650 : 7000
    const interval = isMonthly ? 'month' : 'year'
    const baseUrl = resolveReturnBaseUrl(event)

    // Dedicated success page has NO auth middleware — confirm runs before any login redirect.
    const successUrl =
      `${baseUrl}/billing/success?session_id={CHECKOUT_SESSION_ID}` +
      (next ? `&next=${encodeURIComponent(next)}` : '')
    const cancelUrl = `${baseUrl}/billing/subscribe?subscription=cancelled${
      next ? `&next=${encodeURIComponent(next)}` : ''
    }`

    const params = new URLSearchParams()
    params.set('mode', 'subscription')
    params.set('success_url', successUrl)
    params.set('cancel_url', cancelUrl)
    params.set('client_reference_id', user.id)
    params.set('metadata[user_id]', user.id)
    params.set('metadata[subscription_type]', plan)
    params.set('subscription_data[metadata][user_id]', user.id)
    params.set('subscription_data[metadata][subscription_type]', plan)
    params.append('payment_method_types[0]', 'card')
    // PayPal is available in Checkout when enabled on the Stripe account; card is always included.
    params.append('payment_method_types[1]', 'paypal')
    params.set('line_items[0][quantity]', '1')
    params.set('line_items[0][price_data][currency]', 'gbp')
    params.set('line_items[0][price_data][unit_amount]', String(unitAmount))
    params.set('line_items[0][price_data][recurring][interval]', interval)
    params.set(
      'line_items[0][price_data][product_data][name]',
      isMonthly ? 'DogHealthy Monthly Subscription' : 'DogHealthy Yearly Subscription'
    )
    params.set(
      'line_items[0][price_data][product_data][description]',
      'Unlimited dogs, health records, and NFC / QR tags.'
    )
    if (user.email) {
      params.set('customer_email', user.email)
    }

    const response = await fetch('https://api.stripe.com/v1/checkout/sessions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${STRIPE_SECRET_KEY}`,
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: params.toString()
    })

    const session = await response.json().catch(() => ({}))
    if (!response.ok) {
      // Retry without PayPal if the account does not support it yet
      if (String(session?.error?.message || '').toLowerCase().includes('paypal')) {
        params.delete('payment_method_types[1]')
        const retry = await fetch('https://api.stripe.com/v1/checkout/sessions', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${STRIPE_SECRET_KEY}`,
            'Content-Type': 'application/x-www-form-urlencoded'
          },
          body: params.toString()
        })
        const retrySession = await retry.json().catch(() => ({}))
        if (!retry.ok) {
          console.error('Stripe checkout create error:', retrySession)
          return json(502, {
            error: retrySession?.error?.message || 'Failed to create Stripe Checkout session',
            mode: keyMode
          })
        }
        const sessionMode = String(retrySession.id || '').startsWith('cs_test_')
          ? 'test'
          : String(retrySession.id || '').startsWith('cs_live_')
            ? 'live'
            : keyMode
        return json(200, {
          url: retrySession.url,
          sessionId: retrySession.id,
          mode: sessionMode,
          returnBase: baseUrl
        })
      }

      console.error('Stripe checkout create error:', session)
      return json(502, {
        error: session?.error?.message || 'Failed to create Stripe Checkout session',
        mode: keyMode
      })
    }

    const sessionMode = String(session.id || '').startsWith('cs_test_')
      ? 'test'
      : String(session.id || '').startsWith('cs_live_')
        ? 'live'
        : keyMode

    return json(200, {
      url: session.url,
      sessionId: session.id,
      mode: sessionMode,
      returnBase: baseUrl
    })
  } catch (error) {
    console.error('create-subscription-checkout error:', error)
    return json(500, { error: error?.message || 'Unexpected server error' })
  }
}
