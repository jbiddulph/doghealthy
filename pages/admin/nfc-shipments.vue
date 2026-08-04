<template>
  <div class="min-h-screen bg-gray-50 py-10">
    <div class="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 class="text-3xl font-bold text-gray-900">NFC chip shipments</h1>
          <p class="text-gray-600 mt-1">
            Users who created a QR / NFC tag and need a physical chip posted.
          </p>
        </div>
        <div class="flex gap-2">
          <button
            type="button"
            class="px-3 py-2 text-sm rounded-lg border"
            :class="statusFilter === 'pending' ? 'bg-amber-100 border-amber-300 text-amber-900' : 'border-gray-300'"
            @click="statusFilter = 'pending'; load()"
          >
            Pending
          </button>
          <button
            type="button"
            class="px-3 py-2 text-sm rounded-lg border"
            :class="statusFilter === 'shipped' ? 'bg-green-100 border-green-300 text-green-900' : 'border-gray-300'"
            @click="statusFilter = 'shipped'; load()"
          >
            Shipped
          </button>
          <button
            type="button"
            class="px-3 py-2 text-sm rounded-lg border border-gray-300"
            :disabled="loading"
            @click="load()"
          >
            Refresh
          </button>
        </div>
      </div>

      <div v-if="error" class="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
        {{ error }}
      </div>

      <div v-if="loading" class="text-gray-600 py-10 text-center">Loading…</div>

      <div v-else-if="rows.length === 0" class="bg-white rounded-xl shadow p-8 text-center text-gray-600">
        No {{ statusFilter }} NFC chip requests.
      </div>

      <div v-else class="space-y-4">
        <article
          v-for="row in rows"
          :key="row.id"
          class="bg-white rounded-xl shadow-md p-5 border border-gray-100"
        >
          <div class="flex flex-wrap items-start justify-between gap-3 mb-3">
            <div>
              <h2 class="text-lg font-semibold text-gray-900">
                {{ row.billing_name || row.full_name || 'Unnamed' }}
              </h2>
              <p class="text-sm text-gray-600">
                {{ row.email }}
                <span v-if="row.phone"> · {{ row.phone }}</span>
              </p>
              <p class="text-xs text-gray-500 mt-1">
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

          <div class="rounded-lg bg-gray-50 border border-gray-200 px-4 py-3 text-sm text-gray-800 whitespace-pre-line">
{{ formatAddress(row) }}
          </div>

          <div v-if="row.nfc_chip_status === 'pending'" class="mt-4 flex flex-wrap gap-2">
            <button
              type="button"
              class="px-4 py-2 rounded-lg bg-green-600 hover:bg-green-700 text-white text-sm font-semibold disabled:opacity-60"
              :disabled="updatingId === row.id"
              @click="markShipped(row.id)"
            >
              {{ updatingId === row.id ? 'Updating…' : 'Mark shipped' }}
            </button>
          </div>
          <p v-else-if="row.nfc_chip_shipped_at" class="mt-3 text-xs text-gray-500">
            Shipped {{ formatDate(row.nfc_chip_shipped_at) }}
          </p>
        </article>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  middleware: 'auth'
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

const authStore = useAuthStore()
const supabase = useSupabase()
const router = useRouter()

const loading = ref(true)
const error = ref('')
const rows = ref<ShipRow[]>([])
const statusFilter = ref<'pending' | 'shipped'>('pending')
const updatingId = ref('')

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

const assertAdmin = async () => {
  if (!authStore.userId) {
    await router.replace('/auth/login')
    return false
  }
  const { data, error: err } = await supabase
    .from('doghealthy_users')
    .select('is_admin')
    .eq('id', authStore.userId)
    .maybeSingle()
  if (err || !data?.is_admin) {
    error.value = 'Admin access required.'
    await router.replace('/dogs')
    return false
  }
  return true
}

const load = async () => {
  loading.value = true
  error.value = ''
  try {
    if (!(await assertAdmin())) return

    const { data, error: fetchError } = await supabase
      .from('doghealthy_users')
      .select(
        'id, email, full_name, billing_name, phone, address_line1, address_line2, address_city, address_postcode, address_country, nfc_chip_status, nfc_chip_requested_at, nfc_chip_shipped_at, nfc_chip_dog_id'
      )
      .eq('nfc_chip_status', statusFilter.value)
      .order('nfc_chip_requested_at', { ascending: false, nullsFirst: false })

    if (fetchError) throw fetchError

    const list = (data || []) as ShipRow[]
    const dogIds = list.map((r) => r.nfc_chip_dog_id).filter(Boolean) as string[]
    let dogNames: Record<string, string> = {}
    if (dogIds.length) {
      const { data: dogs } = await supabase
        .from('doghealthy_dogs')
        .select('id, name')
        .in('id', dogIds)
      for (const d of dogs || []) {
        dogNames[d.id] = d.name
      }
    }

    rows.value = list.map((r) => ({
      ...r,
      dog_name: r.nfc_chip_dog_id ? dogNames[r.nfc_chip_dog_id] || null : null
    }))
  } catch (err: any) {
    error.value = err?.message || 'Failed to load shipments'
    rows.value = []
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
</script>
