<template>
  <div class="min-h-screen bg-gray-50">
    <div class="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div class="mb-8">
        <NuxtLink
          :to="backPath"
          class="inline-flex items-center text-sm text-gray-600 hover:text-gray-900"
        >
          <span class="mr-1">←</span> {{ backLabel }}
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

        <div
          v-if="confirming"
          class="mb-6 rounded-md bg-blue-50 border border-blue-200 px-4 py-3 text-sm text-blue-900"
        >
          Confirming your payment…
        </div>

        <div v-if="error" class="mb-4 rounded-md bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
          {{ error }}
        </div>

        <div v-if="loading && !confirming" class="mb-6 text-gray-600">
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
              <li>✓ NFC / QR tags for lost-dog alerts</li>
            </ul>
            <button
              type="button"
              class="mt-auto w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 px-4 rounded-lg transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
              :disabled="loading || confirming"
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
              :disabled="loading || confirming"
              @click="startSubscription('yearly')"
            >
              Choose Yearly
            </button>
          </div>
        </div>

        <p v-if="stripeServerMode" class="text-xs mb-3" :class="stripeServerMode === 'test' ? 'text-green-700' : 'text-red-700'">
          Stripe server mode: <strong>{{ stripeServerMode }}</strong>
          <span v-if="stripeServerMode !== 'test'"> — test cards will be declined until Netlify STRIPE_SECRET_KEY is sk_test_… and you redeploy.</span>
        </p>
        <p class="text-xs text-gray-500">
          Payments are securely processed by Stripe Checkout. In test mode use card
          <code class="text-[11px]">4242 4242 4242 4242</code>, any future expiry, any CVC.
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  middleware: 'auth'
})

usePageSeo({
  title: 'Subscribe to DogHealthy — Monthly or Yearly Plans',
  description:
    'Upgrade to DogHealthy Subscriber for unlimited dogs and health records, plus NFC / QR pet tags with found-dog SMS alerts. Choose monthly (£6.50) or yearly (£70) UK plans.',
  keywords:
    'DogHealthy subscription, dog health app pricing UK, NFC dog tag subscription, unlimited dog records, DogHealthy monthly yearly',
  path: '/billing/subscribe',
  index: false
})

const loading = ref(false)
const confirming = ref(false)
const error = ref('')
const stripeServerMode = ref('')

type PlanType = 'monthly' | 'yearly'

const router = useRouter()
const route = useRoute()
const config = useRuntimeConfig()
const supabase = useSupabase()
const {
  freeLimit,
  markSubscribed,
  resourceLabel,
  peekPendingAction,
  consumePendingAction
} = usePlanLimits()

const paymentLinks = computed<Record<PlanType, string>>(() => ({
  monthly: String(config.public.stripePaymentLinkMonthly || '').trim(),
  yearly: String(config.public.stripePaymentLinkYearly || '').trim()
}))

const nextPath = computed(() => {
  const next = route.query.next
  return typeof next === 'string' && next.startsWith('/') ? next : ''
})

const backPath = computed(() => nextPath.value || '/dogs')
const backLabel = computed(() => (nextPath.value ? 'Back' : 'Back to My Dogs'))

const reasonMessage = computed(() => {
  const reason = route.query.reason as string | undefined
  if (!reason) return ''
  if (reason === 'nfc-tag') {
    return 'NFC / QR tags are included with a DogHealthy subscription. Choose a plan below, then we’ll create your tag and QR code.'
  }
  const label = resourceLabel(reason as any)
  return `You've reached the free limit of ${freeLimit} ${label}. Subscribe to add more.`
})

const getAccessToken = async () => {
  const { data } = await supabase.auth.getSession()
  return data.session?.access_token || null
}

const resumeAfterSubscribe = async () => {
  markSubscribed()

  const pending = peekPendingAction()
  if (pending?.action === 'createTag' && pending.petId) {
    consumePendingAction()
    await router.replace(`/dogs/${pending.petId}?createTag=1&subscription=success`)
    return
  }

  if (nextPath.value) {
    const join = nextPath.value.includes('?') ? '&' : '?'
    const target = nextPath.value.includes('subscription=')
      ? nextPath.value
      : `${nextPath.value}${join}subscription=success`
    await router.replace(target)
    return
  }

  await router.replace('/dogs')
}

const confirmCheckoutSession = async (sessionId: string) => {
  confirming.value = true
  error.value = ''
  try {
    const accessToken = await getAccessToken()
    if (!accessToken) {
      throw new Error('Please sign in again to confirm your subscription.')
    }

    await $fetch('/.netlify/functions/confirm-subscription', {
      method: 'POST',
      headers: { Authorization: `Bearer ${accessToken}` },
      body: { sessionId }
    })

    await resumeAfterSubscribe()
  } catch (err: any) {
    console.error('confirm subscription:', err)
    error.value =
      err?.data?.error ||
      err?.message ||
      'Payment may have succeeded, but we could not activate your subscription. Please refresh or contact support.'
  } finally {
    confirming.value = false
  }
}

onMounted(async () => {
  try {
    const status = await $fetch<{ mode?: string }>('/.netlify/functions/stripe-mode')
    stripeServerMode.value = status?.mode || ''
  } catch {
    stripeServerMode.value = ''
  }

  if (route.query.subscription === 'cancelled') {
    error.value = 'Checkout was cancelled. You can choose a plan when you are ready.'
    return
  }

  const sessionId = route.query.session_id
  if (route.query.subscription === 'success' && typeof sessionId === 'string' && sessionId.startsWith('cs_')) {
    await confirmCheckoutSession(sessionId)
    return
  }

  // Payment Link fallback (no session_id) — trust return URL + local flag
  if (route.query.subscription === 'success') {
    await resumeAfterSubscribe()
  }
})

const startSubscription = async (plan: PlanType) => {
  try {
    loading.value = true
    error.value = ''

    const accessToken = await getAccessToken()
    if (!accessToken) {
      throw new Error('Please sign in again to subscribe.')
    }

    // Prefer Checkout Sessions (works with sandbox test cards).
    try {
      const result = await $fetch<{ url: string; mode?: string }>(
        '/.netlify/functions/create-subscription-checkout',
        {
          method: 'POST',
          headers: { Authorization: `Bearer ${accessToken}` },
          body: {
            plan,
            next: nextPath.value || undefined
          }
        }
      )
      if (result?.mode) stripeServerMode.value = result.mode
      if (result?.mode === 'live') {
        throw new Error(
          'Checkout would run in LIVE mode (server still has sk_live_…). Set Netlify STRIPE_SECRET_KEY to sk_test_… and redeploy. Publishable key alone does not control this.'
        )
      }
      if (result?.url) {
        window.location.href = result.url
        return
      }
    } catch (checkoutErr: any) {
      const link = paymentLinks.value[plan]
      if (link && !link.includes('YOUR_') && link.includes('test')) {
        window.location.href = link
        return
      }
      throw checkoutErr
    }

    throw new Error('Could not start Stripe Checkout. Check STRIPE_SECRET_KEY on Netlify.')
  } catch (err: any) {
    console.error('Error starting subscription:', err)
    error.value =
      err?.data?.error ||
      err?.message ||
      'Unable to start subscription. Please try again.'
    loading.value = false
  }
}
</script>
