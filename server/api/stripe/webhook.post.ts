import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'

// Initialize Stripe only if API key is available
const getStripeInstance = () => {
  const secretKey = process.env.STRIPE_SECRET_KEY
  if (!secretKey) {
    throw new Error('STRIPE_SECRET_KEY environment variable is not set')
  }
  return new Stripe(secretKey, {
    apiVersion: '2023-10-16',
  })
}

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET!

export default defineEventHandler(async (event) => {
  try {
    const body = await readRawBody(event)
    const signature = getHeader(event, 'stripe-signature')

    if (!signature || !body) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Missing signature or body'
      })
    }

    // Initialize Stripe instance
    let stripe: Stripe
    try {
      stripe = getStripeInstance()
    } catch (error) {
      throw createError({
        statusCode: 503,
        statusMessage: 'Payment service not configured'
      })
    }

    // Verify webhook signature
    let stripeEvent: Stripe.Event
    try {
      stripeEvent = stripe.webhooks.constructEvent(body, signature, endpointSecret)
    } catch (err) {
      console.error('Webhook signature verification failed:', err)
      throw createError({
        statusCode: 400,
        statusMessage: 'Invalid signature'
      })
    }

    // Handle the event
    switch (stripeEvent.type) {
      case 'checkout.session.completed':
        await handleCheckoutSessionCompleted(stripeEvent.data.object as Stripe.Checkout.Session)
        break
      case 'payment_intent.succeeded':
        console.log('PaymentIntent succeeded:', stripeEvent.data.object.id)
        break
      case 'payment_intent.payment_failed':
        console.log('PaymentIntent failed:', stripeEvent.data.object.id)
        break
      default:
        console.log(`Unhandled event type: ${stripeEvent.type}`)
    }

    return { received: true }

  } catch (error) {
    console.error('Webhook error:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Webhook processing failed'
    })
  }
})

async function handleCheckoutSessionCompleted(session: Stripe.Checkout.Session) {
  try {
    const { listing_id, upgrade_type } = session.metadata || {}
    
    if (!listing_id || !upgrade_type) {
      console.error('Missing metadata in checkout session:', session.id)
      return
    }

    // Update the listing based on upgrade type
    const updateData: any = {
      stripe_payment_id: session.payment_intent as string
    }

    if (upgrade_type === 'premium') {
      updateData.is_premium = true
    } else if (upgrade_type === 'featured') {
      updateData.is_featured = true
      // Set featured until date (30 days from now)
      const featuredUntil = new Date()
      featuredUntil.setDate(featuredUntil.getDate() + 30)
      updateData.featured_until = featuredUntil.toISOString()
    }

    const { error } = await supabase
      .from('doghealthy_listings')
      .update(updateData)
      .eq('id', listing_id)

    if (error) {
      console.error('Error updating listing after payment:', error)
      return
    }

    console.log(`Successfully upgraded listing ${listing_id} to ${upgrade_type}`)

    // Create a notification for the user
    const { error: notificationError } = await supabase
      .from('doghealthy_notifications')
      .insert({
        user_id: session.metadata?.user_id,
        type: 'upgrade',
        reference_id: listing_id,
        title: 'Listing Upgraded Successfully',
        message: `Your listing has been upgraded to ${upgrade_type}. Thank you for your payment!`,
        is_read: false
      })

    if (notificationError) {
      console.error('Error creating upgrade notification:', notificationError)
    }

  } catch (error) {
    console.error('Error handling checkout session completed:', error)
  }
}
