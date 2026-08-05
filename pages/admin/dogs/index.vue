<template>
  <AdminShell title="Dogs" subtitle="Browse, edit or delete any dog profile.">
    <div class="mb-4 flex flex-wrap gap-3 items-end">
      <div class="flex-1 min-w-[200px]">
        <label class="block text-xs font-medium text-slate-600 mb-1">Search</label>
        <input
          v-model="q"
          type="search"
          placeholder="Dog name or breed…"
          class="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
          @keyup.enter="search"
        />
      </div>
      <label class="flex items-center gap-2 text-sm text-slate-700 pb-2">
        <input v-model="activeOnly" type="checkbox" class="rounded border-slate-300" @change="search" />
        Active only
      </label>
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
    <div v-if="loading" class="text-slate-600 py-8">Loading dogs…</div>

    <div v-else class="bg-white rounded-xl border border-slate-200 shadow-sm overflow-x-auto">
      <table class="min-w-full text-sm">
        <thead class="bg-slate-50 text-left text-slate-600">
          <tr>
            <th class="px-4 py-3 font-medium">Dog</th>
            <th class="px-4 py-3 font-medium">Owner</th>
            <th class="px-4 py-3 font-medium">Status</th>
            <th class="px-4 py-3 font-medium text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="dog in dogs" :key="dog.id" class="border-t border-slate-100 hover:bg-slate-50">
            <td class="px-4 py-3">
              <div class="font-medium text-slate-900">{{ dog.name }}</div>
              <div class="text-slate-500">{{ dog.breed || '—' }}</div>
            </td>
            <td class="px-4 py-3">
              <NuxtLink
                v-if="dog.user_id"
                :to="`/admin/users/${dog.user_id}`"
                class="text-blue-700 hover:underline"
              >
                {{ ownerLabel(dog.user_id) }}
              </NuxtLink>
            </td>
            <td class="px-4 py-3">
              {{ dog.is_active ? 'Active' : 'Inactive' }}
              <span v-if="dog.nfc_tag_enabled" class="text-slate-400"> · NFC</span>
            </td>
            <td class="px-4 py-3 text-right whitespace-nowrap">
              <NuxtLink :to="`/admin/dogs/${dog.id}`" class="text-blue-700 font-medium hover:underline">
                Edit
              </NuxtLink>
              <button
                type="button"
                class="ml-3 text-red-700 font-medium hover:underline disabled:opacity-50"
                :disabled="deletingId === dog.id"
                @click="deleteDog(dog)"
              >
                {{ deletingId === dog.id ? 'Deleting…' : 'Delete' }}
              </button>
            </td>
          </tr>
          <tr v-if="dogs.length === 0">
            <td colspan="4" class="px-4 py-8 text-center text-slate-500">No dogs found.</td>
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
  title: 'Admin dogs — DogHealthy',
  path: '/admin/dogs',
  index: false
})

type DogRow = {
  id: string
  user_id: string
  name: string
  breed: string | null
  is_active: boolean
  nfc_tag_enabled: boolean | null
}

const supabase = useSupabase()
const q = ref('')
const activeOnly = ref(true)
const page = ref(1)
const total = ref(0)
const loading = ref(true)
const error = ref('')
const dogs = ref<DogRow[]>([])
const owners = ref<Record<string, string>>({})
const deletingId = ref('')

const ownerLabel = (userId: string) => owners.value[userId] || userId.slice(0, 8)

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
      .from('doghealthy_dogs')
      .select('id, user_id, name, breed, is_active, nfc_tag_enabled', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(from, to)

    const term = q.value.trim()
    if (term) query = query.or(`name.ilike.%${term}%,breed.ilike.%${term}%`)
    if (activeOnly.value) query = query.eq('is_active', true)

    const { data, error: fetchError, count } = await query
    if (fetchError) throw fetchError
    dogs.value = (data || []) as DogRow[]
    total.value = count || 0

    const userIds = [...new Set(dogs.value.map((d) => d.user_id).filter(Boolean))]
    if (userIds.length) {
      const { data: users } = await supabase
        .from('doghealthy_users')
        .select('id, email, full_name')
        .in('id', userIds)
      const map: Record<string, string> = {}
      for (const u of users || []) {
        map[u.id] = u.full_name || u.email
      }
      owners.value = map
    } else {
      owners.value = {}
    }
  } catch (err: any) {
    error.value = err?.message || 'Failed to load dogs'
    dogs.value = []
    total.value = 0
  } finally {
    loading.value = false
  }
}

const deleteDog = async (dog: DogRow) => {
  if (!confirm(`Delete dog “${dog.name}” and related records? This cannot be undone.`)) return
  deletingId.value = dog.id
  error.value = ''
  try {
    const { error: delError } = await supabase.from('doghealthy_dogs').delete().eq('id', dog.id)
    if (delError) throw delError
    if (dogs.value.length <= 1 && page.value > 1) page.value -= 1
    else await load()
  } catch (err: any) {
    error.value = err?.message || 'Failed to delete dog'
  } finally {
    deletingId.value = ''
  }
}

onMounted(load)
watch(page, load)
</script>
