<template>
  <div class="min-h-screen bg-gray-50">
    <div class="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div class="mb-8">
        <NuxtLink
          to="/dogs"
          class="inline-flex items-center text-sm text-gray-600 hover:text-gray-900"
        >
          <span class="mr-1">←</span> Back to My Dogs
        </NuxtLink>
      </div>

      <div class="bg-white rounded-2xl shadow-lg p-8">
        <h1 class="text-3xl font-bold text-gray-900 mb-4">Upgrade to DogHealthy Subscriber</h1>
        <p class="text-gray-600 mb-4">
          Free accounts include up to {{ freeLimit }} dogs and up to {{ freeLimit }} of each record type
          (medications, vaccinations, appointments, health records, and vets).
        </p>
        <p v-if="reasonMessage" class="text-sm text-amber-800 bg-amber-50 border border-amber-200 rounded-lg px-4 py-3 mb-6">
          {{ reasonMessage }}
        </p>
        <p v-else class="text-gray-600 mb-6">
          Subscribe for unlimited pets and records across your DogHealthy account.
        </p>

        <div v-if="!linksConfigured" class="mb-6 rounded-md bg-amber-50 border border-amber-200 px-4 py-3 text-sm text-amber-900">
          Stripe Payment Links are not set. Add
          <code class="text-xs">NUXT_PUBLIC_STRIPE_PAYMENT_LINK_MONTHLY</code> and
          <code class="text-xs">NUXT_PUBLIC_STRIPE_PAYMENT_LINK_YEARLY</code>
          in Netlify (and locally), then redeploy.
        </div>

        <div v-if="error" class="mb-4 rounded-md bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
          {{ error }}
        </div>

        <div v-if="loading" class="mb-6 text-gray-600">
          Redirecting you to Stripe checkout...
        </div>

        <div class="grid md:grid-cols-2 gap-6 mb-8">
          <!-- Monthly Plan -->
          <div class="border border-gray-200 rounded-xl p-6 flex flex-col">
            <h2 class="text-xl font-semibold text-gray-900 mb-2">Monthly Plan</h2>
            <p class="text-gray-600 mb-4">Perfect if you want flexibility with monthly billing.</p>
            <div class="text-3xl font-bold text-gray-900 mb-1">£6.50<span class="text-base font-normal text-gray-500"> / month</span></div>
            <p class="text-xs text-gray-500 mb-4">Billed monthly. Cancel anytime.</p>
            <ul class="space-y-2 text-sm text-gray-600 mb-6">
              <li>✓ Unlimited dogs</li>
              <li>✓ Unlimited health records & vaccinations</li>
              <li>✓ Unlimited medications, appointments & vets</li>
            </ul>
            <button
              type="button"
              class="mt-auto w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 px-4 rounded-lg transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
              :disabled="loading"
              @click="startSubscription('monthly')"
            >
              Choose Monthly
            </button>
          </div>

          <!-- Yearly Plan -->
          <div class="border border-blue-200 rounded-xl p-6 bg-blue-50/40 flex flex-col">
            <div class="inline-flex items-center px-3 py-1 rounded-full bg-blue-600 text-white text-xs font-semibold mb-3 w-max">
              Best Value
            </div>
            <h2 class="text-xl font-semibold text-gray-900 mb-2">Yearly Plan</h2>
            <p class="text-gray-600 mb-4">Save more with a yearly subscription.</p>
            <div class="text-3xl font-bold text-gray-900 mb-1">£70<span class="text-base font-normal text-gray-500"> / year</span></div>
            <p class="text-xs text-gray-500 mb-4">Equivalent to less than £5.84 per month.</p>
            <ul class="space-y-2 text-sm text-gray-600 mb-6">
              <li>✓ Everything in Monthly</li>
              <li>✓ Best value for long‑term use</li>
              <li>✓ Priority for new features</li>
            </ul>
            <button
              type="button"
              class="mt-auto w-full bg-blue-700 hover:bg-blue-800 text-white font-semibold py-2.5 px-4 rounded-lg transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
              :disabled="loading"
              @click="startSubscription('yearly')"
            >
              Choose Yearly
            </button>
          </div>
        </div>

        <p class="text-xs text-gray-500">
          Payments are securely processed by Stripe Payment Links. After paying, return to DogHealthy and continue where you left off.
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  middleware: 'auth'
})

const loading = ref(false)
const error = ref('')

type PlanType = 'monthly' | 'yearly'

const router = useRouter()
const route = useRoute()
const config = useRuntimeConfig()
const { freeLimit, markSubscribed, resourceLabel } = usePlanLimits()

const paymentLinks = computed<Record<PlanType, string>>(() => ({
  monthly: String(config.public.stripePaymentLinkMonthly || '').trim(),
  yearly: String(config.public.stripePaymentLinkYearly || '').trim()
}))

const linksConfigured = computed(() => {
  const monthly = paymentLinks.value.monthly
  const yearly = paymentLinks.value.yearly
  return Boolean(monthly && yearly && !monthly.includes('YOUR_') && !yearly.includes('YOUR_'))
})

const reasonMessage = computed(() => {
  const reason = route.query.reason as string | undefined
  if (!reason) return ''
  const label = resourceLabel(reason as any)
  return `You've reached the free limit of ${freeLimit} ${label}. Subscribe to add more.`
})

onMounted(() => {
  if (route.query.subscription === 'success') {
    markSubscribed()
    router.replace('/dogs')
  }
})

const startSubscription = async (plan: PlanType) => {
  try {
    loading.value = true
    error.value = ''

    const url = paymentLinks.value[plan]
    if (!url || url.includes('YOUR_')) {
      throw new Error(
        'Stripe Payment Link is not configured yet. Set NUXT_PUBLIC_STRIPE_PAYMENT_LINK_MONTHLY / YEARLY in your environment.'
      )
    }

    // Optimistically mark subscribed so returning users aren't blocked
    markSubscribed()
    window.location.href = url
  } catch (err: any) {
    console.error('Error starting subscription:', err)
    error.value = err?.message || 'Unable to start subscription. Please try again.'
    loading.value = false
  }
}
</script>
