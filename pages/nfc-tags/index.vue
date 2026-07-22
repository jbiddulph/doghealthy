<template>
  <div class="min-h-screen bg-gray-50">
    <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div class="mb-6">
        <NuxtLink to="/dogs" class="text-sm text-blue-600 hover:text-blue-700 font-medium">
          ← Back to My Dogs
        </NuxtLink>
      </div>

      <div class="bg-white rounded-2xl shadow-lg p-6 sm:p-8 mb-8">
        <div class="flex flex-wrap items-start justify-between gap-4 mb-3">
          <h1 class="text-3xl font-bold text-gray-900">Order NFC Dog Tags</h1>
          <div class="rounded-full bg-green-100 text-green-800 px-4 py-1.5 text-sm font-semibold">
            £0.00 — free for now
          </div>
        </div>
        <p class="text-gray-600 mb-2">
          Choose one or more dogs to order physical NFC tags for. Each tag links to that dog’s
          public DogHealthy profile so anyone who finds them can identify them quickly.
        </p>
        <p class="text-sm text-gray-500 mb-2">
          If you have multiple dogs, select every dog you want a tag for in a single order.
        </p>
        <p class="text-sm text-gray-500">
          NFC tags are currently free (£0.00). A Stripe product can be added later when pricing goes live.
        </p>
      </div>

      <div v-if="pageLoading" class="text-center py-12">
        <div class="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <p class="mt-4 text-gray-600">Loading your dogs...</p>
      </div>

      <div v-else-if="dogs.length === 0" class="bg-white rounded-xl shadow p-8 text-center">
        <div class="text-5xl mb-4">🐕</div>
        <h2 class="text-xl font-semibold text-gray-900 mb-2">No dogs registered yet</h2>
        <p class="text-gray-600 mb-6">Add a dog first, then come back to order an NFC tag.</p>
        <NuxtLink
          to="/dogs"
          class="inline-block bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold"
        >
          Go to My Dogs
        </NuxtLink>
      </div>

      <template v-else>
        <!-- Dog selection -->
        <div class="bg-white rounded-xl shadow p-6 mb-6">
          <div class="flex items-center justify-between mb-4">
            <h2 class="text-xl font-semibold text-gray-900">1. Select dogs</h2>
            <button
              type="button"
              class="text-sm text-blue-600 hover:text-blue-700 font-medium"
              @click="toggleSelectAll"
            >
              {{ allSelected ? 'Clear all' : 'Select all' }}
            </button>
          </div>

          <div class="space-y-3">
            <label
              v-for="dog in dogs"
              :key="dog.id"
              class="flex items-center gap-4 p-4 border rounded-xl cursor-pointer transition-colors"
              :class="selectedDogIds.includes(dog.id) ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'"
            >
              <input
                v-model="selectedDogIds"
                type="checkbox"
                :value="dog.id"
                class="h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <img
                v-if="dog.photoUrl"
                :src="dog.photoUrl"
                :alt="dog.name"
                class="h-14 w-14 rounded-full object-cover"
              />
              <div
                v-else
                class="h-14 w-14 rounded-full bg-blue-100 flex items-center justify-center text-2xl"
              >
                🐕
              </div>
              <div class="flex-1 min-w-0">
                <p class="font-semibold text-gray-900 truncate">{{ dog.name }}</p>
                <p class="text-sm text-gray-600 truncate">
                  {{ dog.breed || 'Breed not set' }}
                  <span v-if="dog.nfcTagEnabled" class="ml-2 text-green-700">· NFC enabled</span>
                </p>
              </div>
            </label>
          </div>
        </div>

        <!-- Shipping -->
        <div class="bg-white rounded-xl shadow p-6 mb-6">
          <h2 class="text-xl font-semibold text-gray-900 mb-4">2. Shipping details</h2>
          <div class="grid sm:grid-cols-2 gap-4">
            <div class="sm:col-span-2">
              <label class="block text-sm font-medium text-gray-700 mb-1">Full name</label>
              <input v-model="shipping.name" type="text" class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input v-model="shipping.email" type="email" class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Phone</label>
              <input v-model="shipping.phone" type="tel" class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
            </div>
            <div class="sm:col-span-2">
              <label class="block text-sm font-medium text-gray-700 mb-1">Address line 1</label>
              <input v-model="shipping.line1" type="text" class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
            </div>
            <div class="sm:col-span-2">
              <label class="block text-sm font-medium text-gray-700 mb-1">Address line 2 (optional)</label>
              <input v-model="shipping.line2" type="text" class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">City</label>
              <input v-model="shipping.city" type="text" class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Postcode</label>
              <input v-model="shipping.postcode" type="text" class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Country</label>
              <select v-model="shipping.country" class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                <option value="GB">United Kingdom</option>
                <option value="IE">Ireland</option>
              </select>
            </div>
          </div>
        </div>

        <div v-if="error" class="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {{ error }}
        </div>
        <div v-if="successMessage" class="mb-4 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800">
          {{ successMessage }}
        </div>

        <button
          type="button"
          class="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold px-8 py-3 rounded-lg transition-colors"
          :disabled="submitting"
          @click="submitOrder"
        >
          {{ submitting ? 'Submitting order...' : `Order ${selectedDogIds.length || ''} NFC tag${selectedDogIds.length === 1 ? '' : 's'} — £0.00` }}
        </button>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  middleware: 'auth'
})

interface Dog {
  id: string
  name: string
  breed?: string
  photoUrl?: string
  nfcTagEnabled?: boolean
}

const authStore = useAuthStore()
const supabase = useSupabase()

const dogs = ref<Dog[]>([])
const selectedDogIds = ref<string[]>([])
const pageLoading = ref(true)
const submitting = ref(false)
const error = ref('')
const successMessage = ref('')

const shipping = reactive({
  name: '',
  email: '',
  phone: '',
  line1: '',
  line2: '',
  city: '',
  postcode: '',
  country: 'GB'
})

const allSelected = computed(() => dogs.value.length > 0 && selectedDogIds.value.length === dogs.value.length)

const toggleSelectAll = () => {
  if (allSelected.value) {
    selectedDogIds.value = []
  } else {
    selectedDogIds.value = dogs.value.map((d) => d.id)
  }
}

const waitForAuth = async () => {
  if ((authStore as any).loading) {
    await new Promise<void>((resolve) => {
      const check = () => {
        if (!(authStore as any).loading) resolve()
        else setTimeout(check, 50)
      }
      check()
    })
  }
}

const loadDogs = async () => {
  pageLoading.value = true
  error.value = ''
  try {
    await waitForAuth()
    if (!authStore.userId) return

    const { data, error: fetchError } = await supabase
      .from('doghealthy_dogs')
      .select('id, name, breed, photo_url, nfc_tag_enabled')
      .eq('user_id', authStore.userId)
      .eq('is_active', true)
      .order('created_at', { ascending: false })

    if (fetchError) throw fetchError

    dogs.value = (data || []).map((dog: any) => ({
      id: dog.id,
      name: dog.name,
      breed: dog.breed || undefined,
      photoUrl: dog.photo_url || undefined,
      nfcTagEnabled: !!dog.nfc_tag_enabled
    }))

    // Prefill shipping from profile/email
    shipping.email = authStore.user?.email || ''
    const { data: profile } = await supabase
      .from('doghealthy_users')
      .select('full_name, phone')
      .eq('id', authStore.userId)
      .single()

    if (profile?.full_name) shipping.name = profile.full_name
    if (profile?.phone) shipping.phone = profile.phone
  } catch (err: any) {
    console.error(err)
    error.value = err?.message || 'Failed to load dogs'
  } finally {
    pageLoading.value = false
  }
}

const submitOrder = async () => {
  error.value = ''
  successMessage.value = ''

  if (selectedDogIds.value.length === 0) {
    error.value = 'Please select at least one dog.'
    return
  }
  if (!shipping.name || !shipping.email || !shipping.line1 || !shipping.city || !shipping.postcode) {
    error.value = 'Please complete all required shipping fields.'
    return
  }

  submitting.value = true
  try {
    const { data: sessionData } = await supabase.auth.getSession()
    const accessToken = sessionData.session?.access_token
    if (!accessToken) {
      throw new Error('Your session has expired. Please log in again.')
    }

    const response = await $fetch<{
      success: boolean
      orderId: string
      dogs: Array<{ id: string; name: string; profileUrl: string }>
    }>('/.netlify/functions/nfc-create-order', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`
      },
      body: {
        dogIds: selectedDogIds.value,
        shipping: { ...shipping }
      }
    })

    successMessage.value = `Order submitted for ${response.dogs.length} dog${response.dogs.length === 1 ? '' : 's'}. Each NFC tag will link to that dog’s public profile.`
    selectedDogIds.value = []
    await loadDogs()
  } catch (err: any) {
    console.error('NFC order error:', err)
    error.value =
      err?.data?.error ||
      err?.data?.statusMessage ||
      err?.message ||
      'Unable to place NFC order. Please try again.'
  } finally {
    submitting.value = false
  }
}

onMounted(loadDogs)

useHead({
  title: 'Order NFC Dog Tags | DogHealthy',
  meta: [
    {
      name: 'description',
      content: 'Order NFC dog tags linked to your DogHealthy pet profiles. Multi-dog orders supported.'
    }
  ]
})
</script>
