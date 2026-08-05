<template>
  <AdminShell title="NFC sticker orders" subtitle="Paid batch orders — tags ship together in one parcel.">
    <div class="mb-4 flex flex-wrap gap-2">
      <button
        v-for="opt in filters"
        :key="opt.value"
        type="button"
        class="px-3 py-2 text-sm rounded-lg border"
        :class="statusFilter === opt.value ? 'bg-slate-900 text-white border-slate-900' : 'border-slate-300'"
        @click="setFilter(opt.value)"
      >
        {{ opt.label }}
      </button>
      <button
        type="button"
        class="px-3 py-2 text-sm rounded-lg border border-slate-300"
        :disabled="loading"
        @click="load()"
      >
        Refresh
      </button>
    </div>

    <div v-if="error" class="mb-4 text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
      {{ error }}
    </div>
    <div v-if="loading" class="text-slate-600 py-8">Loading orders…</div>

    <div v-else class="space-y-4">
      <article
        v-for="order in orders"
        :key="order.id"
        class="bg-white rounded-xl border border-slate-200 shadow-sm p-5"
      >
        <div class="flex flex-wrap items-start justify-between gap-3 mb-3">
          <div>
            <h2 class="font-semibold text-slate-900">
              {{ order.shipping_name }}
              <span class="text-slate-500 font-normal">· {{ order.shipping_email }}</span>
            </h2>
            <p class="text-xs text-slate-500 mt-1">
              {{ formatDate(order.created_at) }}
              · {{ order.order_type || 'new' }}
              · {{ order.dog_ids?.length || 0 }} dogs × {{ order.tags_per_dog || 2 }} =
              {{ order.tag_quantity || '—' }} stickers
            </p>
          </div>
          <div class="text-right text-sm">
            <p class="font-semibold capitalize">{{ order.status }}</p>
            <p class="text-slate-500 capitalize">{{ order.payment_status }}</p>
            <p v-if="order.total_cents != null" class="font-medium text-slate-900 mt-1">
              {{ formatMoney(order.total_cents, order.currency) }}
            </p>
          </div>
        </div>

        <div class="rounded-lg bg-slate-50 border border-slate-200 px-4 py-3 text-sm whitespace-pre-line text-slate-800">
{{ formatAddress(order) }}
        </div>

        <div class="mt-3 flex flex-wrap gap-3 text-sm">
          <NuxtLink
            v-if="order.user_id"
            :to="`/admin/users/${order.user_id}`"
            class="text-blue-700 hover:underline"
          >
            Owner
          </NuxtLink>
          <span v-if="order.product_sku" class="text-slate-500">SKU {{ order.product_sku }}</span>
          <span v-if="order.nfc_me_order_id" class="text-slate-500">NFC Me #{{ order.nfc_me_order_id }}</span>
          <span class="text-slate-400">
            Postage {{ formatMoney(order.postage_cents || 0, order.currency) }}
          </span>
        </div>
      </article>

      <p v-if="orders.length === 0" class="text-center text-slate-500 py-8">No orders in this filter.</p>

      <AdminPagination
        v-model:page="page"
        :total="total"
        :disabled="loading"
      />
    </div>
  </AdminShell>
</template>

<script setup lang="ts">
import { adminPageRange } from '~/utils/adminPagination'

definePageMeta({
  middleware: ['auth', 'admin'],
  layout: false
})

usePageSeo({
  title: 'Admin NFC orders — DogHealthy',
  path: '/admin/nfc-orders',
  index: false
})

type OrderRow = {
  id: string
  user_id: string
  dog_ids: string[] | null
  status: string
  order_type: string | null
  tags_per_dog: number | null
  tag_quantity: number | null
  postage_cents: number | null
  total_cents: number | null
  currency: string | null
  product_sku: string | null
  payment_status: string
  nfc_me_order_id: string | null
  shipping_name: string
  shipping_email: string
  shipping_line1: string
  shipping_line2: string | null
  shipping_city: string
  shipping_postcode: string
  shipping_country: string
  created_at: string
}

const supabase = useSupabase()
const loading = ref(true)
const error = ref('')
const orders = ref<OrderRow[]>([])
const statusFilter = ref('submitted')
const page = ref(1)
const total = ref(0)

const filters = [
  { value: 'submitted', label: 'Submitted' },
  { value: 'paid', label: 'Paid' },
  { value: 'pending_payment', label: 'Awaiting pay' },
  { value: 'failed', label: 'Failed' },
  { value: '', label: 'All' }
]

const formatMoney = (cents: number, currency = 'gbp') =>
  new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: (currency || 'gbp').toUpperCase()
  }).format((cents || 0) / 100)

const formatDate = (iso: string) => {
  try {
    return new Date(iso).toLocaleString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  } catch {
    return iso
  }
}

const formatAddress = (o: OrderRow) =>
  [o.shipping_name, o.shipping_line1, o.shipping_line2, o.shipping_city, o.shipping_postcode, o.shipping_country]
    .filter(Boolean)
    .join('\n')

const setFilter = (value: string) => {
  statusFilter.value = value
  if (page.value !== 1) page.value = 1
  else load()
}

const load = async () => {
  loading.value = true
  error.value = ''
  try {
    const { from, to } = adminPageRange(page.value)
    let query = supabase
      .from('doghealthy_nfc_orders')
      .select(
        'id, user_id, dog_ids, status, order_type, tags_per_dog, tag_quantity, postage_cents, total_cents, currency, product_sku, payment_status, nfc_me_order_id, shipping_name, shipping_email, shipping_line1, shipping_line2, shipping_city, shipping_postcode, shipping_country, created_at',
        { count: 'exact' }
      )
      .order('created_at', { ascending: false })
      .range(from, to)

    if (statusFilter.value) query = query.eq('status', statusFilter.value)

    const { data, error: fetchError, count } = await query
    if (fetchError) throw fetchError
    orders.value = (data || []) as OrderRow[]
    total.value = count || 0
  } catch (err: any) {
    error.value = err?.message || 'Failed to load orders'
    orders.value = []
    total.value = 0
  } finally {
    loading.value = false
  }
}

onMounted(load)
watch(page, load)
</script>
