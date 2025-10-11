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
            <select
              id="breed"
              v-model="form.breedSelection"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Select a breed...</option>
              <option value="Affenpinscher">Affenpinscher</option>
              <option value="Afghan Hound">Afghan Hound</option>
              <option value="Airedale Terrier">Airedale Terrier</option>
              <option value="Akita">Akita</option>
              <option value="Alaskan Malamute">Alaskan Malamute</option>
              <option value="American Bulldog">American Bulldog</option>
              <option value="American Eskimo Dog">American Eskimo Dog</option>
              <option value="American Staffordshire Terrier">American Staffordshire Terrier</option>
              <option value="Australian Cattle Dog">Australian Cattle Dog</option>
              <option value="Australian Shepherd">Australian Shepherd</option>
              <option value="Australian Terrier">Australian Terrier</option>
              <option value="Basenji">Basenji</option>
              <option value="Basset Hound">Basset Hound</option>
              <option value="Beagle">Beagle</option>
              <option value="Bearded Collie">Bearded Collie</option>
              <option value="Bedlington Terrier">Bedlington Terrier</option>
              <option value="Belgian Malinois">Belgian Malinois</option>
              <option value="Belgian Sheepdog">Belgian Sheepdog</option>
              <option value="Belgian Tervuren">Belgian Tervuren</option>
              <option value="Bernese Mountain Dog">Bernese Mountain Dog</option>
              <option value="Bichon Frise">Bichon Frise</option>
              <option value="Bloodhound">Bloodhound</option>
              <option value="Border Collie">Border Collie</option>
              <option value="Border Terrier">Border Terrier</option>
              <option value="Borzoi">Borzoi</option>
              <option value="Boston Terrier">Boston Terrier</option>
              <option value="Bouvier des Flandres">Bouvier des Flandres</option>
              <option value="Boxer">Boxer</option>
              <option value="Briard">Briard</option>
              <option value="Brittany">Brittany</option>
              <option value="Brussels Griffon">Brussels Griffon</option>
              <option value="Bull Terrier">Bull Terrier</option>
              <option value="Bulldog">Bulldog</option>
              <option value="Bullmastiff">Bullmastiff</option>
              <option value="Cairn Terrier">Cairn Terrier</option>
              <option value="Canaan Dog">Canaan Dog</option>
              <option value="Cane Corso">Cane Corso</option>
              <option value="Cardigan Welsh Corgi">Cardigan Welsh Corgi</option>
              <option value="Cavalier King Charles Spaniel">Cavalier King Charles Spaniel</option>
              <option value="Chesapeake Bay Retriever">Chesapeake Bay Retriever</option>
              <option value="Chihuahua">Chihuahua</option>
              <option value="Chinese Crested">Chinese Crested</option>
              <option value="Chinese Shar-Pei">Chinese Shar-Pei</option>
              <option value="Chow Chow">Chow Chow</option>
              <option value="Clumber Spaniel">Clumber Spaniel</option>
              <option value="Cocker Spaniel">Cocker Spaniel</option>
              <option value="Collie">Collie</option>
              <option value="Coton de Tulear">Coton de Tulear</option>
              <option value="Dachshund">Dachshund</option>
              <option value="Dalmatian">Dalmatian</option>
              <option value="Doberman Pinscher">Doberman Pinscher</option>
              <option value="Dogo Argentino">Dogo Argentino</option>
              <option value="English Cocker Spaniel">English Cocker Spaniel</option>
              <option value="English Setter">English Setter</option>
              <option value="English Springer Spaniel">English Springer Spaniel</option>
              <option value="English Toy Spaniel">English Toy Spaniel</option>
              <option value="Finnish Spitz">Finnish Spitz</option>
              <option value="Flat-Coated Retriever">Flat-Coated Retriever</option>
              <option value="French Bulldog">French Bulldog</option>
              <option value="German Pinscher">German Pinscher</option>
              <option value="German Shepherd">German Shepherd</option>
              <option value="German Shorthaired Pointer">German Shorthaired Pointer</option>
              <option value="German Wirehaired Pointer">German Wirehaired Pointer</option>
              <option value="Giant Schnauzer">Giant Schnauzer</option>
              <option value="Golden Retriever">Golden Retriever</option>
              <option value="Gordon Setter">Gordon Setter</option>
              <option value="Great Dane">Great Dane</option>
              <option value="Great Pyrenees">Great Pyrenees</option>
              <option value="Greater Swiss Mountain Dog">Greater Swiss Mountain Dog</option>
              <option value="Greyhound">Greyhound</option>
              <option value="Havanese">Havanese</option>
              <option value="Ibizan Hound">Ibizan Hound</option>
              <option value="Irish Setter">Irish Setter</option>
              <option value="Irish Terrier">Irish Terrier</option>
              <option value="Irish Water Spaniel">Irish Water Spaniel</option>
              <option value="Irish Wolfhound">Irish Wolfhound</option>
              <option value="Italian Greyhound">Italian Greyhound</option>
              <option value="Jack Russell Terrier">Jack Russell Terrier</option>
              <option value="Japanese Chin">Japanese Chin</option>
              <option value="Keeshond">Keeshond</option>
              <option value="Kerry Blue Terrier">Kerry Blue Terrier</option>
              <option value="Komondor">Komondor</option>
              <option value="Kuvasz">Kuvasz</option>
              <option value="Labrador Retriever">Labrador Retriever</option>
              <option value="Lakeland Terrier">Lakeland Terrier</option>
              <option value="Leonberger">Leonberger</option>
              <option value="Lhasa Apso">Lhasa Apso</option>
              <option value="Maltese">Maltese</option>
              <option value="Manchester Terrier">Manchester Terrier</option>
              <option value="Mastiff">Mastiff</option>
              <option value="Miniature Pinscher">Miniature Pinscher</option>
              <option value="Miniature Schnauzer">Miniature Schnauzer</option>
              <option value="Mixed Breed">Mixed Breed</option>
              <option value="Newfoundland">Newfoundland</option>
              <option value="Norfolk Terrier">Norfolk Terrier</option>
              <option value="Norwegian Elkhound">Norwegian Elkhound</option>
              <option value="Norwich Terrier">Norwich Terrier</option>
              <option value="Nova Scotia Duck Tolling Retriever">Nova Scotia Duck Tolling Retriever</option>
              <option value="Old English Sheepdog">Old English Sheepdog</option>
              <option value="Papillon">Papillon</option>
              <option value="Parson Russell Terrier">Parson Russell Terrier</option>
              <option value="Pekingese">Pekingese</option>
              <option value="Pembroke Welsh Corgi">Pembroke Welsh Corgi</option>
              <option value="Pharaoh Hound">Pharaoh Hound</option>
              <option value="Pointer">Pointer</option>
              <option value="Pomeranian">Pomeranian</option>
              <option value="Poodle (Standard)">Poodle (Standard)</option>
              <option value="Poodle (Miniature)">Poodle (Miniature)</option>
              <option value="Poodle (Toy)">Poodle (Toy)</option>
              <option value="Portuguese Water Dog">Portuguese Water Dog</option>
              <option value="Pug">Pug</option>
              <option value="Puli">Puli</option>
              <option value="Rhodesian Ridgeback">Rhodesian Ridgeback</option>
              <option value="Rottweiler">Rottweiler</option>
              <option value="Saint Bernard">Saint Bernard</option>
              <option value="Saluki">Saluki</option>
              <option value="Samoyed">Samoyed</option>
              <option value="Schipperke">Schipperke</option>
              <option value="Scottish Deerhound">Scottish Deerhound</option>
              <option value="Scottish Terrier">Scottish Terrier</option>
              <option value="Shetland Sheepdog">Shetland Sheepdog</option>
              <option value="Shiba Inu">Shiba Inu</option>
              <option value="Shih Tzu">Shih Tzu</option>
              <option value="Siberian Husky">Siberian Husky</option>
              <option value="Silky Terrier">Silky Terrier</option>
              <option value="Smooth Fox Terrier">Smooth Fox Terrier</option>
              <option value="Soft Coated Wheaten Terrier">Soft Coated Wheaten Terrier</option>
              <option value="Staffordshire Bull Terrier">Staffordshire Bull Terrier</option>
              <option value="Standard Schnauzer">Standard Schnauzer</option>
              <option value="Sussex Spaniel">Sussex Spaniel</option>
              <option value="Tibetan Mastiff">Tibetan Mastiff</option>
              <option value="Tibetan Spaniel">Tibetan Spaniel</option>
              <option value="Tibetan Terrier">Tibetan Terrier</option>
              <option value="Vizsla">Vizsla</option>
              <option value="Weimaraner">Weimaraner</option>
              <option value="Welsh Springer Spaniel">Welsh Springer Spaniel</option>
              <option value="Welsh Terrier">Welsh Terrier</option>
              <option value="West Highland White Terrier">West Highland White Terrier</option>
              <option value="Whippet">Whippet</option>
              <option value="Wire Fox Terrier">Wire Fox Terrier</option>
              <option value="Wirehaired Pointing Griffon">Wirehaired Pointing Griffon</option>
              <option value="Yorkshire Terrier">Yorkshire Terrier</option>
              <option value="Other">Other</option>
            </select>
            
            <!-- Custom breed input (shown when "Other" is selected) -->
            <input
              v-if="form.breedSelection === 'Other'"
              v-model="form.customBreed"
              type="text"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent mt-3"
              placeholder="Enter your dog's breed"
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
  breedSelection: '',
  customBreed: '',
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
    // Determine the breed value
    const breedValue = form.value.breedSelection === 'Other' 
      ? form.value.customBreed 
      : form.value.breedSelection
    
    // Insert dog record
    const dogData = {
      user_id: authStore.userId,
      name: form.value.name,
      breed: breedValue || null,
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

