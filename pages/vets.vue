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
      <!-- Header -->
      <div class="mb-8 flex justify-between items-center">
        <div>
          <h1 class="text-3xl font-bold text-gray-900">Veterinarians</h1>
          <p class="text-gray-600 mt-2">Manage vet contacts for all your dogs</p>
        </div>
        <button
          @click="showAddModal = true"
          class="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors inline-flex items-center"
        >
          <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Add Vet
        </button>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="text-center py-12">
        <div class="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <p class="mt-4 text-gray-600">Loading vets...</p>
      </div>

      <!-- Vets List -->
      <div v-else-if="vets.length > 0" class="grid md:grid-cols-2 gap-6">
        <div
          v-for="vet in vets"
          :key="vet.id"
          class="bg-white rounded-lg shadow-md p-6"
        >
          <div class="flex justify-between items-start mb-4">
            <div class="flex items-start">
              <div class="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center text-2xl mr-4">
                🏥
              </div>
              <div>
                <h3 class="text-xl font-semibold text-gray-900">{{ vet.name }}</h3>
                <p v-if="vet.clinic_name" class="text-gray-600">{{ vet.clinic_name }}</p>
                <span
                  v-if="vet.is_primary"
                  class="inline-block mt-1 px-2 py-1 bg-blue-100 text-blue-800 text-xs font-semibold rounded"
                >
                  Primary Vet
                </span>
              </div>
            </div>
            <div class="flex space-x-2">
              <button @click="editVet(vet)" class="text-blue-600 hover:text-blue-700 p-2" title="Edit">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </button>
              <button @click="confirmDelete(vet)" class="text-red-600 hover:text-red-700 p-2" title="Delete">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          </div>

          <div class="space-y-3 text-sm">
            <div v-if="vet.phone" class="flex items-start">
              <svg class="w-5 h-5 text-gray-400 mr-3 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
              <a :href="`tel:${vet.phone}`" class="text-blue-600 hover:underline">{{ vet.phone }}</a>
            </div>

            <div v-if="vet.email" class="flex items-start">
              <svg class="w-5 h-5 text-gray-400 mr-3 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              <a :href="`mailto:${vet.email}`" class="text-blue-600 hover:underline">{{ vet.email }}</a>
            </div>

            <div v-if="vet.address" class="flex items-start">
              <svg class="w-5 h-5 text-gray-400 mr-3 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <p class="text-gray-700">{{ vet.address }}</p>
            </div>

            <div v-if="vet.website" class="flex items-start">
              <svg class="w-5 h-5 text-gray-400 mr-3 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
              </svg>
              <a :href="vet.website" target="_blank" rel="noopener noreferrer" class="text-blue-600 hover:underline">{{ vet.website }}</a>
            </div>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div v-else class="bg-white rounded-lg shadow-md p-12 text-center">
        <div class="text-6xl mb-4">🏥</div>
        <h3 class="text-xl font-semibold text-gray-900 mb-2">No Vets Added Yet</h3>
        <p class="text-gray-600 mb-6">Add your veterinarian's contact information to keep everything organized</p>
        <button
          @click="showAddModal = true"
          class="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
        >
          Add Your First Vet
        </button>
      </div>
    </div>
  </div>

  <!-- Add/Edit Modal -->
  <div v-if="showAddModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
    <div class="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
      <div class="p-6">
        <div class="flex justify-between items-center mb-6">
          <h2 class="text-2xl font-bold text-gray-900">
            {{ editingVet ? 'Edit Veterinarian' : 'Add Veterinarian' }}
          </h2>
          <button @click="closeModal" class="text-gray-400 hover:text-gray-600">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form @submit.prevent="saveVet">
          <div class="space-y-4">
            <div>
              <label for="name" class="block text-sm font-medium text-gray-700 mb-2">Veterinarian Name *</label>
              <input id="name" v-model="form.name" type="text" required class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" placeholder="Dr. Smith" />
            </div>
            <div>
              <label for="clinic_name" class="block text-sm font-medium text-gray-700 mb-2">Clinic Name</label>
              <input id="clinic_name" v-model="form.clinic_name" type="text" class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" placeholder="Happy Paws Veterinary Clinic" />
            </div>
            <div>
              <label for="phone" class="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
              <input id="phone" v-model="form.phone" type="tel" class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" placeholder="+44 20 7946 0958" />
            </div>
            <div>
              <label for="email" class="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
              <input id="email" v-model="form.email" type="email" class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" placeholder="contact@happypaws.com" />
            </div>
            <div>
              <label for="address" class="block text-sm font-medium text-gray-700 mb-2">Address</label>
              <textarea id="address" v-model="form.address" rows="2" class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" placeholder="123 Main St, City, Postcode"></textarea>
            </div>
            <div>
              <label for="website" class="block text-sm font-medium text-gray-700 mb-2">Website</label>
              <input id="website" v-model="form.website" type="url" class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" placeholder="https://www.example.com" />
            </div>
            <div class="flex items-center">
              <input id="is_primary" v-model="form.is_primary" type="checkbox" class="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500" />
              <label for="is_primary" class="ml-2 text-sm font-medium text-gray-700">Set as primary veterinarian</label>
            </div>
          </div>

          <div v-if="formError" class="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p class="text-red-800">{{ formError }}</p>
          </div>

          <div class="mt-6 flex justify-end space-x-4">
            <button type="button" @click="closeModal" class="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors">Cancel</button>
            <button type="submit" :disabled="saving" class="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50">{{ saving ? 'Saving...' : (editingVet ? 'Update' : 'Add') }}</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const supabase = useSupabase()
const authStore = useAuthStore()

// SEO Meta tags
useHead({
  title: 'Veterinarians - Manage Vet Contacts | DogHealthy',
  meta: [
    { 
      name: 'description', 
      content: 'Manage your veterinarian contacts and clinic information. Keep all your vet details organized for quick access when needed.' 
    },
    { name: 'robots', content: 'noindex, nofollow' }, // Don't index personal pages
    { property: 'og:title', content: 'Veterinarians - Manage Vet Contacts | DogHealthy' },
    { property: 'og:description', content: 'Manage your veterinarian contacts and clinic information. Keep all your vet details organized.' },
    { property: 'og:type', content: 'website' }
  ]
})

interface Vet {
  id: string
  user_id: string
  name: string
  clinic_name: string | null
  phone: string | null
  email: string | null
  address: string | null
  website: string | null
  notes: string | null
  is_primary: boolean
  created_at: string
}

const vets = ref<Vet[]>([])
const loading = ref(true)
const showAddModal = ref(false)
const showDeleteModal = ref(false)
const editingVet = ref<Vet | null>(null)
const vetToDelete = ref<Vet | null>(null)
const saving = ref(false)
const deleting = ref(false)
const formError = ref('')

const form = ref({
  name: '',
  clinic_name: '',
  phone: '',
  email: '',
  address: '',
  website: '',
  notes: '',
  is_primary: false
})

const fetchVets = async () => {
  try {
    loading.value = true
    const { data, error } = await supabase
      .from('doghealthy_vets')
      .select('*')
      .eq('user_id', authStore.userId)
      .order('is_primary', { ascending: false })
      .order('name')

    if (error) throw error
    vets.value = data || []
  } catch (err) {
    console.error('Error fetching vets:', err)
  } finally {
    loading.value = false
  }
}

const editVet = (vet: Vet) => {
  editingVet.value = vet
  form.value = {
    name: vet.name,
    clinic_name: vet.clinic_name || '',
    phone: vet.phone || '',
    email: vet.email || '',
    address: vet.address || '',
    website: vet.website || '',
    notes: vet.notes || '',
    is_primary: vet.is_primary
  }
  showAddModal.value = true
}

const closeModal = () => {
  showAddModal.value = false
  editingVet.value = null
  form.value = {
    name: '',
    clinic_name: '',
    phone: '',
    email: '',
    address: '',
    website: '',
    notes: '',
    is_primary: false
  }
  formError.value = ''
}

const saveVet = async () => {
  try {
    saving.value = true
    formError.value = ''

    const vetData = {
      user_id: authStore.userId,
      name: form.value.name,
      clinic_name: form.value.clinic_name || null,
      phone: form.value.phone || null,
      email: form.value.email || null,
      address: form.value.address || null,
      website: form.value.website || null,
      notes: form.value.notes || null,
      is_primary: form.value.is_primary
    }

    if (editingVet.value) {
      const { error } = await supabase
        .from('doghealthy_vets')
        .update(vetData)
        .eq('id', editingVet.value.id)
      if (error) throw error
    } else {
      const { error } = await supabase
        .from('doghealthy_vets')
        .insert(vetData)
      if (error) throw error
    }

    await fetchVets()
    closeModal()
  } catch (err: any) {
    console.error('Error saving vet:', err)
    formError.value = err.message || 'Failed to save vet'
  } finally {
    saving.value = false
  }
}

const confirmDelete = (vet: Vet) => {
  vetToDelete.value = vet
  showDeleteModal.value = true
}

const deleteVet = async () => {
  if (!vetToDelete.value) return
  try {
    deleting.value = true
    const { error } = await supabase
      .from('doghealthy_vets')
      .delete()
      .eq('id', vetToDelete.value.id)
    if (error) throw error
    await fetchVets()
    showDeleteModal.value = false
    vetToDelete.value = null
  } catch (err) {
    console.error('Error deleting vet:', err)
  } finally {
    deleting.value = false
  }
}

onMounted(() => {
  fetchVets()
})
</script>


