<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Navigation -->
    <nav class="bg-white shadow-sm border-b border-gray-200">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center h-16">
          <div class="flex items-center">
            <h1 class="text-xl font-bold text-gray-900">
              🐕 DogHealthy
            </h1>
          </div>
          
          <div class="flex items-center gap-4">
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
    
    <!-- Hero Section -->
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div class="text-center">
        <h2 class="text-4xl font-bold text-gray-900 mb-4">
          Welcome to DogHealthy
        </h2>
        <p class="text-xl text-gray-600 mb-8">
          The complete health tracking app for your furry friends
        </p>
        
        <div class="grid md:grid-cols-3 gap-8 mt-12">
          <div class="bg-white p-6 rounded-lg shadow-md">
            <div class="text-3xl mb-4">📋</div>
            <h3 class="text-lg font-semibold mb-2">Health Records</h3>
            <p class="text-gray-600">Track medical history, diagnoses, and treatments</p>
          </div>
          
          <div class="bg-white p-6 rounded-lg shadow-md">
            <div class="text-3xl mb-4">💉</div>
            <h3 class="text-lg font-semibold mb-2">Vaccinations</h3>
            <p class="text-gray-600">Never miss a vaccination with reminders</p>
          </div>
          
          <div class="bg-white p-6 rounded-lg shadow-md">
            <div class="text-3xl mb-4">📅</div>
            <h3 class="text-lg font-semibold mb-2">Appointments</h3>
            <p class="text-gray-600">Schedule and track vet appointments</p>
          </div>
        </div>
        
        <div class="mt-12">
          <NuxtLink
            v-if="!authStore.isAuthenticated"
            to="/auth/register"
            class="inline-block bg-blue-600 hover:bg-blue-700 text-white font-semibold px-8 py-3 rounded-lg text-lg transition-colors"
          >
            Get Started Free
          </NuxtLink>
          <NuxtLink
            v-else
            to="/dogs"
            class="inline-block bg-blue-600 hover:bg-blue-700 text-white font-semibold px-8 py-3 rounded-lg text-lg transition-colors"
          >
            View My Dogs
          </NuxtLink>
        </div>
      </div>
    </div>
  </div>
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

