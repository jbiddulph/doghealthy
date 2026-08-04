<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Hero Section with Image -->
    <div v-if="heroImage" class="relative h-64 bg-cover bg-center" :style="{ backgroundImage: `url(${heroImage})` }">
      <div class="absolute inset-0 bg-black opacity-30"></div>
      <div class="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center justify-between">
        <div>
          <h1 class="text-4xl font-bold text-white mb-2">My Dogs</h1>
          <p class="text-xl text-white">Manage all your furry friends in one place</p>
        </div>
        <div class="flex items-center gap-3">
          <NuxtLink
            to="/vets"
            class="hidden sm:inline-flex bg-gray-100/90 hover:bg-gray-200 text-gray-800 px-4 py-2 rounded-lg font-semibold transition-colors"
          >
            🏥 Vets
          </NuxtLink>
          <button
            type="button"
            @click="handleAddDogClick"
            class="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-semibold transition-colors"
          >
            + Add Dog
          </button>
        </div>
      </div>
    </div>
    
    <!-- Content -->
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div v-if="!heroImage" class="flex justify-between items-center mb-8">
        <h1 class="text-3xl font-bold text-gray-900">My Dogs</h1>
        <div class="flex items-center gap-3">
          <NuxtLink
            to="/vets"
            class="bg-gray-100 hover:bg-gray-200 text-gray-800 px-4 py-2 rounded-lg font-semibold transition-colors"
          >
            🏥 Vets
          </NuxtLink>
          <button
            type="button"
            @click="handleAddDogClick"
            class="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-semibold transition-colors"
          >
            + Add Dog
          </button>
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
        <div v-if="emptyStateImage" class="mb-6">
          <img
            v-if="emptyStateImage"
            :src="emptyStateImage.url"
            :alt="emptyStateImage.description || 'Happy dog'"
            width="256"
            height="256"
            class="w-64 h-64 mx-auto rounded-full object-cover"
            loading="lazy"
            decoding="async"
          />
        </div>
        <div v-else class="text-6xl mb-4">🐕</div>
        <h2 class="text-2xl font-semibold text-gray-900 mb-2">No dogs yet</h2>
        <p class="text-gray-600 mb-4">Start by adding your first furry friend! Tracking your dog's health information helps ensure they live a long, happy, and healthy life.</p>
        <p class="text-sm text-gray-500 mb-6">You can track vaccinations, medications, appointments, health records, and more for each of your dogs.</p>
        <button
          type="button"
          @click="handleAddDogClick"
          class="inline-block bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
        >
          Add Your First Dog
        </button>
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
              width="400"
              height="320"
              class="w-full h-full object-cover"
              loading="lazy"
              decoding="async"
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

const { fetchImageWithFallback } = useUnsplash()

// Images
const heroImage = ref('')
const emptyStateImage = ref<{ url: string; description?: string } | null>(null)

onMounted(async () => {
  try {
    const image = await fetchImageWithFallback('happy dog owner', { orientation: 'landscape', width: 1920, height: 600 })
    if (image) {
      heroImage.value = image.url
    }
  } catch (error) {
    // Silently fail
  }

  try {
    const img = await fetchImageWithFallback('cute dog puppy', { orientation: 'portrait', width: 400, height: 400 })
    if (img) {
      emptyStateImage.value = img
    }
  } catch (error) {
    // Silently fail
  }
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

usePageSeo({
  title: 'My Dogs — Manage Dog Profiles',
  description:
    'Manage your DogHealthy dog profiles. Track health records, vaccinations, medications, appointments and NFC tags for every dog in your UK household.',
  keywords: 'my dogs DogHealthy, dog profiles, pet health dashboard UK',
  path: '/dogs',
  index: false
})

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

const handleAddDogClick = async () => {
  try {
    await waitForAuth()

    if (!authStore.isAuthenticated || !authStore.userId) {
      router.push('/auth/login')
      return
    }

    // Free accounts can add up to 3 dogs; 4th requires subscription
    const { ensureCanCreate } = usePlanLimits()
    const allowed = await ensureCanCreate('dogs', dogs.value.length, { next: '/dogs/new' })
    if (!allowed) return

    router.push('/dogs/new')
  } catch (err) {
    console.error('Error handling Add Dog click:', err)
    router.push('/dogs/new')
  }
}

onMounted(() => {
  loadDogs()
})
</script>

