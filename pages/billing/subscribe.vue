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
        <h1 class="text-3xl font-bold text-gray-900 mb-4">Unlock Full DogHealthy Access</h1>
        <p class="text-gray-600 mb-6">
          Add dogs to your account and track their health, vaccinations, medications, appointments, and more.
          Choose a subscription that works best for you.
        </p>

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
            <ul class="text-sm text-gray-600 space-y-2 mb-6">
              <li>✓ Add and manage all of your dogs</li>
              <li>✓ Track health records & vaccinations</li>
              <li>✓ Manage medications & appointments</li>
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
            <ul class="text-sm text-gray-600 space-y-2 mb-6">
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
          Payments are securely processed by Stripe. You can manage or cancel your subscription at any time
          through your Stripe customer portal (coming soon) or by contacting support.
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

// If we've just returned from a successful payment, mark subscription and send to add-dog page
onMounted(() => {
  if (route.query.subscription === 'success') {
    if (typeof window !== 'undefined') {
      localStorage.setItem('doghealthy_has_subscription', 'true')
    }
    router.replace('/dogs/new')
  }
})

const startSubscription = async (plan: PlanType) => {
  try {
    loading.value = true
    error.value = ''

    const { url } = await $fetch('/api/billing/create-subscription-checkout', {
      method: 'POST',
      body: { plan }
    })

    if (!url) {
      throw new Error('Stripe checkout URL not returned. Please try again.')
    }

    // Optimistically mark that the user has started a subscription
    if (typeof window !== 'undefined') {
      localStorage.setItem('doghealthy_has_subscription', 'true')
    }

    window.location.href = url
  } catch (err: any) {
    console.error('Error starting subscription:', err)
    error.value = err?.data?.statusMessage || err?.message || 'Unable to start subscription. Please try again.'
    loading.value = false
  }
}
</script>

