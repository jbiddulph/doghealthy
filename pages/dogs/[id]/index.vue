<template>
  <div class="min-h-screen bg-gray-50 py-8">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <!-- Back Button -->
      <NuxtLink
        to="/dogs"
        class="text-blue-600 hover:text-blue-700 font-medium mb-6 inline-flex items-center"
      >
        <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
        Back to My Dogs
      </NuxtLink>

      <!-- Loading State -->
      <div v-if="loading" class="text-center py-12">
        <div class="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <p class="mt-4 text-gray-600">Loading dog details...</p>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="bg-red-50 border border-red-200 rounded-lg p-6">
        <h2 class="text-xl font-semibold text-red-800 mb-2">Error Loading Dog</h2>
        <p class="text-red-600">{{ error }}</p>
        <NuxtLink
          to="/dogs"
          class="mt-4 inline-block text-blue-600 hover:text-blue-700"
        >
          Return to Dogs List
        </NuxtLink>
      </div>

      <!-- Dog Details -->
      <div v-else-if="dog" class="space-y-6">
        <!-- Header with Photo -->
        <div class="bg-white rounded-lg shadow-md overflow-hidden">
          <div class="md:flex">
            <!-- Photo -->
            <div class="md:w-1/3">
              <img
                v-if="dog.photo_url"
                :src="dog.photo_url"
                :alt="dog.name"
                class="w-full h-64 md:h-full object-cover"
              />
              <div
                v-else
                class="w-full h-64 md:h-full bg-gray-200 flex items-center justify-center"
              >
                <svg class="h-24 w-24 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
            </div>

            <!-- Info -->
            <div class="md:w-2/3 p-6">
              <div class="flex justify-between items-start mb-4">
                <div>
                  <h1 class="text-3xl font-bold text-gray-900">{{ dog.name }}</h1>
                  <p v-if="dog.breed" class="text-xl text-gray-600 mt-1">{{ dog.breed }}</p>
                </div>
                <NuxtLink
                  :to="`/dogs/${dog.id}/edit`"
                  class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  Edit
                </NuxtLink>
              </div>

              <!-- Details Grid -->
              <div class="grid md:grid-cols-2 gap-4 mt-6">
                <div v-if="dog.birth_date" class="flex items-start">
                  <svg class="w-5 h-5 text-gray-400 mr-3 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <div>
                    <p class="text-sm font-medium text-gray-500">Date of Birth</p>
                    <p class="text-gray-900">{{ formatDate(dog.birth_date) }}</p>
                    <p class="text-sm text-gray-500">{{ calculateAge(dog.birth_date) }}</p>
                  </div>
                </div>

                <div v-if="dog.gender" class="flex items-start">
                  <svg class="w-5 h-5 text-gray-400 mr-3 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  <div>
                    <p class="text-sm font-medium text-gray-500">Gender</p>
                    <p class="text-gray-900 capitalize">{{ dog.gender }}</p>
                  </div>
                </div>

                <div v-if="dog.weight_kg" class="flex items-start">
                  <svg class="w-5 h-5 text-gray-400 mr-3 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
                  </svg>
                  <div>
                    <p class="text-sm font-medium text-gray-500">Weight</p>
                    <p class="text-gray-900">{{ dog.weight_kg }} kg</p>
                  </div>
                </div>

                <div v-if="dog.microchip_number" class="flex items-start">
                  <svg class="w-5 h-5 text-gray-400 mr-3 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
                  </svg>
                  <div>
                    <p class="text-sm font-medium text-gray-500">Microchip</p>
                    <p class="text-gray-900 font-mono text-sm">{{ dog.microchip_number }}</p>
                  </div>
                </div>
              </div>

              <!-- Notes -->
              <div v-if="dog.notes" class="mt-6">
                <p class="text-sm font-medium text-gray-500 mb-2">Notes</p>
                <p class="text-gray-900">{{ dog.notes }}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Quick Actions -->
        <div class="grid md:grid-cols-4 gap-4">
          <NuxtLink
            :to="`/dogs/${dog.id}/health-records`"
            class="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow text-center"
          >
            <div class="text-4xl mb-2">📋</div>
            <h3 class="font-semibold text-gray-900">Health Records</h3>
            <p class="text-sm text-gray-600 mt-1">View medical history</p>
          </NuxtLink>

          <NuxtLink
            :to="`/dogs/${dog.id}/vaccinations`"
            class="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow text-center"
          >
            <div class="text-4xl mb-2">💉</div>
            <h3 class="font-semibold text-gray-900">Vaccinations</h3>
            <p class="text-sm text-gray-600 mt-1">Track vaccines</p>
          </NuxtLink>

          <NuxtLink
            :to="`/dogs/${dog.id}/medications`"
            class="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow text-center"
          >
            <div class="text-4xl mb-2">💊</div>
            <h3 class="font-semibold text-gray-900">Medications</h3>
            <p class="text-sm text-gray-600 mt-1">Manage meds</p>
          </NuxtLink>

          <NuxtLink
            :to="`/dogs/${dog.id}/appointments`"
            class="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow text-center"
          >
            <div class="text-4xl mb-2">📅</div>
            <h3 class="font-semibold text-gray-900">Appointments</h3>
            <p class="text-sm text-gray-600 mt-1">Schedule visits</p>
          </NuxtLink>
        </div>

        <!-- Recent Activity -->
        <div class="bg-white rounded-lg shadow-md p-6">
          <h2 class="text-xl font-semibold text-gray-900 mb-4">Recent Activity</h2>
          <p class="text-gray-600">No recent activity yet. Start by adding health records or appointments.</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const route = useRoute()
const router = useRouter()
const supabase = useSupabase()
const authStore = useAuthStore()

interface Dog {
  id: string
  user_id: string
  name: string
  breed: string | null
  gender: string | null
  birth_date: string | null
  weight_kg: number | null
  color: string | null
  microchip_number: string | null
  photo_url: string | null
  notes: string | null
  is_active: boolean
  created_at: string
  updated_at: string
}

const dog = ref<Dog | null>(null)
const loading = ref(true)
const error = ref('')

const fetchDog = async () => {
  try {
    loading.value = true
    error.value = ''
    
    const dogId = route.params.id as string
    
    const { data, error: fetchError } = await supabase
      .from('doghealthy_dogs')
      .select('*')
      .eq('id', dogId)
      .eq('user_id', authStore.userId)
      .single()
    
    if (fetchError) {
      console.error('Error fetching dog:', fetchError)
      error.value = 'Dog not found or you do not have permission to view it'
      return
    }
    
    dog.value = data
  } catch (err: any) {
    console.error('Error:', err)
    error.value = err.message || 'Failed to load dog details'
  } finally {
    loading.value = false
  }
}

const formatDate = (dateStr: string | null) => {
  if (!dateStr) return 'Unknown'
  const date = new Date(dateStr)
  return date.toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  })
}

const calculateAge = (dateStr: string | null) => {
  if (!dateStr) return ''
  
  const birthDate = new Date(dateStr)
  const today = new Date()
  let years = today.getFullYear() - birthDate.getFullYear()
  let months = today.getMonth() - birthDate.getMonth()
  
  if (months < 0) {
    years--
    months += 12
  }
  
  if (years === 0) {
    return `${months} month${months !== 1 ? 's' : ''} old`
  } else if (months === 0) {
    return `${years} year${years !== 1 ? 's' : ''} old`
  } else {
    return `${years} year${years !== 1 ? 's' : ''}, ${months} month${months !== 1 ? 's' : ''} old`
  }
}

onMounted(() => {
  if (!authStore.isAuthenticated) {
    router.push('/auth/login')
    return
  }
  
  fetchDog()
})
</script>

