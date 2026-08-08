<template>
  <div
    v-if="open"
    class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
    role="dialog"
    aria-modal="true"
    aria-labelledby="nfc-address-title"
  >
    <div class="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto p-6">
      <h2 id="nfc-address-title" class="text-xl font-bold text-gray-900 mb-2">
        Shipping address for NFC stickers
      </h2>
      <p class="text-sm text-gray-600 mb-5">
        NFC Me will print and post stickers to this UK address for
        {{ dogName || 'your dog' }}. Your QR code is ready online immediately —
        next you’ll confirm the sticker order.
      </p>

      <div v-if="error" class="mb-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
        {{ error }}
      </div>

      <form class="space-y-4" @submit.prevent="submit">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1" for="billing_name">Full name</label>
          <input
            id="billing_name"
            v-model="form.billing_name"
            type="text"
            required
            autocomplete="name"
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1" for="address_line1">Address line 1</label>
          <input
            id="address_line1"
            v-model="form.address_line1"
            type="text"
            required
            autocomplete="address-line1"
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1" for="address_line2">Address line 2 (optional)</label>
          <input
            id="address_line2"
            v-model="form.address_line2"
            type="text"
            autocomplete="address-line2"
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1" for="address_city">Town / city</label>
            <input
              id="address_city"
              v-model="form.address_city"
              type="text"
              required
              autocomplete="address-level2"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1" for="address_postcode">Postcode</label>
            <input
              id="address_postcode"
              v-model="form.address_postcode"
              type="text"
              required
              autocomplete="postal-code"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 uppercase"
            />
          </div>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1" for="address_country">Country</label>
          <select
            id="address_country"
            v-model="form.address_country"
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="GB">United Kingdom</option>
          </select>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1" for="ship_phone">UK mobile (optional)</label>
          <input
            id="ship_phone"
            v-model="form.phone"
            type="tel"
            autocomplete="tel"
            placeholder="+447…"
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div class="flex flex-col-reverse sm:flex-row sm:justify-end gap-2 pt-2">
          <button
            type="button"
            class="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 font-medium hover:bg-gray-50"
            :disabled="saving"
            @click="$emit('cancel')"
          >
            Cancel
          </button>
          <button
            type="submit"
            class="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-semibold"
            :disabled="saving"
          >
            {{ saving ? 'Saving…' : confirmLabel }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
export type NfcShippingAddress = {
  billing_name: string
  address_line1: string
  address_line2: string
  address_city: string
  address_postcode: string
  address_country: string
  phone: string
}

const props = withDefaults(
  defineProps<{
    open: boolean
    dogName?: string
    dogId?: string
    initial?: Partial<NfcShippingAddress>
    confirmLabel?: string
  }>(),
  {
    dogName: '',
    dogId: '',
    confirmLabel: 'Save address & create tag'
  }
)

const emit = defineEmits<{
  cancel: []
  saved: [address: NfcShippingAddress]
}>()

const authStore = useAuthStore()
const supabase = useSupabase()

const saving = ref(false)
const error = ref('')

const form = reactive<NfcShippingAddress>({
  billing_name: '',
  address_line1: '',
  address_line2: '',
  address_city: '',
  address_postcode: '',
  address_country: 'GB',
  phone: ''
})

watch(
  () => props.open,
  (isOpen) => {
    if (!isOpen) return
    error.value = ''
    form.billing_name = props.initial?.billing_name || ''
    form.address_line1 = props.initial?.address_line1 || ''
    form.address_line2 = props.initial?.address_line2 || ''
    form.address_city = props.initial?.address_city || ''
    form.address_postcode = props.initial?.address_postcode || ''
    form.address_country = props.initial?.address_country || 'GB'
    form.phone = props.initial?.phone || ''
  },
  { immediate: true }
)

const submit = async () => {
  saving.value = true
  error.value = ''
  try {
    if (!authStore.userId) throw new Error('Please sign in again.')

    const payload = {
      billing_name: form.billing_name.trim(),
      address_line1: form.address_line1.trim(),
      address_line2: form.address_line2.trim() || null,
      address_city: form.address_city.trim(),
      address_postcode: form.address_postcode.trim().toUpperCase(),
      address_country: form.address_country || 'GB',
      phone: form.phone.trim() || null
    }

    if (!payload.billing_name || !payload.address_line1 || !payload.address_city || !payload.address_postcode) {
      throw new Error('Please complete all required address fields.')
    }

    const { error: updateError } = await supabase
      .from('doghealthy_users')
      .update(payload)
      .eq('id', authStore.userId)

    if (updateError) throw updateError

    emit('saved', {
      billing_name: payload.billing_name,
      address_line1: payload.address_line1,
      address_line2: payload.address_line2 || '',
      address_city: payload.address_city,
      address_postcode: payload.address_postcode,
      address_country: payload.address_country,
      phone: payload.phone || ''
    })
  } catch (err: any) {
    error.value = err?.message || 'Failed to save address'
  } finally {
    saving.value = false
  }
}
</script>
