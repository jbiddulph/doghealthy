<template>
  <ul class="divide-y divide-slate-200 border-t border-slate-200">
    <li v-for="article in articles" :key="article.id">
      <NuxtLink
        :to="newsArticlePath(article)"
        class="flex items-start justify-between gap-3 py-3.5 text-slate-900 hover:text-blue-700 font-medium"
      >
        <span>{{ article.title }}</span>
        <span class="shrink-0 text-slate-400 text-lg leading-none mt-0.5" aria-hidden="true">›</span>
      </NuxtLink>
    </li>
  </ul>
</template>

<script setup lang="ts">
import { newsArticlePath } from '~/utils/newsSlug'

defineProps<{
  articles: Array<{ id: string; slug: string; title: string; category?: string | null }>
}>()
</script>
