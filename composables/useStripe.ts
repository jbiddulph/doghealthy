import { loadStripe, Stripe } from '@stripe/stripe-js'

let stripePromise: Promise<Stripe | null> | null = null

export const useStripe = () => {
  const config = useRuntimeConfig()

  const getStripe = () => {
    if (!config.public.stripePublishableKey) {
      throw new Error('Stripe publishable key not configured')
    }
    
    if (!stripePromise) {
      stripePromise = loadStripe(config.public.stripePublishableKey)
    }
    return stripePromise
  }

  const createCheckoutSession = async (listingId: string, upgradeType: 'premium' | 'featured') => {
    try {
      const { data } = await $fetch('/api/stripe/create-checkout', {
        method: 'POST',
        body: {
          listing_id: listingId,
          type: upgradeType
        }
      })

      if (data?.url) {
        // Redirect to Stripe checkout
        window.location.href = data.url
      } else {
        throw new Error('No checkout URL received')
      }
    } catch (error) {
      console.error('Error creating checkout session:', error)
      
      // Show user-friendly error message
      if (error.data?.statusMessage) {
        alert(error.data.statusMessage)
      } else {
        alert('Payment service is currently unavailable. Please try again later.')
      }
      throw error
    }
  }

  return {
    getStripe,
    createCheckoutSession
  }
}
