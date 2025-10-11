<template>
  <div class="min-h-screen bg-gray-50 py-8">
    <div class="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
      <!-- Loading State -->
      <div v-if="loading && !dog" class="text-center py-12">
        <div class="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <p class="mt-4 text-gray-600">Loading...</p>
      </div>

      <!-- Edit Form -->
      <div v-else-if="dog">
        <!-- Header -->
        <div class="mb-8">
          <NuxtLink
            :to="`/dogs/${dog.id}`"
            class="text-blue-600 hover:text-blue-700 font-medium mb-4 inline-flex items-center"
          >
            <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to {{ dog.name }}
          </NuxtLink>
          <h1 class="text-3xl font-bold text-gray-900 mt-4">Edit {{ dog.name }}</h1>
          <p class="text-gray-600 mt-2">Update your dog's information</p>
        </div>

        <!-- Form -->
        <div class="bg-white rounded-lg shadow-md p-6">
          <form @submit.prevent="handleSubmit">
            <!-- Photo Update -->
            <div class="mb-6">
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Dog Photo
              </label>
              <div class="flex items-center space-x-6">
                <div class="shrink-0">
                  <img
                    v-if="photoPreview || dog.photo_url"
                    :src="photoPreview || dog.photo_url"
                    :alt="dog.name"
                    class="h-32 w-32 object-cover rounded-lg border-2 border-gray-300"
                  />
                  <div
                    v-else
                    class="h-32 w-32 bg-gray-200 rounded-lg flex items-center justify-center border-2 border-gray-300"
                  >
                    <svg class="h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                </div>
                <div>
                  <label class="cursor-pointer">
                    <span class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors inline-block">
                      Change Photo
                    </span>
                    <input
                      type="file"
                      ref="fileInput"
                      accept="image/*"
                      @change="handleFileSelect"
                      class="hidden"
                    />
                  </label>
                  <button
                    v-if="dog.photo_url && !selectedFile"
                    @click="removePhoto"
                    type="button"
                    class="ml-2 text-red-600 hover:text-red-700 text-sm"
                  >
                    Remove Photo
                  </button>
                </div>
              </div>
              <p v-if="uploadError" class="text-red-600 text-sm mt-2">{{ uploadError }}</p>
            </div>

            <!-- Name -->
            <div class="mb-6">
              <label for="name" class="block text-sm font-medium text-gray-700 mb-2">
                Dog Name *
              </label>
              <input
                id="name"
                v-model="form.name"
                type="text"
                required
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <!-- Breed -->
            <div class="mb-6">
              <label for="breed" class="block text-sm font-medium text-gray-700 mb-2">
                Breed
              </label>
              <input
                id="breed"
                v-model="form.breed"
                type="text"
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <!-- Date of Birth -->
            <div class="mb-6">
              <label for="birthDate" class="block text-sm font-medium text-gray-700 mb-2">
                Date of Birth
              </label>
              <input
                id="birthDate"
                v-model="form.birthDate"
                type="date"
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <!-- Gender -->
            <div class="mb-6">
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Gender
              </label>
              <div class="flex space-x-4">
                <label class="flex items-center">
                  <input
                    v-model="form.gender"
                    type="radio"
                    value="male"
                    class="mr-2 text-blue-600 focus:ring-blue-500"
                  />
                  <span class="text-gray-700">Male</span>
                </label>
                <label class="flex items-center">
                  <input
                    v-model="form.gender"
                    type="radio"
                    value="female"
                    class="mr-2 text-blue-600 focus:ring-blue-500"
                  />
                  <span class="text-gray-700">Female</span>
                </label>
              </div>
            </div>

            <!-- Weight -->
            <div class="mb-6">
              <label for="weight" class="block text-sm font-medium text-gray-700 mb-2">
                Weight (kg)
              </label>
              <input
                id="weight"
                v-model.number="form.weight"
                type="number"
                step="0.1"
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <!-- Microchip Number -->
            <div class="mb-6">
              <label for="microchipNumber" class="block text-sm font-medium text-gray-700 mb-2">
                Microchip Number
              </label>
              <input
                id="microchipNumber"
                v-model="form.microchipNumber"
                type="text"
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <!-- Notes -->
            <div class="mb-6">
              <label for="notes" class="block text-sm font-medium text-gray-700 mb-2">
                Notes
              </label>
              <textarea
                id="notes"
                v-model="form.notes"
                rows="4"
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              ></textarea>
            </div>

            <!-- Error Message -->
            <div v-if="error" class="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p class="text-red-800">{{ error }}</p>
            </div>

            <!-- Success Message -->
            <div v-if="success" class="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
              <p class="text-green-800">Changes saved successfully!</p>
            </div>

            <!-- Submit Buttons -->
            <div class="flex justify-between">
              <button
                @click="confirmDelete"
                type="button"
                class="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Delete Dog
              </button>
              
              <div class="flex space-x-4">
                <NuxtLink
                  :to="`/dogs/${dog.id}`"
                  class="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </NuxtLink>
                <button
                  type="submit"
                  :disabled="saving"
                  class="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span v-if="saving">Saving...</span>
                  <span v-else>Save Changes</span>
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>

      <!-- Error Loading -->
      <div v-else class="bg-red-50 border border-red-200 rounded-lg p-6">
        <h2 class="text-xl font-semibold text-red-800 mb-2">Error</h2>
        <p class="text-red-600">{{ error || 'Failed to load dog details' }}</p>
      </div>
    </div>

    <!-- Delete Confirmation Modal -->
    <div
      v-if="showDeleteModal"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      @click="showDeleteModal = false"
    >
      <div class="bg-white rounded-lg p-6 max-w-md mx-4" @click.stop>
        <h3 class="text-xl font-semibold text-gray-900 mb-4">Delete {{ dog?.name }}?</h3>
        <p class="text-gray-600 mb-6">
          Are you sure you want to delete this dog? This will also delete all associated health records, 
          vaccinations, medications, and appointments. This action cannot be undone.
        </p>
        <div class="flex justify-end space-x-4">
          <button
            @click="showDeleteModal = false"
            class="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            @click="handleDelete"
            class="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            Delete
          </button>
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
  microchip_number: string | null
  photo_url: string | null
  notes: string | null
}

const dog = ref<Dog | null>(null)
const loading = ref(true)
const saving = ref(false)
const error = ref('')
const success = ref(false)
const showDeleteModal = ref(false)

const form = ref({
  name: '',
  breed: '',
  birthDate: '',
  gender: '',
  weight: null as number | null,
  microchipNumber: '',
  notes: ''
})

const selectedFile = ref<File | null>(null)
const photoPreview = ref<string | null>(null)
const uploadError = ref('')
const photoToRemove = ref(false)
const fileInput = ref<HTMLInputElement | null>(null)

const fetchDog = async () => {
  try {
    loading.value = true
    error.value = ''
    
    const dogId = route.params.id as string
    console.log('[Edit Page] Fetching dog:', dogId)
    console.log('[Edit Page] User ID:', authStore.userId)
    
    if (!authStore.userId) {
      console.error('[Edit Page] No user ID available')
      error.value = 'Please log in to edit dogs'
      loading.value = false
      return
    }
    
    const { data, error: fetchError } = await supabase
      .from('doghealthy_dogs')
      .select('*')
      .eq('id', dogId)
      .eq('user_id', authStore.userId)
      .single()
    
    if (fetchError) {
      console.error('[Edit Page] Fetch error:', fetchError)
      error.value = 'Dog not found or you do not have permission to edit it'
      loading.value = false
      return
    }
    
    console.log('[Edit Page] Dog loaded:', data)
    dog.value = data
    
    // Populate form
    form.value = {
      name: data.name,
      breed: data.breed || '',
      birthDate: data.birth_date || '',
      gender: data.gender || '',
      weight: data.weight_kg,
      microchipNumber: data.microchip_number || '',
      notes: data.notes || ''
    }
    
    console.log('[Edit Page] Form populated:', form.value)
  } catch (err: any) {
    console.error('[Edit Page] Exception:', err)
    error.value = err.message || 'Failed to load dog details'
  } finally {
    loading.value = false
  }
}

const handleFileSelect = (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  
  uploadError.value = ''
  
  if (!file) return
  
  // Validate file type
  if (!file.type.startsWith('image/')) {
    uploadError.value = 'Please select an image file'
    return
  }
  
  // Validate file size (max 5MB)
  if (file.size > 5 * 1024 * 1024) {
    uploadError.value = 'File size must be less than 5MB'
    return
  }
  
  selectedFile.value = file
  photoToRemove.value = false
  
  // Create preview
  const reader = new FileReader()
  reader.onload = (e) => {
    photoPreview.value = e.target?.result as string
  }
  reader.readAsDataURL(file)
}

const removePhoto = () => {
  photoToRemove.value = true
  selectedFile.value = null
  photoPreview.value = null
}

const uploadPhoto = async (dogId: string): Promise<string | null> => {
  if (!selectedFile.value) return null
  
  try {
    const fileExt = selectedFile.value.name.split('.').pop()
    const fileName = `${dogId}_${Date.now()}.${fileExt}`
    const filePath = `dogs/${fileName}`
    
    const { data, error: uploadError } = await supabase.storage
      .from('doghealthy')
      .upload(filePath, selectedFile.value, {
        cacheControl: '3600',
        upsert: false
      })
    
    if (uploadError) {
      console.error('Upload error:', uploadError)
      throw uploadError
    }
    
    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('doghealthy')
      .getPublicUrl(filePath)
    
    return publicUrl
  } catch (err) {
    console.error('Error uploading photo:', err)
    throw err
  }
}

const deleteOldPhoto = async (photoUrl: string) => {
  try {
    // Extract file path from URL
    const url = new URL(photoUrl)
    const pathParts = url.pathname.split('/')
    const filePath = pathParts.slice(pathParts.indexOf('dogs')).join('/')
    
    await supabase.storage
      .from('doghealthy')
      .remove([filePath])
  } catch (err) {
    console.error('Error deleting old photo:', err)
    // Don't throw - this is not critical
  }
}

const handleSubmit = async () => {
  if (!dog.value) return
  
  error.value = ''
  success.value = false
  saving.value = true
  
  try {
    let newPhotoUrl = dog.value.photo_url
    
    // Handle photo upload
    if (selectedFile.value) {
      // Delete old photo if exists
      if (dog.value.photo_url) {
        await deleteOldPhoto(dog.value.photo_url)
      }
      
      // Upload new photo
      newPhotoUrl = await uploadPhoto(dog.value.id)
    } else if (photoToRemove.value && dog.value.photo_url) {
      // Delete photo if user clicked remove
      await deleteOldPhoto(dog.value.photo_url)
      newPhotoUrl = null
    }
    
    // Update dog record
    const updateData = {
      name: form.value.name,
      breed: form.value.breed || null,
      birth_date: form.value.birthDate || null,
      gender: form.value.gender || null,
      weight_kg: form.value.weight || null,
      microchip_number: form.value.microchipNumber || null,
      notes: form.value.notes || null,
      photo_url: newPhotoUrl
    }
    
    const { error: updateError } = await supabase
      .from('doghealthy_dogs')
      .update(updateData)
      .eq('id', dog.value.id)
      .eq('user_id', authStore.userId)
    
    if (updateError) {
      console.error('Update error:', updateError)
      throw updateError
    }
    
    success.value = true
    
    // Update local dog data
    dog.value = { ...dog.value, ...updateData }
    
    // Redirect after a short delay
    setTimeout(() => {
      router.push(`/dogs/${dog.value?.id}`)
    }, 1500)
  } catch (err: any) {
    console.error('Error updating dog:', err)
    error.value = err.message || 'Failed to update dog. Please try again.'
  } finally {
    saving.value = false
  }
}

const confirmDelete = () => {
  showDeleteModal.value = true
}

const handleDelete = async () => {
  if (!dog.value) return
  
  try {
    saving.value = true
    
    // Delete photo if exists
    if (dog.value.photo_url) {
      await deleteOldPhoto(dog.value.photo_url)
    }
    
    // Delete dog record (cascading deletes will handle related records)
    const { error: deleteError } = await supabase
      .from('doghealthy_dogs')
      .delete()
      .eq('id', dog.value.id)
      .eq('user_id', authStore.userId)
    
    if (deleteError) {
      console.error('Delete error:', deleteError)
      throw deleteError
    }
    
    // Redirect to dogs list
    router.push('/dogs')
  } catch (err: any) {
    console.error('Error deleting dog:', err)
    error.value = err.message || 'Failed to delete dog'
    showDeleteModal.value = false
    saving.value = false
  }
}

onMounted(async () => {
  console.log('[Edit Page] Component mounted')
  console.log('[Edit Page] Auth loading:', authStore.loading)
  console.log('[Edit Page] Authenticated:', authStore.isAuthenticated)
  console.log('[Edit Page] User:', authStore.user)
  
  // Wait a bit for auth to initialize if it's still loading
  if (authStore.loading) {
    console.log('[Edit Page] Waiting for auth to initialize...')
    await new Promise(resolve => setTimeout(resolve, 1000))
  }
  
  console.log('[Edit Page] After wait - Authenticated:', authStore.isAuthenticated)
  
  if (!authStore.isAuthenticated) {
    console.log('[Edit Page] Not authenticated, redirecting to login')
    router.push('/auth/login')
    return
  }
  
  console.log('[Edit Page] Starting fetchDog')
  await fetchDog()
})
</script>

