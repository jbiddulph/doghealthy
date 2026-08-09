<template>
  <div class="min-h-screen bg-slate-100">
    <header class="bg-slate-900 text-white">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <p class="text-xs uppercase tracking-wider text-slate-400">DogHealthy</p>
          <h1 class="text-xl font-bold">Admin</h1>
        </div>
        <nav class="flex flex-wrap items-center gap-2 text-sm">
          <NuxtLink
            v-for="item in links"
            :key="item.to"
            :to="item.to"
            class="px-3 py-1.5 rounded-md transition-colors"
            :class="isActive(item.to) ? 'bg-white/15 text-white' : 'text-slate-300 hover:text-white hover:bg-white/10'"
          >
            {{ item.label }}
          </NuxtLink>
          <div class="text-white [&_button]:text-white [&_.text-secondary]:text-slate-300">
            <NotificationBell />
          </div>
          <NuxtLink
            to="/dogs"
            class="px-3 py-1.5 rounded-md text-slate-400 hover:text-white hover:bg-white/10"
          >
            Exit admin
          </NuxtLink>
        </nav>
      </div>
    </header>

    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div v-if="title || subtitle" class="mb-6">
        <h2 v-if="title" class="text-2xl font-bold text-slate-900">{{ title }}</h2>
        <p v-if="subtitle" class="text-slate-600 mt-1">{{ subtitle }}</p>
      </div>
      <slot />
    </main>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  title?: string
  subtitle?: string
}>()

const route = useRoute()

const links = [
  { to: '/admin', label: 'Dashboard' },
  { to: '/admin/users', label: 'Users' },
  { to: '/admin/dogs', label: 'Dogs' },
  { to: '/admin/news', label: 'News' },
  { to: '/admin/nfc-orders', label: 'NFC orders' }
]

const isActive = (path: string) => {
  if (path === '/admin') return route.path === '/admin'
  return route.path === path || route.path.startsWith(`${path}/`)
}
</script>
