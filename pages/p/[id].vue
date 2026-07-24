<template>
  <div class="min-h-screen bg-gray-50 flex items-center justify-center p-8">
    <p class="text-gray-600">Redirecting to pet profile…</p>
  </div>
</template>

<script setup lang="ts">
const route = useRoute()
const id = route.params.id as string

// Legacy NFC Me profile links → canonical /dogs/{id} URL
await navigateTo(`/dogs/${id}`, { redirectCode: 301 })
</script>
