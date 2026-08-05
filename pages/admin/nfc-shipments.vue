<template>
  <AdminShell title="NFC chip shipments" subtitle="Users awaiting a physical NFC chip in the post.">
    <div class="mb-4 flex flex-wrap gap-2">
      <button
        type="button"
        class="px-3 py-2 text-sm rounded-lg border"
        :class="statusFilter === 'pending' ? 'bg-amber-100 border-amber-300 text-amber-900' : 'border-slate-300'"
        @click="setFilter('pending')"
      >
        Pending
      </button>
      <button
        type="button"
        class="px-3 py-2 text-sm rounded-lg border"
        :class="statusFilter === 'shipped' ? 'bg-green-100 border-green-300 text-green-900' : 'border-slate-300'"
        @click="setFilter('shipped')"
      >
        Shipped
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

    <div v-if="error" class="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
      {{ error }}
    </div>

    <div v-if="loading" class="text-slate-600 py-10 text-center">Loading…</div>

    <div v-else-if="rows.length === 0" class="bg-white rounded-xl border border-slate-200 shadow-sm p-8 text-center text-slate-600">
      No {{ statusFilter }} NFC chip requests.
    </div>

    <div v-else class="space-y-4">
      <article
        v-for="row in rows"
        :key="row.id"
        class="bg-white rounded-xl border border-slate-200 shadow-sm p-5"
      >
        <div class="flex flex-wrap items-start justify-between gap-3 mb-3">
          <div>
            <h2 class="text-lg font-semibold text-slate-900">
              {{ row.billing_name || row.full_name || 'Unnamed' }}
            </h2>
            <p class="text-sm text-slate-600">
              {{ row.email }}
              <span v-if="row.phone"> · {{ row.phone }}</span>
            </p>
            <p class="text-xs text-slate-500 mt-1">
              Requested
              {{ row.nfc_chip_requested_at ? formatDate(row.nfc_chip_requested_at) : '—' }}
              <span v-if="row.dog_name"> · Dog: {{ row.dog_name }}</span>
            </p>
          </div>
          <span
            class="inline-flex px-2.5 py-1 rounded-full text-xs font-semibold capitalize"
            :class="row.nfc_chip_status === 'pending' ? 'bg-amber-100 text-amber-900' : 'bg-green-100 text-green-900'"
          >
            {{ row.nfc_chip_status }}
          </span>
        </div>

        <div class="rounded-lg bg-slate-50 border border-slate-200 px-4 py-3 text-sm text-slate-800 whitespace-pre-line">
{{ formatAddress(row) }}
        </div>

        <div class="mt-4 flex flex-wrap gap-2">
          <NuxtLink
            :to="`/admin/users/${row.id}`"
            class="px-4 py-2 rounded-lg border border-slate-300 text-sm font-medium hover:bg-slate-50"
          >
            Edit user
          </NuxtLink>
          <button
            v-if="row.nfc_chip_status === 'pending'"
            type="button"
            class="px-4 py-2 rounded-lg bg-green-600 hover:bg-green-700 text-white text-sm font-semibold disabled:opacity-60"
            :disabled="updatingId === row.id"
            @click="markShipped(row.id)"
          >
            {{ updatingId === row.id ? 'Updating…' : 'Mark shipped' }}
          </button>
          <p v-else-if="row.nfc_chip_shipped_at" class="text-xs text-slate-500 self-center">
            Shipped {{ formatDate(row.nfc_chip_shipped_at) }}
          </p>
        </div>
      </article>

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
  title: 'Admin — NFC chip shipments',
  description: 'Fulfil physical NFC chip postage requests.',
  path: '/admin/nfc-shipments',
  index: false
})

type ShipRow = {
  id: string
  email: string
  full_name: string | null
  billing_name: string | null
  phone: string | null
  address_line1: string | null
  address_line2: string | null
  address_city: string | null
  address_postcode: string | null
  address_country: string | null
  nfc_chip_status: string
  nfc_chip_requested_at: string | null
  nfc_chip_shipped_at: string | null
  nfc_chip_dog_id: string | null
  dog_name?: string | null
}

const supabase = useSupabase()

const loading = ref(true)
const error = ref('')
const rows = ref<ShipRow[]>([])
const statusFilter = ref<'pending' | 'shipped'>('pending')
const updatingId = ref('')
const page = ref(1)
const total = ref(0)

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

const formatAddress = (row: ShipRow) => {
  return [
    row.billing_name || row.full_name,
    row.address_line1,
    row.address_line2,
    row.address_city,
    row.address_postcode,
    row.address_country || 'GB'
  ]
    .filter(Boolean)
    .join('\n')
}

const setFilter = (value: 'pending' | 'shipped') => {
  statusFilter.value = value
  if (page.value !== 1) page.value = 1
  else load()
}

const load = async () => {
  loading.value = true
  error.value = ''
  try {
    const { from, to } = adminPageRange(page.value)
    const { data, error: fetchError, count } = await supabase
      .from('doghealthy_users')
      .select(
        'id, email, full_name, billing_name, phone, address_line1, address_line2, address_city, address_postcode, address_country, nfc_chip_status, nfc_chip_requested_at, nfc_chip_shipped_at, nfc_chip_dog_id',
        { count: 'exact' }
      )
      .eq('nfc_chip_status', statusFilter.value)
      .order('nfc_chip_requested_at', { ascending: false, nullsFirst: false })
      .range(from, to)

    if (fetchError) throw fetchError

    const list = (data || []) as ShipRow[]
    total.value = count || 0
    const dogIds = list.map((r) => r.nfc_chip_dog_id).filter(Boolean) as string[]
    const dogNames: Record<string, string> = {}
    if (dogIds.length) {
      const { data: dogs } = await supabase.from('doghealthy_dogs').select('id, name').in('id', dogIds)
      for (const d of dogs || []) dogNames[d.id] = d.name
    }

    rows.value = list.map((r) => ({
      ...r,
      dog_name: r.nfc_chip_dog_id ? dogNames[r.nfc_chip_dog_id] || null : null
    }))
  } catch (err: any) {
    error.value = err?.message || 'Failed to load shipments'
    rows.value = []
    total.value = 0
  } finally {
    loading.value = false
  }
}

const markShipped = async (userId: string) => {
  updatingId.value = userId
  error.value = ''
  try {
    const { error: updateError } = await supabase
      .from('doghealthy_users')
      .update({
        nfc_chip_status: 'shipped',
        nfc_chip_shipped_at: new Date().toISOString()
      })
      .eq('id', userId)

    if (updateError) throw updateError
    await load()
  } catch (err: any) {
    error.value = err?.message || 'Failed to mark shipped'
  } finally {
    updatingId.value = ''
  }
}

onMounted(load)
watch(page, load)
</script>
