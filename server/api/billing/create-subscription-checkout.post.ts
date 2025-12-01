import Stripe from 'stripe'

const getStripeInstance = () => {
  const secretKey = process.env.STRIPE_SECRET_KEY
  if (!secretKey) {
    throw new Error('STRIPE_SECRET_KEY environment variable is not set')
  }
  return new Stripe(secretKey, {
    apiVersion: '2023-10-16'
  })
}

export default defineEventHandler(async (event) => {
  try {
    const auth = event.context.auth

    if (!auth?.user) {
      throw createError({
        statusCode: 401,
        statusMessage: 'Not authenticated'
      })
    }

    const body = await readBody<{ plan: 'monthly' | 'yearly' }>(event)

    if (!body?.plan || !['monthly', 'yearly'].includes(body.plan)) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Invalid plan type'
      })
    }

    let stripe: Stripe
    try {
      stripe = getStripeInstance()
    } catch (error) {
      throw createError({
        statusCode: 503,
        statusMessage: 'Payment service not configured. Please contact support.'
      })
    }

    // Determine pricing for the selected plan
    const isMonthly = body.plan === 'monthly'

    const unitAmount = isMonthly ? 650 : 7000 // values are in pence
    const interval: 'month' | 'year' = isMonthly ? 'month' : 'year'

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'gbp',
            recurring: {
              interval
            },
            product_data: {
              name: isMonthly ? 'DogHealthy Monthly Subscription' : 'DogHealthy Yearly Subscription',
              description: 'Unlimited dog profiles and full health tracking features.'
            },
            unit_amount: unitAmount
          },
          quantity: 1
        }
      ],
      success_url: `${process.env.NUXT_PUBLIC_BASE_URL || ''}/dogs/new?subscription=success`,
      cancel_url: `${process.env.NUXT_PUBLIC_BASE_URL || ''}/billing/subscribe?subscription=cancelled`,
      metadata: {
        user_id: auth.user.id,
        subscription_type: body.plan
      }
    })

    return {
      url: session.url
    }
  } catch (error: any) {
    console.error('Error creating subscription checkout:', error)

    if (error.statusCode) {
      throw error
    }

    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to create subscription checkout session'
    })
  }
})


