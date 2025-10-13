<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Content -->
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div class="flex justify-between items-center mb-8">
        <h1 class="text-3xl font-bold text-gray-900">My Dogs</h1>
        <div class="flex items-center gap-3">
          <NuxtLink
            to="/vets"
            class="bg-gray-100 hover:bg-gray-200 text-gray-800 px-4 py-2 rounded-lg font-semibold transition-colors"
          >
            🏥 Vets
          </NuxtLink>
          <NuxtLink
            to="/dogs/new"
            class="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-semibold transition-colors"
          >
            + Add Dog
          </NuxtLink>
        </div>
      </div>
      
      <!-- Loading State -->
      <div v-if="loading" class="text-center py-12">
        <div class="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <p class="mt-4 text-gray-600">Loading your dogs...</p>
      </div>
      
      <!-- Error State -->
      <div v-else-if="error" class="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
        {{ error }}
      </div>
      
      <!-- Empty State -->
      <div v-else-if="!dogs || dogs.length === 0" class="text-center py-12">
        <div class="text-6xl mb-4">🐕</div>
        <h2 class="text-2xl font-semibold text-gray-900 mb-2">No dogs yet</h2>
        <p class="text-gray-600 mb-6">Start by adding your first furry friend!</p>
        <NuxtLink
          to="/dogs/new"
          class="inline-block bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
        >
          Add Your First Dog
        </NuxtLink>
      </div>
      
      <!-- Dogs Grid -->
      <div v-else class="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div
          v-for="dog in dogs"
          :key="dog.id"
          class="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
        >
          <div class="aspect-square bg-gray-200 relative">
            <img
              v-if="dog.photoUrl"
              :src="dog.photoUrl"
              :alt="dog.name"
              class="w-full h-full object-cover"
            />
            <div v-else class="flex items-center justify-center h-full text-6xl">
              🐕
            </div>
          </div>
          
          <div class="p-6">
            <h3 class="text-xl font-bold text-gray-900 mb-2">{{ dog.name }}</h3>
            <div class="space-y-1 text-sm text-gray-600 mb-4">
              <p v-if="dog.breed">{{ dog.breed }}</p>
              <p v-if="dog.gender">{{ dog.gender }}</p>
              <p v-if="dog.birthDate">{{ formatAge(dog.birthDate) }}</p>
              <p v-if="dog.weightKg">{{ dog.weightKg }} kg</p>
            </div>
            
            <div class="flex gap-2">
              <NuxtLink
                :to="`/dogs/${dog.id}`"
                class="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-center px-4 py-2 rounded-lg font-semibold transition-colors"
              >
                View Details
              </NuxtLink>
              <NuxtLink
                :to="`/dogs/${dog.id}/edit`"
                class="bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-lg font-semibold transition-colors"
              >
                Edit
              </NuxtLink>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  middleware: 'auth'
})

interface Dog {
  id: string
  name: string
  breed?: string
  gender?: string
  birthDate?: string
  weightKg?: number
  photoUrl?: string
}

const authStore = useAuthStore()
const router = useRouter()
const supabase = useSupabase()

const dogs = ref<Dog[]>([])
const loading = ref(true)
const error = ref('')

const waitForAuth = async () => {
  // If auth is still initializing, wait until it's done
  if ((authStore as any).loading) {
    await new Promise<void>((resolve) => {
      const check = () => {
        if (!(authStore as any).loading) resolve()
        else setTimeout(check, 50)
      }
      check()
    })
  }
}

const loadDogs = async () => {
  loading.value = true
  error.value = ''
  
  try {
    await waitForAuth()

    // If user not authenticated for any reason, redirect to login
    if (!authStore.isAuthenticated || !authStore.userId) {
      router.push('/auth/login')
      return
    }

    const { data, error: fetchError } = await supabase
      .from('doghealthy_dogs')
      .select('*')
      .eq('user_id', authStore.userId)
      .eq('is_active', true)
      .order('created_at', { ascending: false })
    
    if (fetchError) throw fetchError
    
    dogs.value = data?.map((dog: any) => ({
      id: dog.id,
      name: dog.name,
      breed: dog.breed,
      gender: dog.gender,
      birthDate: dog.birth_date,
      weightKg: dog.weight_kg != null ? Number(dog.weight_kg) : undefined,
      photoUrl: dog.photo_url
    })) || []
  } catch (err: any) {
    console.error('Error loading dogs:', err)
    error.value = err.message || 'Failed to load dogs'
  } finally {
    loading.value = false
  }
}

const formatAge = (birthDate: string) => {
  const birth = new Date(birthDate)
  const now = new Date()
  const years = now.getFullYear() - birth.getFullYear()
  const months = now.getMonth() - birth.getMonth()
  
  if (years > 0) {
    return months < 0 ? `${years - 1} years old` : `${years} years old`
  } else {
    return months > 0 ? `${months} months old` : 'Less than a month old'
  }
}

onMounted(() => {
  loadDogs()
})
</script>

