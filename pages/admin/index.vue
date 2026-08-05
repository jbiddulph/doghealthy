<template>
  <AdminShell title="Dashboard" subtitle="Manage users, dogs, profiles and NFC chip postage.">
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
          <NuxtLink to="/admin/nfc-shipments" class="text-blue-700 hover:underline">Fulfil pending NFC chip posts</NuxtLink>
        </li>
      </ul>
    </div>
  </AdminShell>
</template>

<script setup lang="ts">
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
const loading = ref(true)
const stats = reactive({
  users: 0,
  dogs: 0,
  pendingChips: 0,
  activeSubs: 0
})

const cards = computed(() => [
  { label: 'Users', value: stats.users, to: '/admin/users', cta: 'Manage users' },
  { label: 'Dogs', value: stats.dogs, to: '/admin/dogs', cta: 'Manage dogs' },
  { label: 'Pending NFC chips', value: stats.pendingChips, to: '/admin/nfc-shipments', cta: 'Shipments' },
  { label: 'Active subscriptions', value: stats.activeSubs, to: '/admin/users?sub=active', cta: 'View subscribers' }
])

onMounted(async () => {
  loading.value = true
  try {
    const [users, dogs, pending, subs] = await Promise.all([
      supabase.from('doghealthy_users').select('id', { count: 'exact', head: true }),
      supabase.from('doghealthy_dogs').select('id', { count: 'exact', head: true }),
      supabase
        .from('doghealthy_users')
        .select('id', { count: 'exact', head: true })
        .eq('nfc_chip_status', 'pending'),
      supabase
        .from('doghealthy_users')
        .select('id', { count: 'exact', head: true })
        .in('subscription_status', ['active', 'trialing'])
    ])
    stats.users = users.count || 0
    stats.dogs = dogs.count || 0
    stats.pendingChips = pending.count || 0
    stats.activeSubs = subs.count || 0
  } finally {
    loading.value = false
  }
})
</script>
