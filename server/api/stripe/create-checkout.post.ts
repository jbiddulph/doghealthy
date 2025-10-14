import Stripe from 'stripe'
import { z } from 'zod'

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

const createCheckoutSchema = z.object({
  listing_id: z.string().uuid(),
  type: z.enum(['premium', 'featured'])
})

export default defineEventHandler(async (event) => {
  try {
    // Check if Stripe is configured
    let stripe: Stripe
    try {
      stripe = getStripeInstance()
    } catch (error) {
      throw createError({
        statusCode: 503,
        statusMessage: 'Payment service not configured. Please contact support.'
      })
    }

    // Parse and validate request body
    const body = await readBody(event)
    const { listing_id, type } = createCheckoutSchema.parse(body)

    // Get the listing to verify it exists and get details
    const { createClient } = await import('@supabase/supabase-js')
    const supabase = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const { data: listing, error: listingError } = await supabase
      .from('doghealthy_listings')
      .select('id, title, user_id, is_premium, is_featured')
      .eq('id', listing_id)
      .single()

    if (listingError || !listing) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Listing not found'
      })
    }

    // Check if already upgraded
    if ((type === 'premium' && listing.is_premium) || (type === 'featured' && listing.is_featured)) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Listing is already upgraded'
      })
    }

    // Define pricing
    const pricing = {
      premium: {
        price: 999, // £9.99 in pence
        name: 'Premium Listing Upgrade',
        description: 'Highlighted listing with premium badge and higher ranking'
      },
      featured: {
        price: 1999, // £19.99 in pence
        name: 'Featured Listing Upgrade',
        description: 'Top placement with featured badge and maximum visibility for 30 days'
      }
    }

    const selectedPricing = pricing[type]

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'gbp',
            product_data: {
              name: selectedPricing.name,
              description: selectedPricing.description,
            },
            unit_amount: selectedPricing.price,
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${process.env.NUXT_PUBLIC_BASE_URL}/classifieds/${listing_id}?upgrade=success`,
      cancel_url: `${process.env.NUXT_PUBLIC_BASE_URL}/classifieds/${listing_id}?upgrade=cancelled`,
      metadata: {
        listing_id,
        upgrade_type: type,
        user_id: listing.user_id
      },
      customer_email: undefined, // Will be collected during checkout
    })

    return {
      sessionId: session.id,
      url: session.url
    }

  } catch (error) {
    console.error('Error creating Stripe checkout:', error)
    
    if (error instanceof z.ZodError) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Invalid request data',
        data: error.errors
      })
    }

    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to create checkout session'
    })
  }
})
