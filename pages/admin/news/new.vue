<template>
  <AdminShell title="New news article" subtitle="Search Unsplash for a photo, then publish or feature it.">
    <NewsArticleForm @saved="onSaved" @cancel="navigateTo('/admin/news')" />
  </AdminShell>
</template>

<script setup lang="ts">
definePageMeta({
  middleware: ['auth', 'admin'],
  layout: false
})

usePageSeo({
  title: 'New news article — DogHealthy',
  description: 'Create a DogHealthy news article.',
  path: '/admin/news/new',
  index: false
})

const onSaved = () => navigateTo('/admin/news')
</script>
