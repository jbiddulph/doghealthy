<template>
  <AdminShell title="News" subtitle="Add news and how-to guides. Feature news on the homepage or pin how-tos.">
    <div class="mb-4 flex justify-end">
      <NuxtLink
        to="/admin/news/new"
        class="px-4 py-2 bg-slate-900 text-white rounded-lg text-sm font-semibold"
      >
        + New article
      </NuxtLink>
    </div>

    <div v-if="error" class="mb-4 text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
      {{ error }}
    </div>
    <div v-if="loading" class="text-slate-600 py-8">Loading news…</div>

    <div v-else class="bg-white rounded-xl border border-slate-200 shadow-sm overflow-x-auto">
      <table class="min-w-full text-sm">
        <thead class="bg-slate-50 text-left text-slate-600">
          <tr>
            <th class="px-4 py-3 font-medium">Article</th>
            <th class="px-4 py-3 font-medium">Type</th>
            <th class="px-4 py-3 font-medium">Status</th>
            <th class="px-4 py-3 font-medium">Featured</th>
            <th class="px-4 py-3 font-medium text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="row in rows" :key="row.id" class="border-t border-slate-100 hover:bg-slate-50">
            <td class="px-4 py-3">
              <div class="flex items-center gap-3">
                <img
                  v-if="row.image_url"
                  :src="row.image_url"
                  alt=""
                  class="h-12 w-16 rounded object-cover"
                />
                <div>
                  <div class="font-medium text-slate-900">{{ row.title }}</div>
                  <div class="text-slate-500 text-xs">{{ row.category === 'howto' ? '/how-to/' : '/news/' }}{{ row.slug }}</div>
                </div>
              </div>
            </td>
            <td class="px-4 py-3">{{ row.category === 'howto' ? 'How to' : 'News' }}</td>
            <td class="px-4 py-3 capitalize">{{ row.is_published ? 'Published' : 'Draft' }}</td>
            <td class="px-4 py-3">{{ row.is_featured ? 'Yes' : '—' }}</td>
            <td class="px-4 py-3 text-right whitespace-nowrap">
              <NuxtLink :to="`/admin/news/${row.id}`" class="text-blue-700 font-medium hover:underline">
                Edit
              </NuxtLink>
              <button
                type="button"
                class="ml-3 text-red-700 font-medium hover:underline disabled:opacity-50"
                :disabled="deletingId === row.id"
                @click="remove(row)"
              >
                {{ deletingId === row.id ? 'Deleting…' : 'Delete' }}
              </button>
            </td>
          </tr>
          <tr v-if="rows.length === 0">
            <td colspan="5" class="px-4 py-8 text-center text-slate-500">No articles yet.</td>
          </tr>
        </tbody>
      </table>
    </div>
  </AdminShell>
</template>

<script setup lang="ts">
definePageMeta({
  middleware: ['auth', 'admin'],
  layout: false
})

usePageSeo({
  title: 'Admin news — DogHealthy',
  description: 'Manage DogHealthy news articles.',
  path: '/admin/news',
  index: false
})

const supabase = useSupabase()
const loading = ref(true)
const error = ref('')
const rows = ref<any[]>([])
const deletingId = ref('')

const load = async () => {
  loading.value = true
  error.value = ''
  try {
    const { data, error: fetchError } = await supabase
      .from('doghealthy_news')
      .select('id, slug, title, image_url, category, is_featured, is_published, published_at, created_at')
      .order('created_at', { ascending: false })
    if (fetchError) throw fetchError
    rows.value = data || []
  } catch (err: any) {
    error.value = err?.message || 'Failed to load news'
  } finally {
    loading.value = false
  }
}

const remove = async (row: any) => {
  if (!confirm(`Delete “${row.title}”?`)) return
  deletingId.value = row.id
  try {
    const { error: delError } = await supabase.from('doghealthy_news').delete().eq('id', row.id)
    if (delError) throw delError
    rows.value = rows.value.filter((r) => r.id !== row.id)
  } catch (err: any) {
    error.value = err?.message || 'Failed to delete'
  } finally {
    deletingId.value = ''
  }
}

onMounted(load)
</script>
