<template>
  <div class="min-h-screen bg-[#f7f3ea] flex flex-col lg:flex-row">
    <aside class="relative lg:w-[48%] min-h-[220px] sm:min-h-[280px] lg:min-h-screen overflow-hidden">
      <img
        :src="hero.url"
        :alt="hero.description || 'Happy dog'"
        class="absolute inset-0 w-full h-full object-cover"
      />
      <div class="absolute inset-0 bg-gradient-to-t from-black/75 via-black/35 to-black/15 lg:bg-gradient-to-r lg:from-black/70 lg:via-black/40 lg:to-black/10" />
      <div class="relative z-10 h-full flex flex-col justify-end lg:justify-center px-6 py-8 sm:px-10 lg:px-12 text-white">
        <NuxtLink to="/" class="inline-flex items-center gap-2 mb-6 lg:mb-10">
          <NuxtImg
            src="/logo-96.png"
            alt="DogHealthy"
            width="40"
            height="45"
            class="h-10 w-auto drop-shadow"
            format="webp"
          />
          <span class="text-lg font-bold tracking-tight">DogHealthy</span>
        </NuxtLink>
        <p class="inline-flex w-fit items-center rounded-full bg-white/15 border border-white/30 px-3 py-1 text-xs font-semibold mb-4">
          🇬🇧 For UK dog owners
        </p>
        <h2 class="text-3xl sm:text-4xl lg:text-5xl font-extrabold leading-tight max-w-md">
          Welcome back.<br />Your pack is waiting.
        </h2>
        <p class="mt-4 text-sm sm:text-base text-white/90 max-w-md">
          Health records, vaccinations, NFC tags and found-pet alerts — all in one place for every dog you look after.
        </p>
        <ul class="mt-6 hidden sm:grid grid-cols-1 gap-2 text-sm text-white/90 max-w-md">
          <li class="flex items-center gap-2">
            <span class="text-[#F9A800]">●</span> Track meds, jabs and vet visits
          </li>
          <li class="flex items-center gap-2">
            <span class="text-[#F9A800]">●</span> NFC + QR tags posted to your door
          </li>
          <li class="flex items-center gap-2">
            <span class="text-[#F9A800]">●</span> First 3 dogs free
          </li>
        </ul>
        <p v-if="hero.author" class="mt-6 text-[11px] text-white/60">
          Photo by
          <a
            :href="hero.authorUrl + '?utm_source=doghealthy&utm_medium=referral'"
            target="_blank"
            rel="noopener noreferrer"
            class="underline hover:text-white"
          >{{ hero.author }}</a>
          on
          <a
            href="https://unsplash.com?utm_source=doghealthy&utm_medium=referral"
            target="_blank"
            rel="noopener noreferrer"
            class="underline hover:text-white"
          >Unsplash</a>
        </p>
      </div>
    </aside>

    <main class="flex-1 flex items-center justify-center px-4 py-10 lg:py-16">
      <div class="w-full max-w-md">
        <div class="bg-white rounded-2xl shadow-xl border border-[#e8e0d0] p-8">
          <h1 class="text-2xl font-bold text-gray-900 mb-1">
            Log in
          </h1>
          <p class="text-sm text-gray-600 mb-6">
            Sign in to manage your dogs’ health, tags and reminders.
          </p>

          <div v-if="error" class="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            {{ error }}
          </div>

          <form @submit.prevent="handleLogin" class="space-y-4">
            <div>
              <label for="email" class="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                id="email"
                v-model="email"
                type="email"
                required
                :disabled="loading"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label for="password" class="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <input
                id="password"
                v-model="password"
                type="password"
                required
                :disabled="loading"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              :disabled="loading"
              class="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 px-4 rounded-lg transition-colors disabled:bg-blue-300 disabled:cursor-not-allowed"
            >
              {{ loading ? 'Logging in...' : 'Login' }}
            </button>
          </form>

          <div class="mt-6 text-center space-y-3">
            <p class="text-sm text-gray-600">
              Don't have an account?
              <NuxtLink
                to="/auth/register"
                class="text-blue-600 hover:text-blue-700 font-medium"
              >
                Register here
              </NuxtLink>
            </p>
            <p class="text-xs text-gray-500">
              Works in Incognito but not here?
              <NuxtLink to="/auth/repair" class="text-blue-600 hover:underline">
                Fix this browser
              </NuxtLink>
            </p>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: false
})

const email = ref('')
const password = ref('')
const loading = ref(false)
const error = ref('')

const authStore = useAuthStore()
const router = useRouter()
const route = useRoute()
const { getCuratedImage } = useUnsplash()
const hero = getCuratedImage('happy golden retriever dog', 1200, 1600)

usePageSeo({
  title: 'Log in to DogHealthy',
  description:
    'Sign in to your DogHealthy account to manage UK dog health records, vaccinations, medications, NFC tags and found-pet alerts.',
  keywords: 'DogHealthy login, dog health app sign in UK',
  path: '/auth/login',
  index: false
})

onMounted(() => {
  if (route.query.repaired === '1') {
    error.value = 'Browser data was cleared. Please log in again.'
  }
})

const handleLogin = async () => {
  loading.value = true
  error.value = ''

  try {
    await authStore.signIn(email.value, password.value)
    const redirect = typeof route.query.redirect === 'string' ? route.query.redirect : ''
    const stored =
      typeof window !== 'undefined'
        ? sessionStorage.getItem('doghealthy_post_login_redirect') || ''
        : ''
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem('doghealthy_post_login_redirect')
    }
    const target = (redirect.startsWith('/') && !redirect.startsWith('//') ? redirect : '') ||
      (stored.startsWith('/') && !stored.startsWith('//') ? stored : '')
    if (target) {
      await router.push(target)
    } else {
      await router.push('/dogs')
    }
  } catch (err: any) {
    error.value = err.message || 'Failed to login. Please check your credentials.'
  } finally {
    loading.value = false
  }
}
</script>
