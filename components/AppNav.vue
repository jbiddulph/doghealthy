<template>
  <nav class="bg-white shadow-sm border-b border-muted/40">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex justify-between items-center h-16">
        <div class="flex items-center">
          <NuxtLink to="/" class="flex items-center gap-2 text-xl font-bold text-gray-900">
            <img src="/dog_silhouette_friendly_pose_4MtxY.svg" alt="DogHealthy logo" class="h-7 w-7" />
            <span>DogHealthy</span>
          </NuxtLink>
        </div>
        
        <div class="flex items-center gap-4">
          <NuxtLink
            to="/food-finder"
            class="text-secondary hover:text-dark font-medium"
          >
            Food Finder
          </NuxtLink>
          <ClientOnly>
            <template v-if="authStore.isAuthenticated">
              <NuxtLink
                to="/dogs"
                class="text-secondary hover:text-dark font-medium"
              >
                My Dogs
              </NuxtLink>
              <button
                @click="handleLogout"
                class="bg-accent hover:brightness-95 text-white px-4 py-2 rounded-lg transition-colors"
              >
                Logout
              </button>
            </template>
            <template v-else>
              <NuxtLink
                to="/auth/login"
                class="text-secondary hover:text-dark font-medium"
              >
                Login
              </NuxtLink>
              <NuxtLink
                to="/auth/register"
                class="bg-primary hover:brightness-95 text-dark px-4 py-2 rounded-lg transition-colors"
              >
                Register
              </NuxtLink>
            </template>
          </ClientOnly>
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

