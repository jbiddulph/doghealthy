<template>
  <div class="min-h-screen bg-gray-50 py-8">
    <div class="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
      <!-- Header -->
      <div class="mb-8">
        <NuxtLink
          to="/dogs"
          class="text-blue-600 hover:text-blue-700 font-medium mb-4 inline-flex items-center"
        >
          <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Dogs
        </NuxtLink>
        <h1 class="text-3xl font-bold text-gray-900 mt-4">Add New Dog</h1>
        <p class="text-gray-600 mt-2">Fill in your dog's information below</p>
      </div>

      <!-- Form -->
      <div class="bg-white rounded-lg shadow-md p-6">
        <form @submit.prevent="handleSubmit">
          <!-- Photo Upload -->
          <div class="mb-6">
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Dog Photo
            </label>
            <div class="flex items-center space-x-6">
              <div class="shrink-0">
                <img
                  v-if="photoPreview"
                  :src="photoPreview"
                  alt="Dog photo preview"
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
              <label class="cursor-pointer">
                <span class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors inline-block">
                  Choose Photo
                </span>
                <input
                  type="file"
                  ref="fileInput"
                  accept="image/*"
                  @change="handleFileSelect"
                  class="hidden"
                />
              </label>
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
              placeholder="Enter your dog's name"
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
              placeholder="e.g., Golden Retriever, Mixed Breed"
            />
          </div>

          <!-- Date of Birth -->
          <div class="mb-6">
            <label for="dateOfBirth" class="block text-sm font-medium text-gray-700 mb-2">
              Date of Birth
            </label>
            <input
              id="dateOfBirth"
              v-model="form.dateOfBirth"
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
              placeholder="e.g., 25.5"
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
              placeholder="Enter microchip number"
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
              placeholder="Any additional information about your dog..."
            ></textarea>
          </div>

          <!-- Error Message -->
          <div v-if="error" class="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p class="text-red-800">{{ error }}</p>
          </div>

          <!-- Success Message -->
          <div v-if="success" class="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
            <p class="text-green-800">Dog added successfully!</p>
          </div>

          <!-- Submit Button -->
          <div class="flex justify-end space-x-4">
            <NuxtLink
              to="/dogs"
              class="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </NuxtLink>
            <button
              type="submit"
              :disabled="loading"
              class="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span v-if="loading">Saving...</span>
              <span v-else>Add Dog</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const supabase = useSupabase()
const router = useRouter()
const authStore = useAuthStore()

const form = ref({
  name: '',
  breed: '',
  dateOfBirth: '',
  gender: '',
  weight: null,
  microchipNumber: '',
  notes: ''
})

const selectedFile = ref<File | null>(null)
const photoPreview = ref<string | null>(null)
const uploadError = ref('')
const error = ref('')
const success = ref(false)
const loading = ref(false)
const fileInput = ref<HTMLInputElement | null>(null)

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
  
  // Create preview
  const reader = new FileReader()
  reader.onload = (e) => {
    photoPreview.value = e.target?.result as string
  }
  reader.readAsDataURL(file)
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

const handleSubmit = async () => {
  if (!authStore.userId) {
    error.value = 'You must be logged in to add a dog'
    return
  }
  
  error.value = ''
  success.value = false
  loading.value = true
  
  try {
    // Insert dog record
    const dogData = {
      user_id: authStore.userId,
      name: form.value.name,
      breed: form.value.breed || null,
      birth_date: form.value.dateOfBirth || null,
      gender: form.value.gender || null,
      weight_kg: form.value.weight || null,
      microchip_number: form.value.microchipNumber || null,
      notes: form.value.notes || null
    }
    
    const { data: dog, error: insertError } = await supabase
      .from('doghealthy_dogs')
      .insert(dogData)
      .select()
      .single()
    
    if (insertError) {
      console.error('Insert error:', insertError)
      throw insertError
    }
    
    // Upload photo if selected
    let photoUrl = null
    if (selectedFile.value && dog) {
      try {
        photoUrl = await uploadPhoto(dog.id)
        
        // Update dog record with photo URL
        if (photoUrl) {
          const { error: updateError } = await supabase
            .from('doghealthy_dogs')
            .update({ photo_url: photoUrl })
            .eq('id', dog.id)
          
          if (updateError) {
            console.error('Error updating photo URL:', updateError)
          }
        }
      } catch (uploadErr) {
        console.error('Photo upload failed, but dog was created:', uploadErr)
        // Don't fail the whole operation if photo upload fails
        uploadError.value = 'Dog added, but photo upload failed. You can add a photo later.'
      }
    }
    
    success.value = true
    
    // Redirect to dogs list after a short delay
    setTimeout(() => {
      router.push('/dogs')
    }, 1500)
  } catch (err: any) {
    console.error('Error adding dog:', err)
    error.value = err.message || 'Failed to add dog. Please try again.'
  } finally {
    loading.value = false
  }
}

// Redirect if not authenticated
onMounted(() => {
  if (!authStore.isAuthenticated) {
    router.push('/auth/login')
  }
})
</script>

