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
            {{ orderTotalLabel }}
          </div>
        </div>
        <p class="text-gray-600 mb-2">
          Choose a tag product and one or more dogs. Each tag links to that dog’s public DogHealthy
          profile so anyone who finds them can identify them quickly.
        </p>
        <p class="text-sm text-gray-500">
          Products come from your NFC Me catalogue. Pick whichever active SKU you want to ship.
        </p>
      </div>

      <div v-if="pageLoading" class="text-center py-12">
        <div class="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <p class="mt-4 text-gray-600">Loading order options...</p>
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

      <div v-else-if="products.length === 0" class="bg-white rounded-xl shadow p-8 text-center">
        <h2 class="text-xl font-semibold text-gray-900 mb-2">No NFC products available</h2>
        <p class="text-gray-600">
          Add an active product in the NFC Me ops catalogue first, then refresh this page.
        </p>
      </div>

      <template v-else>
        <!-- Product selection -->
        <div class="bg-white rounded-xl shadow p-6 mb-6">
          <h2 class="text-xl font-semibold text-gray-900 mb-4">1. Choose tag product</h2>
          <div class="space-y-3">
            <label
              v-for="product in products"
              :key="product.id"
              class="flex items-start gap-4 p-4 border rounded-xl cursor-pointer transition-colors"
              :class="selectedProductId === product.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'"
            >
              <input
                v-model="selectedProductId"
                type="radio"
                :value="product.id"
                class="mt-1 h-5 w-5 border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <div class="flex-1 min-w-0">
                <div class="flex flex-wrap items-baseline justify-between gap-2">
                  <p class="font-semibold text-gray-900">{{ product.name }}</p>
                  <p class="text-sm font-medium text-gray-800">
                    {{ formatMoney(product.unit_price_cents, product.currency) }} each
                  </p>
                </div>
                <p class="text-sm text-gray-500 mt-1">
                  <code class="text-xs bg-gray-100 px-1.5 py-0.5 rounded">{{ product.sku }}</code>
                  · {{ product.form_factor }} · {{ product.tag_type }}
                  · min {{ product.min_order_qty }}
                </p>
                <p v-if="product.description" class="text-sm text-gray-600 mt-2">
                  {{ product.description }}
                </p>
                <p
                  v-if="selectedDogIds.length > 0 && selectedDogIds.length < product.min_order_qty"
                  class="text-sm text-amber-700 mt-2"
                >
                  Needs at least {{ product.min_order_qty }} tags — select more dogs or another product.
                </p>
              </div>
            </label>
          </div>
        </div>

        <!-- Dog selection -->
        <div class="bg-white rounded-xl shadow p-6 mb-6">
          <div class="flex items-center justify-between mb-4">
            <h2 class="text-xl font-semibold text-gray-900">2. Select dogs</h2>
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
          <h2 class="text-xl font-semibold text-gray-900 mb-4">3. Shipping details</h2>
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
          :disabled="submitting || !canSubmit"
          @click="submitOrder"
        >
          {{ submitLabel }}
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

interface NfcProduct {
  id: string
  sku: string
  name: string
  description?: string | null
  tag_type: string
  form_factor: string
  unit_price_cents: number
  currency: string
  min_order_qty: number
  stock_qty: number
}

const authStore = useAuthStore()
const supabase = useSupabase()

const dogs = ref<Dog[]>([])
const products = ref<NfcProduct[]>([])
const selectedDogIds = ref<string[]>([])
const selectedProductId = ref('')
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

const selectedProduct = computed(() =>
  products.value.find((p) => p.id === selectedProductId.value) || null
)

const allSelected = computed(() => dogs.value.length > 0 && selectedDogIds.value.length === dogs.value.length)

const orderTotalCents = computed(() => {
  if (!selectedProduct.value || selectedDogIds.value.length === 0) return 0
  return selectedProduct.value.unit_price_cents * selectedDogIds.value.length
})

const orderTotalLabel = computed(() => {
  if (!selectedProduct.value) return 'Choose a product'
  const currency = selectedProduct.value.currency || 'GBP'
  return formatMoney(orderTotalCents.value, currency)
})

const canSubmit = computed(() => {
  if (!selectedProduct.value || selectedDogIds.value.length === 0) return false
  return selectedDogIds.value.length >= (selectedProduct.value.min_order_qty || 1)
})

const submitLabel = computed(() => {
  if (submitting.value) return 'Submitting order...'
  const count = selectedDogIds.value.length
  const sku = selectedProduct.value?.sku || 'NFC tag'
  return `Order ${count || ''} × ${sku} — ${orderTotalLabel.value}`
})

const formatMoney = (cents: number, currency = 'GBP') => {
  try {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency
    }).format((cents || 0) / 100)
  } catch {
    return `£${((cents || 0) / 100).toFixed(2)}`
  }
}

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

const getAccessToken = async () => {
  const { data: sessionData } = await supabase.auth.getSession()
  const accessToken = sessionData.session?.access_token
  if (!accessToken) {
    throw new Error('Your session has expired. Please log in again.')
  }
  return accessToken
}

const loadPage = async () => {
  pageLoading.value = true
  error.value = ''
  try {
    await waitForAuth()
    if (!authStore.userId) return

    const accessToken = await getAccessToken()

    const [dogsResult, productsResult] = await Promise.all([
      supabase
        .from('doghealthy_dogs')
        .select('id, name, breed, photo_url, nfc_tag_enabled')
        .eq('user_id', authStore.userId)
        .eq('is_active', true)
        .order('created_at', { ascending: false }),
      $fetch<{ products: NfcProduct[]; defaultSku: string }>('/.netlify/functions/nfc-list-products', {
        headers: { Authorization: `Bearer ${accessToken}` }
      })
    ])

    if (dogsResult.error) throw dogsResult.error

    dogs.value = (dogsResult.data || []).map((dog: any) => ({
      id: dog.id,
      name: dog.name,
      breed: dog.breed || undefined,
      photoUrl: dog.photo_url || undefined,
      nfcTagEnabled: !!dog.nfc_tag_enabled
    }))

    products.value = productsResult.products || []
    const defaultProduct =
      products.value.find((p) => p.sku === productsResult.defaultSku) ||
      products.value[0]
    selectedProductId.value = defaultProduct?.id || ''

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
    error.value = err?.data?.error || err?.message || 'Failed to load NFC order page'
  } finally {
    pageLoading.value = false
  }
}

const submitOrder = async () => {
  error.value = ''
  successMessage.value = ''

  if (!selectedProduct.value) {
    error.value = 'Please choose a tag product.'
    return
  }
  if (selectedDogIds.value.length === 0) {
    error.value = 'Please select at least one dog.'
    return
  }
  if (selectedDogIds.value.length < selectedProduct.value.min_order_qty) {
    error.value = `Minimum order quantity for ${selectedProduct.value.sku} is ${selectedProduct.value.min_order_qty}.`
    return
  }
  if (!shipping.name || !shipping.email || !shipping.line1 || !shipping.city || !shipping.postcode) {
    error.value = 'Please complete all required shipping fields.'
    return
  }

  submitting.value = true
  try {
    const accessToken = await getAccessToken()

    const response = await $fetch<{
      success: boolean
      orderId: string
      product?: { sku: string; name: string }
      dogs: Array<{ id: string; name: string; profileUrl: string }>
    }>('/.netlify/functions/nfc-create-order', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`
      },
      body: {
        dogIds: selectedDogIds.value,
        productId: selectedProduct.value.id,
        productSku: selectedProduct.value.sku,
        shipping: { ...shipping }
      }
    })

    const productName = response.product?.name || selectedProduct.value.name
    successMessage.value = `Order submitted for ${response.dogs.length} × ${productName}. Each NFC tag will link to that dog’s public profile.`
    selectedDogIds.value = []
    await loadPage()
  } catch (err: any) {
    console.error('NFC order error:', err)
    error.value =
      err?.data?.error ||
      err?.data?.details?.error ||
      err?.data?.statusMessage ||
      err?.message ||
      'Unable to place NFC order. Please try again.'
  } finally {
    submitting.value = false
  }
}

onMounted(loadPage)

usePageSeo({
  title: 'NFC & QR Dog Tags — Found-Pet Alerts for UK Owners',
  description:
    'Order DogHealthy NFC and QR dog tags linked to your pet’s profile. When someone finds your dog in the UK, they can scan the tag to alert you — with GPS, check-in and walk tools.',
  keywords:
    'NFC dog tag UK, QR pet tag, dog ID tag, found dog alert, lost dog NFC tag, DogHealthy tag, pet microchip alternative QR, smart dog tag UK',
  path: '/nfc-tags'
})
</script>
