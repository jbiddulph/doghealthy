import { createClient } from '@supabase/supabase-js'
import crypto from 'node:crypto'
import { stripeSubscriptionPeriodEndUnix } from './_lib/subscription.mjs'

const SUPABASE_URL = process.env.SUPABASE_URL
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY
const STRIPE_SECRET_KEY = (process.env.STRIPE_SECRET_KEY || '').trim()
const STRIPE_WEBHOOK_SECRET = (process.env.STRIPE_WEBHOOK_SECRET || '').trim()

const json = (statusCode, body) => ({
  statusCode,
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(body)
})

/**
 * Verify Stripe-Signature (HMAC SHA256) without the Stripe SDK.
 * Header format: t=timestamp,v1=signature[,v1=...]
 */
function verifyStripeSignature(rawBody, signatureHeader, secret) {
  if (!rawBody || !signatureHeader || !secret) return false
  const parts = Object.fromEntries(
    signatureHeader.split(',').map((p) => {
      const [k, ...rest] = p.trim().split('=')
      return [k, rest.join('=')]
    })
  )
  const timestamp = parts.t
  const signatures = signatureHeader
    .split(',')
    .filter((p) => p.trim().startsWith('v1='))
    .map((p) => p.trim().slice(3))

  if (!timestamp || !signatures.length) return false

  // Reject timestamps older than 5 minutes
  const age = Math.abs(Math.floor(Date.now() / 1000) - Number(timestamp))
  if (!Number.isFinite(age) || age > 300) return false

  const signedPayload = `${timestamp}.${rawBody}`
  const expected = crypto.createHmac('sha256', secret).update(signedPayload, 'utf8').digest('hex')

  return signatures.some((sig) => {
    try {
      const a = Buffer.from(expected, 'hex')
      const b = Buffer.from(sig, 'hex')
      return a.length === b.length && crypto.timingSafeEqual(a, b)
    } catch {
      return false
    }
  })
}

async function applyUserSubscription(session) {
  const userId = session.metadata?.user_id
  const subscriptionType = session.metadata?.subscription_type || 'monthly'
  if (!userId || !session.subscription) return

  const subscriptionId =
    typeof session.subscription === 'string' ? session.subscription : session.subscription.id

  let status = 'active'
  let periodEnd = null
  const subRes = await fetch(`https://api.stripe.com/v1/subscriptions/${encodeURIComponent(subscriptionId)}`, {
    headers: { Authorization: `Bearer ${STRIPE_SECRET_KEY}` }
  })
  const sub = await subRes.json().catch(() => ({}))
  if (subRes.ok) {
    status = sub.status || 'active'
    const periodUnix = stripeSubscriptionPeriodEndUnix(sub)
    if (periodUnix) periodEnd = new Date(periodUnix * 1000).toISOString()
  }

  const customerId = typeof session.customer === 'string' ? session.customer : session.customer?.id
  const admin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
  const { error } = await admin
    .from('doghealthy_users')
    .update({
      stripe_customer_id: customerId || null,
      stripe_subscription_id: subscriptionId,
      subscription_status: status,
      subscription_plan: subscriptionType,
      subscription_current_period_end: periodEnd
    })
    .eq('id', userId)

  if (error) {
    console.error('stripe-webhook user update:', error)
    throw error
  }
}

/**
 * Stripe webhook endpoint for Netlify static deploys.
 * Point Stripe Dashboard → Developers → Webhooks to:
 *   https://doghealthy.co.uk/.netlify/functions/stripe-webhook
 * Events: checkout.session.completed, customer.subscription.updated, customer.subscription.deleted
 */
export async function handler(event) {
  if (event.httpMethod !== 'POST') return json(405, { error: 'Method not allowed' })

  try {
    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY || !STRIPE_SECRET_KEY) {
      return json(503, { error: 'Server not configured' })
    }
    if (!STRIPE_WEBHOOK_SECRET) {
      return json(503, { error: 'STRIPE_WEBHOOK_SECRET is not configured' })
    }

    const signature = event.headers['stripe-signature'] || event.headers['Stripe-Signature']
    const rawBody = event.isBase64Encoded
      ? Buffer.from(event.body || '', 'base64').toString('utf8')
      : event.body || ''

    if (!verifyStripeSignature(rawBody, signature, STRIPE_WEBHOOK_SECRET)) {
      return json(400, { error: 'Invalid signature' })
    }

    const stripeEvent = JSON.parse(rawBody)

    if (stripeEvent.type === 'checkout.session.completed') {
      const session = stripeEvent.data.object
      if (session.metadata?.subscription_type && session.metadata?.user_id) {
        await applyUserSubscription(session)
      }
    }

    if (
      stripeEvent.type === 'customer.subscription.updated' ||
      stripeEvent.type === 'customer.subscription.deleted'
    ) {
      const sub = stripeEvent.data.object
      const userId = sub.metadata?.user_id
      if (userId) {
        const admin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
        const periodUnix = stripeSubscriptionPeriodEndUnix(sub)
        const periodEnd = periodUnix ? new Date(periodUnix * 1000).toISOString() : null
        await admin
          .from('doghealthy_users')
          .update({
            subscription_status: sub.status,
            subscription_current_period_end: periodEnd,
            stripe_subscription_id: sub.id
          })
          .eq('id', userId)
      }
    }

    return json(200, { received: true })
  } catch (error) {
    console.error('stripe-webhook error:', error)
    return json(500, { error: error?.message || 'Webhook failed' })
  }
}
