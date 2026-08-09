<template>
  <div class="min-h-screen bg-gray-50">
    <div class="bg-white border-b border-gray-100">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <p class="text-sm font-semibold uppercase tracking-wide text-emerald-700 mb-2">How to</p>
        <h1 class="text-4xl font-bold text-gray-900 mb-3">Dog care guides</h1>
        <p class="text-lg text-gray-600 max-w-2xl">
          Practical how-tos for everyday UK dog life — from jealousy and body language to heat safety, bathing and diet.
        </p>
      </div>
    </div>

    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div v-if="loading" class="text-gray-600 py-12">Loading guides…</div>
      <div v-else-if="articles.length === 0" class="text-center py-16 text-gray-500">
        No how-to guides yet — check back soon.
      </div>
      <div v-else class="grid md:grid-cols-2 gap-x-12">
        <HowToArticleList :articles="leftCol" />
        <HowToArticleList :articles="rightCol" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
usePageSeo({
  title: 'How to care for your dog — DogHealthy',
  description:
    'UK dog how-to guides: jealousy, body language, lost dogs, hot cars, bathing, diet, ear infections and more.',
  path: '/how-to'
})

const supabase = useSupabase()
const loading = ref(true)
const articles = ref<any[]>([])

const midpoint = computed(() => Math.ceil(articles.value.length / 2))
const leftCol = computed(() => articles.value.slice(0, midpoint.value))
const rightCol = computed(() => articles.value.slice(midpoint.value))

onMounted(async () => {
  const { data } = await supabase
    .from('doghealthy_news')
    .select('id, slug, title, category, is_featured, published_at')
    .eq('is_published', true)
    .eq('category', 'howto')
    .order('is_featured', { ascending: false })
    .order('published_at', { ascending: false })
  articles.value = data || []
  loading.value = false
})
</script>
