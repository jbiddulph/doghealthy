<template>
  <AdminShell title="Edit news article" subtitle="Update copy, image, featured or publish status.">
    <div v-if="loading" class="text-slate-600 py-8">Loading…</div>
    <div v-else-if="loadError" class="text-sm text-red-700">{{ loadError }}</div>
    <NewsArticleForm v-else :article="article" @saved="onSaved" @cancel="navigateTo('/admin/news')" />
  </AdminShell>
</template>

<script setup lang="ts">
definePageMeta({
  middleware: ['auth', 'admin'],
  layout: false
})

usePageSeo({
  title: 'Edit news article — DogHealthy',
  description: 'Edit a DogHealthy news article.',
  path: '/admin/news',
  index: false
})

const route = useRoute()
const supabase = useSupabase()
const loading = ref(true)
const loadError = ref('')
const article = ref<any>(null)

onMounted(async () => {
  const id = String(route.params.id || '')
  const { data, error } = await supabase.from('doghealthy_news').select('*').eq('id', id).maybeSingle()
  if (error || !data) loadError.value = error?.message || 'Article not found'
  else article.value = data
  loading.value = false
})

const onSaved = () => navigateTo('/admin/news')
</script>
