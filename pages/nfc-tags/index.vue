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
          <h1 class="text-3xl font-bold text-gray-900">Order NFC stickers</h1>
          <div class="rounded-full bg-green-100 text-green-800 px-4 py-1.5 text-sm font-semibold">
            {{ orderTotalLabel }}
          </div>
        </div>
        <p class="text-gray-600 mb-2">
          Order <strong>2 stickers per dog</strong> by default — white
          <strong>25mm × 25mm NFC stickers</strong> at <strong>£1 each</strong>.
          Kennels can select many dogs; everything ships in <strong>one parcel</strong>.
        </p>
        <p class="text-sm text-gray-500">
          Postage: 1st Class £1.80 or 2nd Class 91p
          (free when you order {{ freePostageThreshold }}+ stickers).
        </p>
      </div>

      <div v-if="pageLoading" class="text-center py-12">
        <div class="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <p class="mt-4 text-gray-600">Loading order options...</p>
      </div>

      <div v-else-if="dogs.length === 0" class="bg-white rounded-xl shadow p-8 text-center">
        <div class="text-5xl mb-4">🐕</div>
        <h2 class="text-xl font-semibold text-gray-900 mb-2">No dogs registered yet</h2>
        <p class="text-gray-600 mb-6">Add a dog first, then come back to order NFC stickers.</p>
        <NuxtLink
          to="/dogs"
          class="inline-block bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold"
        >
          Go to My Dogs
        </NuxtLink>
      </div>

      <div v-else-if="products.length === 0" class="bg-white rounded-xl shadow p-8 text-center">
        <h2 class="text-xl font-semibold text-gray-900 mb-2">Sticker product unavailable</h2>
        <p class="text-gray-600">The 25mm NFC white sticker is not configured yet. Please try again shortly.</p>
      </div>

      <template v-else>
        <!-- Order type -->
        <div class="bg-white rounded-xl shadow p-6 mb-6">
          <h2 class="text-xl font-semibold text-gray-900 mb-4">1. Order type</h2>
          <div class="grid sm:grid-cols-2 gap-3">
            <label
              class="flex items-start gap-3 p-4 border rounded-xl cursor-pointer"
              :class="orderType === 'new' ? 'border-blue-500 bg-blue-50' : 'border-gray-200'"
            >
              <input v-model="orderType" type="radio" value="new" class="mt-1" />
              <span>
                <span class="font-semibold text-gray-900 block">New stickers</span>
                <span class="text-sm text-gray-600">2 stickers for each selected dog</span>
              </span>
            </label>
            <label
              class="flex items-start gap-3 p-4 border rounded-xl cursor-pointer"
              :class="orderType === 'replacement' ? 'border-blue-500 bg-blue-50' : 'border-gray-200'"
            >
              <input v-model="orderType" type="radio" value="replacement" class="mt-1" />
              <span>
                <span class="font-semibold text-gray-900 block">Replace damaged</span>
                <span class="text-sm text-gray-600">Reorder 1 or 2 stickers for selected dogs</span>
              </span>
            </label>
          </div>

          <div v-if="orderType === 'replacement'" class="mt-4">
            <label class="block text-sm font-medium text-gray-700 mb-2">Stickers per selected dog</label>
            <div class="flex gap-3">
              <label class="inline-flex items-center gap-2 text-sm">
                <input v-model.number="tagsPerDog" type="radio" :value="1" />
                1 (single replacement)
              </label>
              <label class="inline-flex items-center gap-2 text-sm">
                <input v-model.number="tagsPerDog" type="radio" :value="2" />
                2 (pair)
              </label>
            </div>
          </div>
        </div>

        <!-- Product (single SKU) -->
        <div class="bg-white rounded-xl shadow p-6 mb-6">
          <h2 class="text-xl font-semibold text-gray-900 mb-4">2. Sticker product</h2>
          <div
            v-if="selectedProduct"
            class="flex items-center gap-4"
          >
            <div
              class="h-16 w-16 shrink-0 rounded-full bg-white border border-black"
              aria-hidden="true"
            />
            <div class="flex-1 min-w-0">
              <div class="flex flex-wrap items-baseline justify-between gap-2">
                <p class="font-semibold text-gray-900">{{ selectedProduct.name }}</p>
                <p class="text-sm font-semibold text-gray-900">
                  {{ formatMoney(selectedProduct.unit_price_cents, selectedProduct.currency) }} each
                </p>
              </div>
              <p v-if="selectedProduct.description" class="text-sm text-gray-600 mt-1">
                {{ selectedProduct.description }}
              </p>
              <p class="text-xs text-gray-500 mt-2">
                Paid securely with Stripe (same checkout as subscriptions).
              </p>
            </div>
          </div>
        </div>

        <!-- Dogs -->
        <div class="bg-white rounded-xl shadow p-6 mb-6">
          <div class="flex items-center justify-between mb-4">
            <h2 class="text-xl font-semibold text-gray-900">3. Select dogs</h2>
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

        <!-- Postage -->
        <div class="bg-white rounded-xl shadow p-6 mb-6">
          <h2 class="text-xl font-semibold text-gray-900 mb-4">4. Postage</h2>
          <p
            v-if="postageFree"
            class="mb-4 rounded-lg border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-800"
          >
            Free postage — {{ freePostageThreshold }}+ stickers in this order.
          </p>
          <div class="grid sm:grid-cols-2 gap-3" :class="{ 'opacity-50 pointer-events-none': postageFree }">
            <label
              class="flex items-start gap-3 p-4 border rounded-xl cursor-pointer"
              :class="postageClass === 'first' ? 'border-blue-500 bg-blue-50' : 'border-gray-200'"
            >
              <input v-model="postageClass" type="radio" value="first" class="mt-1" :disabled="postageFree" />
              <span>
                <span class="font-semibold text-gray-900 block">1st Class stamp</span>
                <span class="text-sm text-gray-600">{{ formatMoney(POSTAGE_FIRST_CENTS) }}</span>
              </span>
            </label>
            <label
              class="flex items-start gap-3 p-4 border rounded-xl cursor-pointer"
              :class="postageClass === 'second' ? 'border-blue-500 bg-blue-50' : 'border-gray-200'"
            >
              <input v-model="postageClass" type="radio" value="second" class="mt-1" :disabled="postageFree" />
              <span>
                <span class="font-semibold text-gray-900 block">2nd Class stamp</span>
                <span class="text-sm text-gray-600">{{ formatMoney(POSTAGE_SECOND_CENTS) }}</span>
              </span>
            </label>
          </div>
        </div>

        <!-- Summary -->
        <div class="bg-white rounded-xl shadow p-6 mb-6">
          <h2 class="text-xl font-semibold text-gray-900 mb-4">5. Order summary</h2>
          <dl class="space-y-2 text-sm">
            <div class="flex justify-between gap-4">
              <dt class="text-gray-600">Dogs selected</dt>
              <dd class="font-medium text-gray-900">{{ selectedDogIds.length }}</dd>
            </div>
            <div class="flex justify-between gap-4">
              <dt class="text-gray-600">Stickers per dog</dt>
              <dd class="font-medium text-gray-900">{{ effectiveTagsPerDog }}</dd>
            </div>
            <div class="flex justify-between gap-4">
              <dt class="text-gray-600">Total stickers</dt>
              <dd class="font-medium text-gray-900">{{ tagQuantity }}</dd>
            </div>
            <div class="flex justify-between gap-4">
              <dt class="text-gray-600">Stickers subtotal</dt>
              <dd class="font-medium text-gray-900">{{ formatMoney(subtotalCents) }}</dd>
            </div>
            <div class="flex justify-between gap-4">
              <dt class="text-gray-600">
                Postage
                <span v-if="postageFree" class="text-green-700">(free)</span>
                <span v-else class="text-gray-400"> — {{ postageClassLabel }}</span>
              </dt>
              <dd class="font-medium text-gray-900">{{ formatMoney(postageCents) }}</dd>
            </div>
            <div class="flex justify-between gap-4 border-t border-gray-200 pt-3 text-base">
              <dt class="font-semibold text-gray-900">Total</dt>
              <dd class="font-bold text-gray-900">{{ formatMoney(totalCents) }}</dd>
            </div>
          </dl>
        </div>

        <!-- Shipping -->
        <div class="bg-white rounded-xl shadow p-6 mb-6">
          <h2 class="text-xl font-semibold text-gray-900 mb-4">6. Shipping address</h2>
          <p class="text-sm text-gray-500 mb-4">All stickers in this order go to one address.</p>
          <div class="grid sm:grid-cols-2 gap-4">
            <div class="sm:col-span-2">
              <label class="block text-sm font-medium text-gray-700 mb-1">Full name</label>
              <input v-model="shipping.name" type="text" class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input v-model="shipping.email" type="email" class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Phone</label>
              <input v-model="shipping.phone" type="tel" class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500" />
            </div>
            <div class="sm:col-span-2">
              <label class="block text-sm font-medium text-gray-700 mb-1">Address line 1</label>
              <input v-model="shipping.line1" type="text" class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500" />
            </div>
            <div class="sm:col-span-2">
              <label class="block text-sm font-medium text-gray-700 mb-1">Address line 2 (optional)</label>
              <input v-model="shipping.line2" type="text" class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">City</label>
              <input v-model="shipping.city" type="text" class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Postcode</label>
              <input v-model="shipping.postcode" type="text" class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Country</label>
              <select v-model="shipping.country" class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500">
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

const TAGS_PER_DOG_DEFAULT = 2
const POSTAGE_FIRST_CENTS = 180
const POSTAGE_SECOND_CENTS = 91
const FREE_POSTAGE_TAG_THRESHOLD = 20

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

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const supabase = useSupabase()

const dogs = ref<Dog[]>([])
const products = ref<NfcProduct[]>([])
const selectedDogIds = ref<string[]>([])
const selectedProductId = ref('')
const orderType = ref<'new' | 'replacement'>('new')
const tagsPerDog = ref(2)
const postageClass = ref<'first' | 'second'>('second')
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

const freePostageThreshold = FREE_POSTAGE_TAG_THRESHOLD

const selectedProduct = computed(() =>
  products.value.find((p) => p.id === selectedProductId.value) || null
)

const effectiveTagsPerDog = computed(() =>
  orderType.value === 'new' ? TAGS_PER_DOG_DEFAULT : tagsPerDog.value
)

const tagQuantity = computed(() => selectedDogIds.value.length * effectiveTagsPerDog.value)

const subtotalCents = computed(() => {
  if (!selectedProduct.value) return 0
  return selectedProduct.value.unit_price_cents * tagQuantity.value
})

const postageFree = computed(
  () => tagQuantity.value > 0 && tagQuantity.value >= FREE_POSTAGE_TAG_THRESHOLD
)

const postageCents = computed(() => {
  if (tagQuantity.value === 0 || postageFree.value) return 0
  return postageClass.value === 'first' ? POSTAGE_FIRST_CENTS : POSTAGE_SECOND_CENTS
})

const postageClassLabel = computed(() =>
  postageClass.value === 'first' ? '1st Class' : '2nd Class'
)

const totalCents = computed(() => subtotalCents.value + postageCents.value)

const allSelected = computed(() => dogs.value.length > 0 && selectedDogIds.value.length === dogs.value.length)

const orderTotalLabel = computed(() => {
  if (!selectedProduct.value || selectedDogIds.value.length === 0) return 'Select dogs'
  return formatMoney(totalCents.value, selectedProduct.value.currency)
})

const canSubmit = computed(() => {
  if (!selectedProduct.value || selectedDogIds.value.length === 0) return false
  if (orderType.value === 'new') {
    const min = selectedProduct.value.min_order_qty || 1
    return tagQuantity.value >= min
  }
  return tagQuantity.value >= 1
})

const submitLabel = computed(() => {
  if (submitting.value) return 'Redirecting to payment…'
  if (!canSubmit.value) return 'Complete the form to continue'
  return `Pay ${orderTotalLabel.value} — ${tagQuantity.value} stickers`
})

const formatMoney = (cents: number, currency = 'GBP') => {
  try {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: currency.toUpperCase()
    }).format((cents || 0) / 100)
  } catch {
    return `£${((cents || 0) / 100).toFixed(2)}`
  }
}

const toggleSelectAll = () => {
  selectedDogIds.value = allSelected.value ? [] : dogs.value.map((d) => d.id)
}

watch(orderType, (type) => {
  if (type === 'new') tagsPerDog.value = 2
})

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
  if (!accessToken) throw new Error('Your session has expired. Please log in again.')
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
      products.value.find((p) => p.sku === productsResult.defaultSku) || products.value[0]
    selectedProductId.value = defaultProduct?.id || ''

    shipping.email = authStore.user?.email || ''
    const { data: profile } = await supabase
      .from('doghealthy_users')
      .select(
        'full_name, phone, billing_name, address_line1, address_line2, address_city, address_postcode, address_country'
      )
      .eq('id', authStore.userId)
      .single()

    if (profile?.billing_name || profile?.full_name) {
      shipping.name = profile.billing_name || profile.full_name
    }
    if (profile?.phone) shipping.phone = profile.phone
    if (profile?.address_line1) shipping.line1 = profile.address_line1
    if (profile?.address_line2) shipping.line2 = profile.address_line2
    if (profile?.address_city) shipping.city = profile.address_city
    if (profile?.address_postcode) shipping.postcode = profile.address_postcode
    if (profile?.address_country) shipping.country = profile.address_country

    // Deep-link: /nfc-tags?dogId=…&mode=replace
    const dogId = typeof route.query.dogId === 'string' ? route.query.dogId : ''
    const mode = typeof route.query.mode === 'string' ? route.query.mode : ''
    if (mode === 'replace' || mode === 'replacement') {
      orderType.value = 'replacement'
      tagsPerDog.value = route.query.qty === '1' ? 1 : 2
    }
    if (dogId && dogs.value.some((d) => d.id === dogId)) {
      selectedDogIds.value = [dogId]
    }
  } catch (err: any) {
    console.error(err)
    error.value = err?.data?.error || err?.message || 'Failed to load NFC order page'
  } finally {
    pageLoading.value = false
  }
}

const confirmPaidOrder = async (sessionId: string) => {
  submitting.value = true
  error.value = ''
  try {
    const accessToken = await getAccessToken()
    const result = await $fetch<{
      ok: boolean
      tagQuantity?: number
      dogCount?: number
      orderType?: string
    }>('/.netlify/functions/nfc-confirm-order', {
      method: 'POST',
      headers: { Authorization: `Bearer ${accessToken}` },
      body: { sessionId }
    })

    successMessage.value =
      result.orderType === 'replacement'
        ? `Payment received. Replacement stickers (${result.tagQuantity}) are being prepared for postage.`
        : `Payment received. ${result.tagQuantity} stickers for ${result.dogCount} dog(s) will ship together.`

    selectedDogIds.value = []
    await router.replace({ path: '/nfc-tags', query: {} })
    await loadPage()
  } catch (err: any) {
    error.value =
      err?.data?.error ||
      err?.message ||
      'Payment may have succeeded; contact support if stickers do not appear.'
  } finally {
    submitting.value = false
  }
}

const submitOrder = async () => {
  error.value = ''
  successMessage.value = ''

  if (!selectedProduct.value) {
    error.value = 'Please choose a sticker product.'
    return
  }
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
    const accessToken = await getAccessToken()
    const response = await $fetch<{ url: string }>('/.netlify/functions/nfc-create-order', {
      method: 'POST',
      headers: { Authorization: `Bearer ${accessToken}` },
      body: {
        dogIds: selectedDogIds.value,
        productId: selectedProduct.value.id,
        productSku: selectedProduct.value.sku,
        tagsPerDog: effectiveTagsPerDog.value,
        orderType: orderType.value,
        postageClass: postageClass.value,
        shipping: { ...shipping }
      }
    })

    if (!response?.url) throw new Error('No checkout URL returned')
    window.location.href = response.url
  } catch (err: any) {
    console.error('NFC order error:', err)
    error.value =
      err?.data?.error ||
      err?.message ||
      'Unable to start checkout. Please try again.'
    submitting.value = false
  }
}

onMounted(async () => {
  await loadPage()

  if (route.query.order === 'cancelled') {
    error.value = 'Checkout was cancelled. You can adjust the order and try again.'
  }

  const sessionId = typeof route.query.session_id === 'string' ? route.query.session_id : ''
  if (route.query.order === 'success' && sessionId.startsWith('cs_')) {
    await confirmPaidOrder(sessionId)
  }
})

usePageSeo({
  title: 'NFC & QR Dog Tags — Found-Pet Alerts for UK Owners',
  description:
    'Order DogHealthy NFC stickers — 2 per dog, one postage fee for the whole batch. Replace damaged tags for individual dogs.',
  keywords:
    'NFC dog tag UK, QR pet tag, dog ID tag, found dog alert, lost dog NFC tag, DogHealthy tag, kennel NFC tags bulk',
  path: '/nfc-tags'
})
</script>
