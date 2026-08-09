<template>
  <div class="min-h-screen bg-gray-50 flex items-center justify-center px-4">
    <div class="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
      <h1 class="text-2xl font-bold text-gray-900 mb-3">Fixing this browser</h1>
      <p class="text-sm text-gray-600 mb-6">
        Clearing stuck cache and login data for DogHealthy, then sending you back to login.
      </p>
      <p class="text-sm text-gray-500">{{ status }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: false
})

usePageSeo({
  title: 'Repair browser data — DogHealthy',
  path: '/auth/repair',
  index: false
})

const status = ref('Clearing…')

onMounted(async () => {
  try {
    const regs = await navigator.serviceWorker?.getRegistrations?.()
    await Promise.all((regs || []).map((reg) => reg.unregister()))
  } catch {
    // ignore
  }

  try {
    if ('caches' in window) {
      const keys = await caches.keys()
      await Promise.all(keys.map((key) => caches.delete(key)))
    }
  } catch {
    // ignore
  }

  try {
    const keep: string[] = []
    for (let i = 0; i < localStorage.length; i += 1) {
      const key = localStorage.key(i)
      if (key) keep.push(key)
    }
    keep.forEach((key) => {
      if (/supabase|sb-|doghealthy|auth/i.test(key)) {
        localStorage.removeItem(key)
      }
    })
    sessionStorage.clear()
  } catch {
    // ignore
  }

  status.value = 'Done. Redirecting…'
  window.location.replace('/auth/login?repaired=1')
})
</script>
