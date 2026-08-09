<template>
  <div class="min-h-screen bg-[#f7f3ea] flex flex-col lg:flex-row">
    <aside class="relative lg:w-[48%] min-h-[220px] sm:min-h-[280px] lg:min-h-screen overflow-hidden">
      <img
        :src="hero.url"
        :alt="hero.description || 'Puppy'"
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
          🇬🇧 Free to start · UK only
        </p>
        <h2 class="text-3xl sm:text-4xl lg:text-5xl font-extrabold leading-tight max-w-md">
          Give every dog a healthier home.
        </h2>
        <p class="mt-4 text-sm sm:text-base text-white/90 max-w-md">
          Create a free account to track health records, vaccinations and medications — plus NFC tags that alert you if they’re found.
        </p>
        <ul class="mt-6 hidden sm:grid grid-cols-1 gap-2 text-sm text-white/90 max-w-md">
          <li class="flex items-center gap-2">
            <span class="text-[#F9A800]">●</span> First 3 dogs free
          </li>
          <li class="flex items-center gap-2">
            <span class="text-[#F9A800]">●</span> Found-dog SMS to your UK mobile
          </li>
          <li class="flex items-center gap-2">
            <span class="text-[#F9A800]">●</span> Food finder, reminders and vet contacts
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
            Create your account
          </h1>
          <p class="text-sm text-gray-600 mb-6">
            Join DogHealthy in a minute. No credit card needed.
          </p>

          <div v-if="error" class="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            {{ error }}
          </div>

          <div v-if="success" class="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm">
            {{ success }}
          </div>

          <form @submit.prevent="handleRegister" class="space-y-4">
            <div>
              <label for="fullName" class="block text-sm font-medium text-gray-700 mb-1">
                Full Name
              </label>
              <input
                id="fullName"
                v-model="fullName"
                type="text"
                required
                :disabled="loading"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                placeholder="John Doe"
              />
            </div>

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
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label for="phone" class="block text-sm font-medium text-gray-700 mb-1">
                UK mobile number
              </label>
              <div class="flex rounded-lg border border-gray-300 overflow-hidden focus-within:ring-2 focus-within:ring-blue-500">
                <span class="inline-flex items-center px-3 bg-gray-50 text-gray-600 text-sm border-r border-gray-300">
                  +44
                </span>
                <input
                  id="phone"
                  v-model="phoneLocal"
                  type="tel"
                  inputmode="numeric"
                  required
                  maxlength="11"
                  :disabled="loading"
                  class="flex-1 px-3 py-2 border-0 focus:outline-none disabled:bg-gray-100"
                  placeholder="7XXX XXXXXX"
                />
              </div>
              <p class="mt-1 text-xs text-gray-500">
                Required for found-dog SMS alerts. Enter without the leading 0 (or paste 07…).
                Stored as <code class="bg-gray-100 px-1 rounded">+44</code> + 10 digits.
              </p>
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
                minlength="6"
                :disabled="loading"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                placeholder="••••••••"
              />
              <p class="mt-1 text-xs text-gray-500">Minimum 6 characters</p>
            </div>

            <div>
              <label for="confirmPassword" class="block text-sm font-medium text-gray-700 mb-1">
                Confirm Password
              </label>
              <input
                id="confirmPassword"
                v-model="confirmPassword"
                type="password"
                required
                :disabled="loading"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              :disabled="loading"
              class="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 px-4 rounded-lg transition-colors disabled:bg-blue-300 disabled:cursor-not-allowed"
            >
              {{ loading ? 'Creating Account...' : 'Create Account' }}
            </button>
          </form>

          <div class="mt-6 text-center">
            <p class="text-sm text-gray-600">
              Already have an account?
              <NuxtLink
                to="/auth/login"
                class="text-blue-600 hover:text-blue-700 font-medium"
              >
                Login here
              </NuxtLink>
            </p>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { normalizeUkMobile } from '~/utils/ukPhone'

definePageMeta({
  layout: false
})

usePageSeo({
  title: 'Create a DogHealthy Account',
  description:
    'Register for DogHealthy — the UK dog health tracker for medical records, vaccinations, NFC / QR tags and found-dog alerts. Free to start.',
  keywords: 'DogHealthy sign up, create dog health account UK, register pet tracker',
  path: '/auth/register',
  index: false
})

const fullName = ref('')
const email = ref('')
const phoneLocal = ref('')
const password = ref('')
const confirmPassword = ref('')
const loading = ref(false)
const error = ref('')
const success = ref('')

const authStore = useAuthStore()
const router = useRouter()
const { getCuratedImage } = useUnsplash()
const hero = getCuratedImage('cute puppy dog', 1200, 1600)

const resolvePhone = () => {
  const raw = phoneLocal.value.trim()
  if (raw.startsWith('+') || raw.startsWith('0') || raw.startsWith('44') || raw.startsWith('00')) {
    return normalizeUkMobile(raw)
  }
  return normalizeUkMobile(`+44${raw.replace(/^0/, '')}`)
}

const handleRegister = async () => {
  loading.value = true
  error.value = ''
  success.value = ''

  // Validate passwords match
  if (password.value !== confirmPassword.value) {
    error.value = 'Passwords do not match'
    loading.value = false
    return
  }

  const phone = resolvePhone()
  if (!phone) {
    error.value = 'Enter a valid UK mobile number (+44 followed by 10 digits, no leading 0).'
    loading.value = false
    return
  }

  try {
    await authStore.signUp(email.value, password.value, fullName.value, phone)
    success.value = 'Account created successfully! Please check your email to verify your account.'

    // Redirect to login after 2 seconds
    setTimeout(() => {
      router.push('/auth/login')
    }, 2000)
  } catch (err: any) {
    error.value = err.message || 'Failed to create account. Please try again.'
  } finally {
    loading.value = false
  }
}
</script>
