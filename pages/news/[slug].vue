<template>
  <NewsArticleView
    :article="article"
    :loading="loading"
    list-path="/news"
    back-label="← All news"
  />
</template>

<script setup lang="ts">
import { newsArticlePath } from '~/utils/newsSlug'

const route = useRoute()
const supabase = useSupabase()
const loading = ref(true)
const article = ref<any>(null)

usePageSeo(() => ({
  title: article.value ? `${article.value.title} — DogHealthy news` : 'News article — DogHealthy',
  description:
    article.value?.excerpt ||
    article.value?.body?.slice(0, 160) ||
    'DogHealthy news for UK dog owners.',
  path: article.value ? newsArticlePath(article.value) : `/news/${route.params.slug || ''}`,
  image: article.value?.image_url || undefined,
  type: 'article' as const
}))

const load = async () => {
  const slug = String(route.params.slug || '')
  const { data } = await supabase
    .from('doghealthy_news')
    .select('*')
    .eq('slug', slug)
    .eq('is_published', true)
    .maybeSingle()
  if (data && data.category === 'howto') {
    await navigateTo(newsArticlePath(data), { replace: true })
    return
  }
  article.value = data
  loading.value = false
}

onMounted(load)
watch(() => route.params.slug, load)
</script>
