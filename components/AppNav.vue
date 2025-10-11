<template>
  <nav class="bg-white shadow-sm border-b border-gray-200">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex justify-between items-center h-16">
        <div class="flex items-center">
          <NuxtLink to="/" class="text-xl font-bold text-gray-900">
            🐕 DogHealthy
          </NuxtLink>
        </div>
        
        <div class="flex items-center gap-4">
          <NuxtLink
            to="/food-finder"
            class="text-gray-700 hover:text-gray-900 font-medium"
          >
            Food Finder
          </NuxtLink>
          <template v-if="authStore.isAuthenticated">
            <NuxtLink
              to="/dogs"
              class="text-gray-700 hover:text-gray-900 font-medium"
            >
              My Dogs
            </NuxtLink>
            <button
              @click="handleLogout"
              class="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              Logout
            </button>
          </template>
          <template v-else>
            <NuxtLink
              to="/auth/login"
              class="text-gray-700 hover:text-gray-900 font-medium"
            >
              Login
            </NuxtLink>
            <NuxtLink
              to="/auth/register"
              class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              Register
            </NuxtLink>
          </template>
        </div>
      </div>
    </div>
  </nav>
</template>

<script setup lang="ts">
const authStore = useAuthStore()
const router = useRouter()

const handleLogout = async () => {
  try {
    await authStore.signOut()
    router.push('/')
  } catch (error) {
    console.error('Logout error:', error)
  }
}
</script>

