<template>
  <NewsArticleView
    :article="article"
    :loading="loading"
    list-path="/how-to"
    back-label="← All how-to guides"
  />
</template>

<script setup lang="ts">
import { newsArticlePath } from '~/utils/newsSlug'

const route = useRoute()
const supabase = useSupabase()
const loading = ref(true)
const article = ref<any>(null)

usePageSeo(() => ({
  title: article.value ? `${article.value.title} — How to` : 'How-to guide — DogHealthy',
  description:
    article.value?.excerpt ||
    article.value?.body?.slice(0, 160) ||
    'DogHealthy how-to guides for UK dog owners.',
  path: article.value ? newsArticlePath(article.value) : `/how-to/${route.params.slug || ''}`,
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
  if (data && data.category !== 'howto') {
    await navigateTo(newsArticlePath(data), { replace: true })
    return
  }
  article.value = data
  loading.value = false
}

onMounted(load)
watch(() => route.params.slug, load)
</script>
