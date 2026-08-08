<template>
  <div
    v-if="open"
    class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
    role="dialog"
    aria-modal="true"
    aria-labelledby="extra-dogs-title"
  >
    <div class="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto p-6">
      <h2 id="extra-dogs-title" class="text-xl font-bold text-gray-900 mb-2">
        Add Multiple Dogs
      </h2>
      <p class="text-sm text-gray-600 mb-5">
        Your first {{ freeLimit }} dogs are free. After that each dog is
        <strong>£2</strong> and includes NFC + QR codes.
        We’ll create placeholder profiles (dog{{ nextDogNumber }}, dog{{ nextDogNumber + 1 }}…)
        that you can rename.
      </p>

      <div v-if="error" class="mb-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
        {{ error }}
      </div>

      <div class="mb-4">
        <label class="block text-sm font-medium text-gray-700 mb-1" for="extra-qty">
          How many dogs do you want to add?
        </label>
        <input
          id="extra-qty"
          v-model.number="quantity"
          type="number"
          min="1"
          max="100"
          class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div v-if="needsPayment" class="mb-4">
        <p class="block text-sm font-medium text-gray-700 mb-2">Postage for NFC stickers</p>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <label
            class="flex items-start gap-3 p-3 border rounded-xl cursor-pointer"
            :class="postageClass === 'first' ? 'border-blue-500 bg-blue-50' : 'border-gray-200'"
          >
            <input v-model="postageClass" type="radio" value="first" class="mt-1" />
            <span>
              <span class="font-semibold text-gray-900 block">1st Class stamp</span>
              <span class="text-sm text-gray-600">{{ formatMoney(POSTAGE_FIRST_CENTS) }}</span>
            </span>
          </label>
          <label
            class="flex items-start gap-3 p-3 border rounded-xl cursor-pointer"
            :class="postageClass === 'second' ? 'border-blue-500 bg-blue-50' : 'border-gray-200'"
          >
            <input v-model="postageClass" type="radio" value="second" class="mt-1" />
            <span>
              <span class="font-semibold text-gray-900 block">2nd Class stamp</span>
              <span class="text-sm text-gray-600">{{ formatMoney(POSTAGE_SECOND_CENTS) }}</span>
            </span>
          </label>
        </div>
      </div>

      <dl class="mb-5 rounded-lg bg-slate-50 border border-slate-200 px-4 py-3 text-sm space-y-1">
        <div v-if="freeInOrder > 0" class="flex justify-between gap-3">
          <dt class="text-gray-600">{{ freeInOrder }} × free dogs</dt>
          <dd class="font-medium">{{ formatMoney(0) }}</dd>
        </div>
        <div v-if="paidQty > 0" class="flex justify-between gap-3">
          <dt class="text-gray-600">{{ paidQty }} × extra dogs @ £2 (NFC + QR)</dt>
          <dd class="font-medium">{{ formatMoney(subtotalCents) }}</dd>
        </div>
        <div v-if="needsPayment" class="flex justify-between gap-3">
          <dt class="text-gray-600">Postage</dt>
          <dd class="font-medium">{{ formatMoney(postageCents) }}</dd>
        </div>
        <div class="flex justify-between gap-3 border-t border-slate-200 pt-2 text-base">
          <dt class="font-semibold text-gray-900">Total</dt>
          <dd class="font-bold text-gray-900">{{ formatMoney(totalCents) }}</dd>
        </div>
      </dl>

      <div v-if="needsPayment" class="grid sm:grid-cols-2 gap-3 mb-4">
        <div class="sm:col-span-2">
          <label class="block text-sm font-medium text-gray-700 mb-1">Full name</label>
          <input v-model="shipping.name" type="text" class="w-full px-3 py-2 border border-gray-300 rounded-lg" />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Email</label>
          <input v-model="shipping.email" type="email" class="w-full px-3 py-2 border border-gray-300 rounded-lg" />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Phone</label>
          <input v-model="shipping.phone" type="tel" class="w-full px-3 py-2 border border-gray-300 rounded-lg" />
        </div>
        <div class="sm:col-span-2">
          <label class="block text-sm font-medium text-gray-700 mb-1">Address line 1</label>
          <input v-model="shipping.line1" type="text" class="w-full px-3 py-2 border border-gray-300 rounded-lg" />
        </div>
        <div class="sm:col-span-2">
          <label class="block text-sm font-medium text-gray-700 mb-1">Address line 2</label>
          <input v-model="shipping.line2" type="text" class="w-full px-3 py-2 border border-gray-300 rounded-lg" />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">City</label>
          <input v-model="shipping.city" type="text" class="w-full px-3 py-2 border border-gray-300 rounded-lg" />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Postcode</label>
          <input v-model="shipping.postcode" type="text" class="w-full px-3 py-2 border border-gray-300 rounded-lg uppercase" />
        </div>
      </div>

      <p v-if="needsPayment" class="text-xs text-gray-500 mb-4">
        Pay securely with Stripe Checkout (card; PayPal appears if enabled on your Stripe account).
      </p>
      <p v-else class="text-xs text-gray-500 mb-4">
        These dogs are within your free allowance — no payment needed.
      </p>

      <div class="flex flex-wrap gap-2 justify-end">
        <button
          type="button"
          class="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50"
          :disabled="submitting"
          @click="$emit('close')"
        >
          Cancel
        </button>
        <button
          type="button"
          class="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold disabled:opacity-60"
          :disabled="submitting || safeQty < 1"
          @click="goPay"
        >
          {{ submitLabel }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const FREE_LIMIT = 3
const UNIT_CENTS = 200
const POSTAGE_FIRST_CENTS = 180
const POSTAGE_SECOND_CENTS = 91

const props = defineProps<{
  open: boolean
  existingDogCount: number
}>()

const emit = defineEmits<{
  close: []
  created: [payload: { names: string[]; dogIds: string[] }]
}>()

const supabase = useSupabase()
const authStore = useAuthStore()

const quantity = ref(1)
const postageClass = ref<'first' | 'second'>('second')
const submitting = ref(false)
const error = ref('')
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

const freeLimit = FREE_LIMIT
const nextDogNumber = computed(() => props.existingDogCount + 1)
const safeQty = computed(() => {
  const n = Math.floor(Number(quantity.value) || 0)
  return Math.min(100, Math.max(0, n))
})
const freeSlots = computed(() => Math.max(0, FREE_LIMIT - props.existingDogCount))
const freeInOrder = computed(() => Math.min(safeQty.value, freeSlots.value))
const paidQty = computed(() => Math.max(0, safeQty.value - freeInOrder.value))
const needsPayment = computed(() => paidQty.value > 0)
const subtotalCents = computed(() => paidQty.value * UNIT_CENTS)
const postageCents = computed(() => {
  if (!needsPayment.value) return 0
  return postageClass.value === 'first' ? POSTAGE_FIRST_CENTS : POSTAGE_SECOND_CENTS
})
const totalCents = computed(() => subtotalCents.value + postageCents.value)
const submitLabel = computed(() => {
  if (submitting.value) {
    return needsPayment.value ? 'Redirecting to payment…' : 'Adding dogs…'
  }
  if (!needsPayment.value) return `Add ${safeQty.value} free dog${safeQty.value === 1 ? '' : 's'}`
  return `Go — pay ${formatMoney(totalCents.value)}`
})

const formatMoney = (cents: number) =>
  new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP' }).format((cents || 0) / 100)

const prefillShipping = async () => {
  if (!authStore.userId) return
  shipping.email = authStore.user?.email || shipping.email
  const { data } = await supabase
    .from('doghealthy_users')
    .select(
      'full_name, phone, billing_name, address_line1, address_line2, address_city, address_postcode, address_country'
    )
    .eq('id', authStore.userId)
    .maybeSingle()
  if (!data) return
  shipping.name = data.billing_name || data.full_name || shipping.name
  if (data.phone) shipping.phone = data.phone
  if (data.address_line1) shipping.line1 = data.address_line1
  if (data.address_line2) shipping.line2 = data.address_line2
  if (data.address_city) shipping.city = data.address_city
  if (data.address_postcode) shipping.postcode = data.address_postcode
  if (data.address_country) shipping.country = data.address_country
}

watch(
  () => props.open,
  async (isOpen) => {
    if (!isOpen) return
    error.value = ''
    submitting.value = false
    const remainingFree = Math.max(0, FREE_LIMIT - props.existingDogCount)
    quantity.value = remainingFree > 0 ? remainingFree : 1
    postageClass.value = 'second'
    await prefillShipping()
  }
)

const goPay = async () => {
  error.value = ''
  if (safeQty.value < 1) {
    error.value = 'Enter how many dogs you want to add.'
    return
  }
  if (needsPayment.value) {
    if (!shipping.name || !shipping.email || !shipping.line1 || !shipping.city || !shipping.postcode) {
      error.value = 'Please complete the shipping address for NFC stickers.'
      return
    }
  }

  submitting.value = true
  try {
    const { data: sessionData } = await supabase.auth.getSession()
    const token = sessionData.session?.access_token
    if (!token) throw new Error('Please log in again.')

    const result = await $fetch<{
      url?: string
      free?: boolean
      names?: string[]
      dogIds?: string[]
      mode?: string
      sessionId?: string
    }>('/.netlify/functions/extra-dogs-create-checkout', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: {
        quantity: safeQty.value,
        postageClass: postageClass.value,
        shipping: { ...shipping }
      }
    })

    if (result?.free) {
      emit('created', { names: result.names || [], dogIds: result.dogIds || [] })
      emit('close')
      submitting.value = false
      return
    }

    if (!result?.url) throw new Error('No checkout URL returned')
    window.location.href = result.url
  } catch (err: any) {
    error.value = err?.data?.error || err?.message || 'Unable to start checkout.'
    submitting.value = false
  }
}
</script>
