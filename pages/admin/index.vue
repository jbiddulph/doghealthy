<template>
  <AdminShell title="Dashboard" subtitle="Manage users, dogs, news, profiles and NFC Me sticker orders.">
    <div v-if="loading" class="text-slate-600">Loading stats…</div>
    <div v-else class="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      <NuxtLink
        v-for="card in cards"
        :key="card.to"
        :to="card.to"
        class="bg-white rounded-xl border border-slate-200 shadow-sm p-5 hover:border-slate-400 transition-colors"
      >
        <p class="text-sm text-slate-500">{{ card.label }}</p>
        <p class="text-3xl font-bold text-slate-900 mt-1">{{ card.value }}</p>
        <p class="text-xs text-blue-700 mt-3 font-medium">{{ card.cta }} →</p>
      </NuxtLink>
    </div>

    <div class="bg-white rounded-xl border border-slate-200 shadow-sm p-5 mb-4">
      <div class="flex items-center justify-between gap-3 mb-3">
        <h3 class="font-semibold text-slate-900">Latest NFC activity</h3>
        <NuxtLink to="/admin/nfc-orders" class="text-xs text-blue-700 hover:underline">All orders</NuxtLink>
      </div>
      <p v-if="!activity.length" class="text-sm text-slate-500">No NFC purchases or NFC dog packs yet.</p>
      <ul v-else class="divide-y divide-slate-100">
        <li v-for="item in activity" :key="item.id" class="py-3 flex flex-wrap items-start justify-between gap-2">
          <div>
            <p class="text-sm font-medium text-slate-900">{{ item.title }}</p>
            <p class="text-xs text-slate-500 mt-0.5">{{ item.detail }}</p>
          </div>
          <div class="text-right">
            <p class="text-xs font-semibold capitalize text-slate-700">{{ item.status }}</p>
            <p class="text-xs text-slate-400">{{ item.when }}</p>
          </div>
        </li>
      </ul>
    </div>

    <div class="grid lg:grid-cols-2 gap-4">
      <div class="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
        <h3 class="font-semibold text-slate-900 mb-2">Quick actions</h3>
        <ul class="text-sm text-slate-700 space-y-2">
          <li>
            <NuxtLink to="/admin/users" class="text-blue-700 hover:underline">Browse and edit all users</NuxtLink>
          </li>
          <li>
            <NuxtLink to="/admin/dogs" class="text-blue-700 hover:underline">Browse and edit all dogs</NuxtLink>
          </li>
          <li>
            <NuxtLink to="/admin/nfc-orders" class="text-blue-700 hover:underline">Review NFC Me sticker orders (NFC Me ships to the customer)</NuxtLink>
          </li>
          <li>
            <NuxtLink to="/admin/news" class="text-blue-700 hover:underline">Add news and how-to guides</NuxtLink>
          </li>
        </ul>
      </div>

      <div class="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
        <h3 class="font-semibold text-slate-900 mb-1">QR sticker sheet</h3>
        <p class="text-sm text-slate-600 mb-4">
          Download an A4 PDF of all active tags as 24mm circular stickers (bold labels, dog name under brand). Extra stickers spill onto new pages.
        </p>
        <p v-if="activeTagCount !== null" class="text-xs text-slate-500 mb-3">
          {{ activeTagCount }} active tag{{ activeTagCount === 1 ? '' : 's' }} registered
        </p>
        <p v-if="qrError" class="text-sm text-red-600 mb-3">{{ qrError }}</p>
        <p v-if="qrSuccess" class="text-sm text-emerald-700 mb-3">{{ qrSuccess }}</p>
        <button
          type="button"
          class="inline-flex items-center justify-center px-4 py-2 rounded-lg bg-slate-900 text-white text-sm font-medium hover:bg-slate-800 disabled:opacity-60 disabled:cursor-not-allowed"
          :disabled="qrBusy || loading"
          @click="downloadQrSheet"
        >
          {{ qrBusy ? 'Building PDF…' : 'Download A4 QR PDF' }}
        </button>
      </div>
    </div>
  </AdminShell>
</template>

<script setup lang="ts">
import { buildAdminQrSheetPdf, downloadBlob } from '~/utils/adminQrSheetPdf'

definePageMeta({
  middleware: ['auth', 'admin'],
  layout: false
})

usePageSeo({
  title: 'Admin dashboard — DogHealthy',
  path: '/admin',
  index: false
})

const supabase = useSupabase()
const config = useRuntimeConfig()
const loading = ref(true)
const activeTagCount = ref<number | null>(null)
const qrBusy = ref(false)
const qrError = ref('')
const qrSuccess = ref('')
const stats = reactive({
  users: 0,
  dogs: 0,
  nfcQueue: 0,
  activeSubs: 0
})
const activity = ref<
  { id: string; title: string; detail: string; status: string; when: string; at: number }[]
>([])

const formatWhen = (iso: string) => {
  try {
    return new Date(iso).toLocaleString('en-GB', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    })
  } catch {
    return iso
  }
}

const cards = computed(() => [
  { label: 'Users', value: stats.users, to: '/admin/users', cta: 'Manage users' },
  { label: 'Dogs', value: stats.dogs, to: '/admin/dogs', cta: 'Manage dogs' },
  { label: 'NFC Me to ship', value: stats.nfcQueue, to: '/admin/nfc-orders?status=failed', cta: 'NFC orders' },
  { label: 'Active subscriptions', value: stats.activeSubs, to: '/admin/users?sub=active', cta: 'View subscribers' }
])

async function fetchActiveTags() {
  const { data, error } = await supabase
    .from('doghealthy_tags')
    .select('pet_id, uid, doghealthy_dogs(name)')
    .eq('status', 'active')
    .order('created_at', { ascending: true })

  if (error) throw error
  return (data || [])
    .filter((row: { pet_id?: string | null }) => !!row.pet_id)
    .map((row: {
      pet_id: string
      uid?: string | null
      doghealthy_dogs?: { name?: string | null } | { name?: string | null }[] | null
    }) => {
      const dog = Array.isArray(row.doghealthy_dogs)
        ? row.doghealthy_dogs[0]
        : row.doghealthy_dogs
      return {
        petId: row.pet_id,
        tagUid: row.uid,
        dogName: dog?.name || null
      }
    })
}

async function downloadQrSheet() {
  qrError.value = ''
  qrSuccess.value = ''
  qrBusy.value = true
  try {
    const items = await fetchActiveTags()
    activeTagCount.value = items.length
    if (!items.length) {
      qrError.value = 'No active QR tags found to export.'
      return
    }

    const baseUrl = String(config.public.baseUrl || 'https://doghealthy.co.uk').replace(/\/$/, '')
    const blob = await buildAdminQrSheetPdf(items, baseUrl)
    const stamp = new Date().toISOString().slice(0, 10)
    downloadBlob(blob, `doghealthy-qr-sheet-${stamp}.pdf`)
    qrSuccess.value = `Downloaded PDF with ${items.length} QR code${items.length === 1 ? '' : 's'}.`
  } catch (e: any) {
    qrError.value = e?.message || 'Failed to build QR PDF.'
  } finally {
    qrBusy.value = false
  }
}

onMounted(async () => {
  loading.value = true
  try {
    const [users, dogs, nfcQueue, subs, tags, nfcOrders, packOrders] = await Promise.all([
      supabase.from('doghealthy_users').select('id', { count: 'exact', head: true }),
      supabase.from('doghealthy_dogs').select('id', { count: 'exact', head: true }),
      supabase
        .from('doghealthy_nfc_orders')
        .select('id', { count: 'exact', head: true })
        .eq('payment_status', 'paid')
        .neq('status', 'submitted'),
      supabase
        .from('doghealthy_users')
        .select('id', { count: 'exact', head: true })
        .in('subscription_status', ['active', 'trialing']),
      supabase
        .from('doghealthy_tags')
        .select('id', { count: 'exact', head: true })
        .eq('status', 'active'),
      supabase
        .from('doghealthy_nfc_orders')
        .select('id, status, payment_status, tag_quantity, shipping_name, shipping_email, created_at')
        .order('created_at', { ascending: false })
        .limit(8),
      supabase
        .from('doghealthy_extra_dog_orders')
        .select('id, status, payment_status, quantity, shipping_name, shipping_email, created_at')
        .order('created_at', { ascending: false })
        .limit(8)
    ])
    stats.users = users.count || 0
    stats.dogs = dogs.count || 0
    stats.nfcQueue = nfcQueue.count || 0
    stats.activeSubs = subs.count || 0
    activeTagCount.value = tags.count || 0

    const stickerRows = (nfcOrders.data || []).map((row: any) => ({
      id: `nfc-${row.id}`,
      title: `NFC stickers · ${row.shipping_name || row.shipping_email || 'Customer'}`,
      detail: `${row.tag_quantity || 0} stickers · ${row.payment_status || 'unpaid'}`,
      status: row.status || 'pending',
      when: formatWhen(row.created_at),
      at: new Date(row.created_at).getTime()
    }))
    const packRows = (packOrders.data || []).map((row: any) => ({
      id: `pack-${row.id}`,
      title: `NFC dog pack · ${row.shipping_name || row.shipping_email || 'Customer'}`,
      detail: `${row.quantity || 0} dogs · ${row.payment_status || 'unpaid'}`,
      status: row.status || 'pending',
      when: formatWhen(row.created_at),
      at: new Date(row.created_at).getTime()
    }))
    activity.value = [...stickerRows, ...packRows].sort((a, b) => b.at - a.at).slice(0, 10)
  } finally {
    loading.value = false
  }
})
</script>
