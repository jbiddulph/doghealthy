<template>
  <div class="min-h-screen bg-gray-50 py-8">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <!-- Back Button -->
      <NuxtLink
        :to="`/dogs/${dogId}`"
        class="text-blue-600 hover:text-blue-700 font-medium mb-6 inline-flex items-center"
      >
        <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
        Back to {{ dogName || 'Dog' }}
      </NuxtLink>

      <!-- Header -->
      <div class="mb-8 flex justify-between items-center">
        <div>
          <h1 class="text-3xl font-bold text-gray-900">Vaccinations</h1>
          <p class="text-gray-600 mt-2">Track vaccination history for {{ dogName }}</p>
        </div>
        <button
          @click="showAddModal = true"
          class="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors inline-flex items-center"
        >
          <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Add Vaccination
        </button>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="text-center py-12">
        <div class="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <p class="mt-4 text-gray-600">Loading vaccinations...</p>
      </div>

      <!-- Vaccinations List -->
      <div v-else-if="vaccinations.length > 0" class="space-y-4">
        <div
          v-for="vaccination in vaccinations"
          :key="vaccination.id"
          class="bg-white rounded-lg shadow-md p-6"
        >
          <div class="flex justify-between items-start">
            <div class="flex-1">
              <div class="flex items-start justify-between mb-4">
                <div class="flex items-start">
                  <div class="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center text-2xl mr-4">
                    💉
                  </div>
                  <div>
                    <h3 class="text-xl font-semibold text-gray-900">{{ vaccination.vaccine_name }}</h3>
                    <p class="text-sm text-gray-500 mt-1">Given on {{ formatDate(vaccination.administered_date) }}</p>
                    <span
                      v-if="isDue(vaccination.next_due_date)"
                      class="inline-block mt-2 px-2 py-1 bg-red-100 text-red-800 text-xs font-semibold rounded"
                    >
                      Due {{ formatDate(vaccination.next_due_date) }}
                    </span>
                    <span
                      v-else-if="vaccination.next_due_date"
                      class="inline-block mt-2 px-2 py-1 bg-green-100 text-green-800 text-xs font-semibold rounded"
                    >
                      Next due {{ formatDate(vaccination.next_due_date) }}
                    </span>
                  </div>
                </div>
                <div class="flex space-x-2 ml-4">
                  <button
                    @click="editVaccination(vaccination)"
                    class="text-blue-600 hover:text-blue-700 p-2"
                    title="Edit"
                  >
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                  <button
                    @click="confirmDelete(vaccination)"
                    class="text-red-600 hover:text-red-700 p-2"
                    title="Delete"
                  >
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>

              <div class="grid md:grid-cols-3 gap-4 text-sm">
                <div v-if="vaccination.batch_number">
                  <p class="text-gray-500">Batch Number</p>
                  <p class="text-gray-900 font-mono">{{ vaccination.batch_number }}</p>
                </div>

                <div v-if="vaccination.vet_name">
                  <p class="text-gray-500">Administered By</p>
                  <p class="text-gray-900">{{ vaccination.vet_name }}</p>
                </div>

                <div v-if="vaccination.cost">
                  <p class="text-gray-500">Cost</p>
                  <p class="text-gray-900">${{ vaccination.cost }}</p>
                </div>
              </div>

              <div v-if="vaccination.notes" class="mt-4 pt-4 border-t border-gray-200">
                <p class="text-sm font-medium text-gray-500 mb-2">Notes</p>
                <p class="text-gray-700 text-sm">{{ vaccination.notes }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div v-else class="bg-white rounded-lg shadow-md p-12 text-center">
        <div class="text-6xl mb-4">💉</div>
        <h3 class="text-xl font-semibold text-gray-900 mb-2">No Vaccinations Yet</h3>
        <p class="text-gray-600 mb-6">Start tracking {{ dogName }}'s vaccination history</p>
        <button
          @click="showAddModal = true"
          class="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
        >
          Add First Vaccination
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
            {{ editingVaccination ? 'Edit Vaccination' : 'Add Vaccination' }}
          </h2>
          <button
            @click="closeModal"
            class="text-gray-400 hover:text-gray-600"
          >
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form @submit.prevent="saveVaccination">
          <div class="space-y-4">
            <div>
              <label for="vaccine_name" class="block text-sm font-medium text-gray-700 mb-2">
                Vaccine Name *
              </label>
              <input
                id="vaccine_name"
                v-model="form.vaccine_name"
                type="text"
                required
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="e.g., Rabies, DHPP, Bordetella"
              />
            </div>

            <div class="grid md:grid-cols-2 gap-4">
              <div>
                <label for="administered_date" class="block text-sm font-medium text-gray-700 mb-2">
                  Date Administered *
                </label>
                <input
                  id="administered_date"
                  v-model="form.administered_date"
                  type="date"
                  required
                  class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label for="next_due_date" class="block text-sm font-medium text-gray-700 mb-2">
                  Next Due Date
                </label>
                <input
                  id="next_due_date"
                  v-model="form.next_due_date"
                  type="date"
                  class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <label for="batch_number" class="block text-sm font-medium text-gray-700 mb-2">
                Batch/Lot Number
              </label>
              <input
                id="batch_number"
                v-model="form.batch_number"
                type="text"
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter batch or lot number"
              />
            </div>

            <div>
              <label for="vet_id" class="block text-sm font-medium text-gray-700 mb-2">
                Veterinarian
              </label>
              <select
                id="vet_id"
                v-model="form.vet_id"
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Select a vet...</option>
                <option v-for="vet in vets" :key="vet.id" :value="vet.id">
                  {{ vet.name }}{{ vet.clinic_name ? ` - ${vet.clinic_name}` : '' }}
                </option>
              </select>
              <p class="text-sm text-gray-500 mt-1">
                <NuxtLink :to="`/dogs/${dogId}/vets`" class="text-blue-600 hover:underline">
                  Manage vets
                </NuxtLink>
              </p>
            </div>

            <div>
              <label for="cost" class="block text-sm font-medium text-gray-700 mb-2">
                Cost ($)
              </label>
              <input
                id="cost"
                v-model.number="form.cost"
                type="number"
                step="0.01"
                min="0"
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="0.00"
              />
            </div>

            <div>
              <label for="notes" class="block text-sm font-medium text-gray-700 mb-2">
                Notes
              </label>
              <textarea
                id="notes"
                v-model="form.notes"
                rows="3"
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Any reactions or additional information..."
              ></textarea>
            </div>
          </div>

          <div v-if="formError" class="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p class="text-red-800">{{ formError }}</p>
          </div>

          <div class="mt-6 flex justify-end space-x-4">
            <button
              type="button"
              @click="closeModal"
              class="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              :disabled="saving"
              class="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {{ saving ? 'Saving...' : (editingVaccination ? 'Update' : 'Add') }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>

  <!-- Delete Confirmation Modal -->
  <div v-if="showDeleteModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
    <div class="bg-white rounded-lg max-w-md w-full p-6">
      <h3 class="text-xl font-bold text-gray-900 mb-4">Delete Vaccination</h3>
      <p class="text-gray-600 mb-6">Are you sure you want to delete this vaccination record? This action cannot be undone.</p>
      <div class="flex justify-end space-x-4">
        <button
          @click="showDeleteModal = false"
          class="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
        >
          Cancel
        </button>
        <button
          @click="deleteVaccination"
          :disabled="deleting"
          class="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
        >
          {{ deleting ? 'Deleting...' : 'Delete' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const route = useRoute()
const supabase = useSupabase()
const authStore = useAuthStore()

const dogId = route.params.id as string
const dogName = ref('')

interface Vaccination {
  id: string
  dog_id: string
  user_id: string
  vaccine_name: string
  administered_date: string
  next_due_date: string | null
  batch_number: string | null
  vet_id: string | null
  vet_name: string | null
  cost: number | null
  notes: string | null
  created_at: string
}

interface Vet {
  id: string
  name: string
  clinic_name: string | null
}

const vaccinations = ref<Vaccination[]>([])
const vets = ref<Vet[]>([])
const loading = ref(true)
const showAddModal = ref(false)
const showDeleteModal = ref(false)
const editingVaccination = ref<Vaccination | null>(null)
const vaccinationToDelete = ref<Vaccination | null>(null)
const saving = ref(false)
const deleting = ref(false)
const formError = ref('')

const form = ref({
  vaccine_name: '',
  administered_date: '',
  next_due_date: '',
  batch_number: '',
  vet_id: '',
  cost: null as number | null,
  notes: ''
})

const fetchDogName = async () => {
  const { data } = await supabase
    .from('doghealthy_dogs')
    .select('name')
    .eq('id', dogId)
    .single()
  if (data) dogName.value = data.name
}

const fetchVets = async () => {
  const { data } = await supabase
    .from('doghealthy_vets')
    .select('id, name, clinic_name')
    .eq('user_id', authStore.userId)
    .order('is_primary', { ascending: false })
    .order('name')

  if (data) vets.value = data
}

const fetchVaccinations = async () => {
  try {
    loading.value = true
    const { data, error } = await supabase
      .from('doghealthy_vaccinations')
      .select(`
        *,
        vet:vet_id (
          name
        )
      `)
      .eq('dog_id', dogId)
      .order('administered_date', { ascending: false })

    if (error) throw error
    
    vaccinations.value = (data || []).map(vaccination => ({
      ...vaccination,
      vet_name: vaccination.vet?.name || null
    }))
  } catch (err: any) {
    console.error('Error fetching vaccinations:', err)
  } finally {
    loading.value = false
  }
}

const formatDate = (dateStr: string | null) => {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  return date.toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric' 
  })
}

const isDue = (dueDate: string | null) => {
  if (!dueDate) return false
  const today = new Date()
  const due = new Date(dueDate)
  return due <= today
}

const editVaccination = (vaccination: Vaccination) => {
  editingVaccination.value = vaccination
  form.value = {
    vaccine_name: vaccination.vaccine_name,
    administered_date: vaccination.administered_date,
    next_due_date: vaccination.next_due_date || '',
    batch_number: vaccination.batch_number || '',
    vet_id: vaccination.vet_id || '',
    cost: vaccination.cost,
    notes: vaccination.notes || ''
  }
  showAddModal.value = true
}

const closeModal = () => {
  showAddModal.value = false
  editingVaccination.value = null
  form.value = {
    vaccine_name: '',
    administered_date: '',
    next_due_date: '',
    batch_number: '',
    vet_id: '',
    cost: null,
    notes: ''
  }
  formError.value = ''
}

const saveVaccination = async () => {
  try {
    saving.value = true
    formError.value = ''

    const vaccinationData = {
      dog_id: dogId,
      user_id: authStore.userId,
      vaccine_name: form.value.vaccine_name,
      administered_date: form.value.administered_date,
      next_due_date: form.value.next_due_date || null,
      batch_number: form.value.batch_number || null,
      vet_id: form.value.vet_id || null,
      cost: form.value.cost,
      notes: form.value.notes || null
    }

    if (editingVaccination.value) {
      const { error } = await supabase
        .from('doghealthy_vaccinations')
        .update(vaccinationData)
        .eq('id', editingVaccination.value.id)
      
      if (error) throw error
    } else {
      const { error } = await supabase
        .from('doghealthy_vaccinations')
        .insert(vaccinationData)
      
      if (error) throw error
    }

    await fetchVaccinations()
    closeModal()
  } catch (err: any) {
    console.error('Error saving vaccination:', err)
    formError.value = err.message || 'Failed to save vaccination'
  } finally {
    saving.value = false
  }
}

const confirmDelete = (vaccination: Vaccination) => {
  vaccinationToDelete.value = vaccination
  showDeleteModal.value = true
}

const deleteVaccination = async () => {
  if (!vaccinationToDelete.value) return

  try {
    deleting.value = true
    const { error } = await supabase
      .from('doghealthy_vaccinations')
      .delete()
      .eq('id', vaccinationToDelete.value.id)

    if (error) throw error

    await fetchVaccinations()
    showDeleteModal.value = false
    vaccinationToDelete.value = null
  } catch (err: any) {
    console.error('Error deleting vaccination:', err)
    alert('Failed to delete vaccination')
  } finally {
    deleting.value = false
  }
}

onMounted(() => {
  fetchDogName()
  fetchVets()
  fetchVaccinations()
})
</script>

