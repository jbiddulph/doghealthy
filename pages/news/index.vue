<template>
  <div class="min-h-screen bg-gray-50">
    <div class="bg-white border-b border-gray-100">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 class="text-4xl font-bold text-gray-900 mb-3">DogHealthy news</h1>
        <p class="text-lg text-gray-600 max-w-2xl">
          Tips, product updates and UK dog-health stories from the DogHealthy team.
        </p>
        <NuxtLink to="/how-to" class="inline-block mt-4 text-emerald-800 font-semibold hover:underline">
          Browse how-to guides →
        </NuxtLink>
      </div>
    </div>

    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div v-if="loading" class="text-gray-600 py-12 text-center">Loading articles…</div>
      <div v-else-if="articles.length === 0" class="text-center py-16 text-gray-500">
        No news yet — check back soon.
      </div>
      <div v-else class="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
        <NuxtLink
          v-for="article in articles"
          :key="article.id"
            :to="newsArticlePath(article)"
          class="bg-white rounded-xl shadow-md hover:shadow-xl transition-shadow overflow-hidden border border-gray-100"
        >
          <img
            v-if="article.image_url"
            :src="article.image_url"
            :alt="article.image_alt || article.title"
            class="w-full h-48 object-cover"
          />
          <div v-else class="w-full h-48 bg-amber-100 flex items-center justify-center text-5xl">📰</div>
          <div class="p-5">
            <p v-if="article.is_featured" class="text-xs font-semibold uppercase tracking-wide text-amber-700 mb-2">
              Featured
            </p>
            <h2 class="text-xl font-bold text-gray-900 mb-2">{{ article.title }}</h2>
            <p class="text-sm text-gray-600 line-clamp-3">{{ article.excerpt || article.body }}</p>
            <p class="text-xs text-gray-400 mt-3">{{ formatDate(article.published_at || article.created_at) }}</p>
          </div>
        </NuxtLink>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { newsArticlePath } from '~/utils/newsSlug'

usePageSeo({
  title: 'DogHealthy news',
  description: 'UK dog health news, NFC tag updates and tips from DogHealthy.',
  path: '/news'
})

const supabase = useSupabase()
const loading = ref(true)
const articles = ref<any[]>([])

const formatDate = (iso: string) => {
  try {
    return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
  } catch {
    return ''
  }
}

onMounted(async () => {
  const { data } = await supabase
    .from('doghealthy_news')
    .select('id, slug, title, excerpt, body, image_url, image_alt, is_featured, category, published_at, created_at')
    .eq('is_published', true)
    .eq('category', 'news')
    .order('published_at', { ascending: false })
  articles.value = data || []
  loading.value = false
})
</script>
