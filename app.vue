<template>
  <div class="flex flex-col min-h-screen">
    <AppNav />
    <main class="flex-grow">
      <NuxtPage />
    </main>
    <AppFooter />
  </div>
</template>

<script setup>
// Initialize auth store on app startup
const authStore = useAuthStore()
await authStore.initialize()
</script>
