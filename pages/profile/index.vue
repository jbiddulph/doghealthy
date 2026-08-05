<template>
  <div class="min-h-screen bg-gray-50 py-10">
    <div class="max-w-xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="mb-6">
        <NuxtLink to="/dogs" class="text-sm text-blue-600 hover:text-blue-700 font-medium">
          ← Back to My Dogs
        </NuxtLink>
      </div>

      <div class="bg-white rounded-2xl shadow-lg p-6 sm:p-8">
        <h1 class="text-3xl font-bold text-gray-900 mb-2">Your profile</h1>
        <p class="text-gray-600 mb-6">
          Keep your details up to date. Your UK mobile is used for found-dog SMS alerts.
        </p>

        <div v-if="pageLoading" class="text-center py-10 text-gray-600">Loading profile…</div>

        <form v-else class="space-y-5" @submit.prevent="saveProfile">
          <div v-if="error" class="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {{ error }}
          </div>
          <div v-if="success" class="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800">
            {{ success }}
          </div>

          <div>
            <label for="email" class="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              id="email"
              :value="email"
              type="email"
              disabled
              class="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-600"
            />
          </div>

          <div>
            <label for="fullName" class="block text-sm font-medium text-gray-700 mb-1">Full name</label>
            <input
              id="fullName"
              v-model="fullName"
              type="text"
              required
              :disabled="saving"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
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
                maxlength="11"
                required
                :disabled="saving"
                class="flex-1 px-3 py-2 border-0 focus:outline-none disabled:bg-gray-100"
                placeholder="7XXX XXXXXX"
                @blur="formatPhoneField"
              />
            </div>
            <p class="mt-1 text-xs text-gray-500">
              Enter your number without the leading 0 (or paste 07…). Saved as
              <code class="bg-gray-100 px-1 rounded">+44</code> plus 10 digits —
              e.g. <code class="bg-gray-100 px-1 rounded">{{ previewE164 || '+447XXXXXXXXX' }}</code>
            </p>
          </div>

          <label class="flex items-start gap-3 text-sm text-gray-700">
            <input
              v-model="notifyFoundSms"
              type="checkbox"
              class="mt-1 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              :disabled="saving"
            />
            <span>Send me an SMS if someone reports finding my dog</span>
          </label>

          <div class="border-t border-gray-200 pt-5">
            <h2 class="text-lg font-semibold text-gray-900 mb-1">NFC chip shipping address</h2>
            <p class="text-sm text-gray-600 mb-4">
              Used when you create a QR / NFC tag so we can post a physical chip to you.
            </p>

            <div class="space-y-4">
              <div>
                <label for="billingName" class="block text-sm font-medium text-gray-700 mb-1">Billing / shipping name</label>
                <input
                  id="billingName"
                  v-model="billingName"
                  type="text"
                  :disabled="saving"
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                />
              </div>
              <div>
                <label for="addressLine1" class="block text-sm font-medium text-gray-700 mb-1">Address line 1</label>
                <input
                  id="addressLine1"
                  v-model="addressLine1"
                  type="text"
                  :disabled="saving"
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                />
              </div>
              <div>
                <label for="addressLine2" class="block text-sm font-medium text-gray-700 mb-1">Address line 2</label>
                <input
                  id="addressLine2"
                  v-model="addressLine2"
                  type="text"
                  :disabled="saving"
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                />
              </div>
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label for="addressCity" class="block text-sm font-medium text-gray-700 mb-1">Town / city</label>
                  <input
                    id="addressCity"
                    v-model="addressCity"
                    type="text"
                    :disabled="saving"
                    class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                  />
                </div>
                <div>
                  <label for="addressPostcode" class="block text-sm font-medium text-gray-700 mb-1">Postcode</label>
                  <input
                    id="addressPostcode"
                    v-model="addressPostcode"
                    type="text"
                    :disabled="saving"
                    class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 uppercase"
                  />
                </div>
              </div>
              <p v-if="nfcChipStatus && nfcChipStatus !== 'none'" class="text-xs text-gray-500">
                NFC chip status:
                <span class="font-semibold capitalize">{{ nfcChipStatus }}</span>
              </p>
            </div>
          </div>

          <button
            type="submit"
            :disabled="saving || !isPhoneValid"
            class="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-semibold px-6 py-2.5 rounded-lg"
          >
            {{ saving ? 'Saving…' : 'Save profile' }}
          </button>

          <p v-if="isAdmin" class="text-sm text-gray-600 pt-2">
            Admin:
            <NuxtLink to="/admin" class="text-blue-600 hover:text-blue-700 font-medium">
              Open admin dashboard
            </NuxtLink>
          </p>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { isValidUkMobile, normalizeUkMobile } from '~/utils/ukPhone'

definePageMeta({
  middleware: 'auth'
})

const authStore = useAuthStore()
const supabase = useSupabase()

const pageLoading = ref(true)
const saving = ref(false)
const error = ref('')
const success = ref('')

const email = ref('')
const fullName = ref('')
/** Digits after +44, or a pasted 07… value before normalize */
const phoneLocal = ref('')
const notifyFoundSms = ref(true)
const billingName = ref('')
const addressLine1 = ref('')
const addressLine2 = ref('')
const addressCity = ref('')
const addressPostcode = ref('')
const nfcChipStatus = ref('')
const isAdmin = ref(false)

const previewE164 = computed(() => normalizeUkMobile(phoneLocal.value) || normalizeUkMobile(`+44${phoneLocal.value.replace(/^0/, '')}`))

const isPhoneValid = computed(() => {
  const raw = phoneLocal.value.trim()
  if (!raw) return false
  if (raw.startsWith('+') || raw.startsWith('0') || raw.startsWith('44')) {
    return isValidUkMobile(raw)
  }
  return isValidUkMobile(`+44${raw.replace(/^0/, '')}`)
})

const toStoredPhone = () => {
  const raw = phoneLocal.value.trim()
  if (raw.startsWith('+') || raw.startsWith('0') || raw.startsWith('44') || raw.startsWith('00')) {
    return normalizeUkMobile(raw)
  }
  return normalizeUkMobile(`+44${raw.replace(/^0/, '')}`)
}

const formatPhoneField = () => {
  const normalized = toStoredPhone()
  if (normalized) {
    // Show only the 10 digits after +44 in the input
    phoneLocal.value = normalized.slice(3)
  }
}

const loadProfile = async () => {
  pageLoading.value = true
  error.value = ''
  try {
    if (!authStore.userId) throw new Error('Not signed in')

    email.value = authStore.user?.email || ''

    const { data, error: fetchError } = await supabase
      .from('doghealthy_users')
      .select(
        'full_name, phone, notify_found_sms, email, billing_name, address_line1, address_line2, address_city, address_postcode, nfc_chip_status, is_admin'
      )
      .eq('id', authStore.userId)
      .maybeSingle()

    if (fetchError) throw fetchError

    fullName.value = data?.full_name || authStore.user?.user_metadata?.full_name || ''
    email.value = data?.email || authStore.user?.email || ''
    notifyFoundSms.value = data?.notify_found_sms !== false
    billingName.value = data?.billing_name || data?.full_name || ''
    addressLine1.value = data?.address_line1 || ''
    addressLine2.value = data?.address_line2 || ''
    addressCity.value = data?.address_city || ''
    addressPostcode.value = data?.address_postcode || ''
    nfcChipStatus.value = data?.nfc_chip_status || 'none'
    isAdmin.value = !!data?.is_admin

    const phone = normalizeUkMobile(data?.phone)
    phoneLocal.value = phone ? phone.slice(3) : ''
  } catch (err: any) {
    error.value = err?.message || 'Failed to load profile'
  } finally {
    pageLoading.value = false
  }
}

const saveProfile = async () => {
  saving.value = true
  error.value = ''
  success.value = ''
  try {
    const phone = toStoredPhone()
    if (!phone) {
      throw new Error('Enter a valid UK mobile: +44 followed by 10 digits (no leading 0).')
    }

    await authStore.updateProfile({
      fullName: fullName.value.trim(),
      phone
    })

    if (!authStore.userId) throw new Error('Not signed in')

    const { error: notifyError } = await supabase
      .from('doghealthy_users')
      .update({
        notify_found_sms: notifyFoundSms.value,
        billing_name: billingName.value.trim() || null,
        address_line1: addressLine1.value.trim() || null,
        address_line2: addressLine2.value.trim() || null,
        address_city: addressCity.value.trim() || null,
        address_postcode: addressPostcode.value.trim().toUpperCase() || null,
        address_country: 'GB'
      })
      .eq('id', authStore.userId)

    if (notifyError) throw notifyError

    phoneLocal.value = phone.slice(3)
    success.value = 'Profile saved.'
  } catch (err: any) {
    error.value = err?.message || 'Failed to save profile'
  } finally {
    saving.value = false
  }
}

onMounted(loadProfile)

usePageSeo({
  title: 'Your Profile',
  description: 'Update your DogHealthy account profile, contact number and preferences for UK found-dog alerts.',
  path: '/profile',
  index: false
})
</script>
