<template>
  <div class="min-h-screen bg-gray-50 flex items-center justify-center px-4">
    <div class="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
      <div class="text-[6.75rem] mb-2 text-center">🐾</div>
      <h1 class="text-2xl font-bold text-gray-900 mb-6 text-center">
        Create Your Account
      </h1>
      
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
          class="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors disabled:bg-blue-300 disabled:cursor-not-allowed"
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

