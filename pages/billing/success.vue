<template>
  <div class="min-h-screen bg-gray-50 flex items-center justify-center px-4">
    <div class="max-w-md w-full bg-white rounded-2xl shadow-lg p-8 text-center">
      <h1 class="text-2xl font-bold text-gray-900 mb-3">{{ title }}</h1>
      <p class="text-sm text-gray-600 mb-4">{{ message }}</p>
      <p v-if="error" class="text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2 mb-4">
        {{ error }}
      </p>
      <NuxtLink
        v-if="error"
        to="/billing/subscribe"
        class="inline-flex text-sm font-medium text-blue-700 hover:text-blue-800"
      >
        Back to plans
      </NuxtLink>
    </div>
  </div>
</template>

<script setup lang="ts">
/**
 * Stripe/PayPal return landing — NO auth middleware.
 * Confirms payment, then sends the user back to the record form or NFC create flow.
 */
definePageMeta({
  layout: false
})

usePageSeo({
  title: 'Payment complete — DogHealthy',
  description: 'Confirming your DogHealthy subscription.',
  path: '/billing/success',
  index: false
})

const POST_LOGIN_KEY = 'doghealthy_post_login_redirect'

const router = useRouter()
const route = useRoute()
const supabase = useSupabase()
const {
  markSubscribed,
  peekPendingAction,
  consumePendingAction,
  readCheckoutContext,
  clearCheckoutContext
} = usePlanLimits()

const title = ref('Confirming your payment…')
const message = ref('Please wait a moment while we activate your subscription.')
const error = ref('')

const resolveTarget = () => {
  const ctx = readCheckoutContext()
  const pending = peekPendingAction() || ctx.pending || null
  const nextFromQuery =
    typeof route.query.next === 'string' && route.query.next.startsWith('/')
      ? route.query.next
      : ''
  const next = nextFromQuery || ctx.next || ''

  if (pending?.action === 'createTag' && pending.petId) {
    consumePendingAction()
    return `/dogs/${pending.petId}?createTag=1&subscription=success`
  }

  if (next) {
    if (next.includes('createTag=')) {
      return withQueryParams(next, { subscription: 'success', createTag: '1' })
    }
    if (next.includes('/dogs/new')) {
      return withQueryParams(next, { subscription: 'success' })
    }
    // Record pages: ensure add modal reopens
    return withQueryParams(next, { add: '1', subscription: 'success' })
  }

  return '/dogs?subscription=success'
}

const goToTarget = async (target: string, accessToken: string | undefined) => {
  title.value = 'Subscription active'
  message.value = 'Taking you back to what you were doing…'

  if (!accessToken) {
    if (typeof window !== 'undefined') {
      sessionStorage.setItem(POST_LOGIN_KEY, target)
    }
    await router.replace({
      path: '/auth/login',
      query: { redirect: target }
    })
    return
  }

  await router.replace(target)
}

onMounted(async () => {
  const sessionId = typeof route.query.session_id === 'string' ? route.query.session_id.trim() : ''

  if (!sessionId.startsWith('cs_')) {
    title.value = 'Missing payment session'
    message.value = 'We could not find your Stripe session. If you were charged, contact support.'
    error.value = 'No session_id on this page.'
    return
  }

  if (typeof window !== 'undefined') {
    sessionStorage.setItem('doghealthy_pending_session_id', sessionId)
  }

  // Resolve BEFORE clearing checkout context
  const target = resolveTarget()

  try {
    const { data } = await supabase.auth.getSession()
    const accessToken = data.session?.access_token
    const headers: Record<string, string> = {}
    if (accessToken) headers.Authorization = `Bearer ${accessToken}`

    await $fetch('/.netlify/functions/confirm-subscription', {
      method: 'POST',
      headers,
      body: { sessionId }
    })

    markSubscribed()
    clearCheckoutContext()
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem('doghealthy_pending_session_id')
    }

    await goToTarget(target, accessToken)
  } catch (err: any) {
    console.error('billing success confirm:', err)
    title.value = 'Payment received'
    message.value =
      'Your payment may have succeeded, but we could not activate the account automatically. Sign in and we will retry.'
    error.value = err?.data?.error || err?.message || 'Confirmation failed'

    // Keep checkout context so retry after login still resumes the right page
    const retry = `/billing/success?session_id=${encodeURIComponent(sessionId)}${
      typeof route.query.next === 'string' ? `&next=${encodeURIComponent(route.query.next)}` : ''
    }`
    if (typeof window !== 'undefined') {
      sessionStorage.setItem(POST_LOGIN_KEY, retry)
    }
    setTimeout(() => {
      router.replace({ path: '/auth/login', query: { redirect: retry } })
    }, 2500)
  }
})
</script>
