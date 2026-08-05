<template>
  <AdminShell title="Users" subtitle="Search, open, edit or delete any member profile.">
    <div class="mb-4 flex flex-wrap gap-3 items-end">
      <div class="flex-1 min-w-[200px]">
        <label class="block text-xs font-medium text-slate-600 mb-1">Search</label>
        <input
          v-model="q"
          type="search"
          placeholder="Email or name…"
          class="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
          @keyup.enter="search"
        />
      </div>
      <div>
        <label class="block text-xs font-medium text-slate-600 mb-1">Subscription</label>
        <select v-model="subFilter" class="px-3 py-2 border border-slate-300 rounded-lg text-sm" @change="search">
          <option value="">All</option>
          <option value="active">Active / trialing</option>
          <option value="none">No subscription</option>
        </select>
      </div>
      <div>
        <label class="block text-xs font-medium text-slate-600 mb-1">NFC chip</label>
        <select v-model="chipFilter" class="px-3 py-2 border border-slate-300 rounded-lg text-sm" @change="search">
          <option value="">All</option>
          <option value="pending">Pending</option>
          <option value="shipped">Shipped</option>
        </select>
      </div>
      <button
        type="button"
        class="px-4 py-2 bg-slate-900 text-white rounded-lg text-sm font-semibold"
        :disabled="loading"
        @click="search"
      >
        Search
      </button>
    </div>

    <div v-if="error" class="mb-4 text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
      {{ error }}
    </div>

    <div v-if="loading" class="text-slate-600 py-8">Loading users…</div>

    <div v-else class="bg-white rounded-xl border border-slate-200 shadow-sm overflow-x-auto">
      <table class="min-w-full text-sm">
        <thead class="bg-slate-50 text-left text-slate-600">
          <tr>
            <th class="px-4 py-3 font-medium">User</th>
            <th class="px-4 py-3 font-medium">Subscription</th>
            <th class="px-4 py-3 font-medium">NFC chip</th>
            <th class="px-4 py-3 font-medium">Admin</th>
            <th class="px-4 py-3 font-medium text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="u in users" :key="u.id" class="border-t border-slate-100 hover:bg-slate-50">
            <td class="px-4 py-3">
              <div class="font-medium text-slate-900">{{ u.full_name || u.billing_name || '—' }}</div>
              <div class="text-slate-500">{{ u.email }}</div>
            </td>
            <td class="px-4 py-3 capitalize text-slate-700">
              {{ u.subscription_status || 'none' }}
              <span v-if="u.subscription_plan" class="text-slate-400"> · {{ u.subscription_plan }}</span>
            </td>
            <td class="px-4 py-3 capitalize">{{ u.nfc_chip_status || 'none' }}</td>
            <td class="px-4 py-3">{{ u.is_admin ? 'Yes' : '—' }}</td>
            <td class="px-4 py-3 text-right whitespace-nowrap">
              <NuxtLink :to="`/admin/users/${u.id}`" class="text-blue-700 font-medium hover:underline">
                Edit
              </NuxtLink>
              <button
                type="button"
                class="ml-3 text-red-700 font-medium hover:underline disabled:opacity-50"
                :disabled="deletingId === u.id"
                @click="deleteUser(u)"
              >
                {{ deletingId === u.id ? 'Deleting…' : 'Delete' }}
              </button>
            </td>
          </tr>
          <tr v-if="users.length === 0">
            <td colspan="5" class="px-4 py-8 text-center text-slate-500">No users found.</td>
          </tr>
        </tbody>
      </table>
    </div>

    <AdminPagination
      v-model:page="page"
      :total="total"
      :disabled="loading"
    />
  </AdminShell>
</template>

<script setup lang="ts">
import { adminPageRange } from '~/utils/adminPagination'

definePageMeta({
  middleware: ['auth', 'admin'],
  layout: false
})

usePageSeo({
  title: 'Admin users — DogHealthy',
  path: '/admin/users',
  index: false
})

type AdminUser = {
  id: string
  email: string
  full_name: string | null
  billing_name: string | null
  subscription_status: string | null
  subscription_plan: string | null
  nfc_chip_status: string | null
  is_admin: boolean
}

const route = useRoute()
const supabase = useSupabase()
const authStore = useAuthStore()

const q = ref('')
const subFilter = ref('')
const chipFilter = ref('')
const page = ref(1)
const total = ref(0)
const loading = ref(true)
const error = ref('')
const users = ref<AdminUser[]>([])
const deletingId = ref('')

onMounted(() => {
  if (route.query.sub === 'active') subFilter.value = 'active'
  load()
})

watch(page, () => load())

const search = () => {
  if (page.value !== 1) page.value = 1
  else load()
}

const load = async () => {
  loading.value = true
  error.value = ''
  try {
    const { from, to } = adminPageRange(page.value)
    let query = supabase
      .from('doghealthy_users')
      .select(
        'id, email, full_name, billing_name, subscription_status, subscription_plan, nfc_chip_status, is_admin',
        { count: 'exact' }
      )
      .order('created_at', { ascending: false })
      .range(from, to)

    const term = q.value.trim()
    if (term) {
      query = query.or(`email.ilike.%${term}%,full_name.ilike.%${term}%,billing_name.ilike.%${term}%`)
    }
    if (subFilter.value === 'active') {
      query = query.in('subscription_status', ['active', 'trialing'])
    } else if (subFilter.value === 'none') {
      query = query.or('subscription_status.is.null,subscription_status.eq.')
    }
    if (chipFilter.value) {
      query = query.eq('nfc_chip_status', chipFilter.value)
    }

    const { data, error: fetchError, count } = await query
    if (fetchError) throw fetchError
    users.value = (data || []) as AdminUser[]
    total.value = count || 0
  } catch (err: any) {
    error.value = err?.message || 'Failed to load users'
    users.value = []
    total.value = 0
  } finally {
    loading.value = false
  }
}

const deleteUser = async (u: AdminUser) => {
  if (authStore.user?.id === u.id) {
    error.value = 'You cannot delete your own admin account from this list.'
    return
  }
  const label = u.full_name || u.email
  if (
    !confirm(
      `Delete user “${label}” and all their dogs / related data? This cannot be undone.`
    )
  ) {
    return
  }
  deletingId.value = u.id
  error.value = ''
  try {
    const { error: delError } = await supabase.from('doghealthy_users').delete().eq('id', u.id)
    if (delError) throw delError
    if (users.value.length <= 1 && page.value > 1) page.value -= 1
    else await load()
  } catch (err: any) {
    error.value = err?.message || 'Failed to delete user'
  } finally {
    deletingId.value = ''
  }
}
</script>
