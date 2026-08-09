<template>
  <div class="min-h-screen bg-gray-50">
    <div v-if="loading" class="max-w-3xl mx-auto px-4 py-20 text-gray-600">Loading…</div>
    <div v-else-if="!article" class="max-w-3xl mx-auto px-4 py-20 text-center">
      <h1 class="text-2xl font-bold text-gray-900 mb-3">Article not found</h1>
      <NuxtLink :to="listPath" class="text-blue-600 font-medium hover:underline">{{ backLabel }}</NuxtLink>
    </div>
    <article v-else class="bg-white">
      <div v-if="article.image_url" class="w-full max-h-[420px] overflow-hidden bg-slate-100">
        <img
          :src="article.image_url"
          :alt="article.image_alt || article.title"
          class="w-full max-h-[420px] object-cover"
        />
      </div>
      <div class="max-w-3xl mx-auto px-4 sm:px-6 py-10">
        <NuxtLink :to="listPath" class="text-sm text-blue-600 font-medium hover:underline">{{ backLabel }}</NuxtLink>
        <p
          class="mt-4 text-xs font-semibold uppercase tracking-wide"
          :class="article.category === 'howto' ? 'text-emerald-700' : 'text-amber-700'"
        >
          {{ article.category === 'howto' ? 'How to' : article.is_featured ? 'Featured news' : 'News' }}
        </p>
        <h1 class="text-3xl sm:text-4xl font-bold text-gray-900 mt-2 mb-3">{{ article.title }}</h1>
        <p class="text-sm text-gray-500 mb-8">
          {{ formatDate(article.published_at || article.created_at) }}
          <span v-if="article.image_author">
            · Photo by
            <a
              :href="(article.image_author_url || 'https://unsplash.com') + '?utm_source=doghealthy&utm_medium=referral'"
              target="_blank"
              rel="noopener noreferrer"
              class="underline"
            >{{ article.image_author }}</a>
          </span>
        </p>
        <p v-if="article.excerpt" class="text-lg text-gray-700 mb-6 font-medium">{{ article.excerpt }}</p>
        <div class="prose prose-slate max-w-none text-gray-800 whitespace-pre-wrap leading-relaxed">
          {{ article.body }}
        </div>
        <p
          v-if="article.category === 'howto'"
          class="mt-10 text-sm text-slate-500 border-t border-slate-200 pt-6"
        >
          This guide is general information for UK dog owners and is not a substitute for veterinary advice.
          Contact your vet if you are worried about your dog.
        </p>
      </div>
    </article>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  article: Record<string, any> | null
  loading?: boolean
  listPath: string
  backLabel: string
}>()

const formatDate = (iso?: string) => {
  if (!iso) return ''
  try {
    return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
  } catch {
    return ''
  }
}
</script>
