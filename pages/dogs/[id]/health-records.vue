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
          <h1 class="text-3xl font-bold text-gray-900">Health Records</h1>
          <p class="text-gray-600 mt-2">Track medical history and diagnoses for {{ dogName }}</p>
        </div>
        <button
          @click="showAddModal = true"
          class="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors inline-flex items-center"
        >
          <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Add Record
        </button>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="text-center py-12">
        <div class="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <p class="mt-4 text-gray-600">Loading health records...</p>
      </div>

      <!-- Records List -->
      <div v-else-if="records.length > 0" class="space-y-4">
        <div
          v-for="record in records"
          :key="record.id"
          class="bg-white rounded-lg shadow-md p-6"
        >
          <div class="flex justify-between items-start">
            <div class="flex-1">
              <div class="flex items-start justify-between mb-4">
                <div>
                  <h3 class="text-xl font-semibold text-gray-900">{{ record.title }}</h3>
                  <p class="text-sm text-gray-500 mt-1">{{ formatDate(record.visit_date || record.record_date) }}</p>
                </div>
                <div class="flex space-x-2 ml-4">
                  <button
                    @click="editRecord(record)"
                    class="text-blue-600 hover:text-blue-700 p-2"
                    title="Edit"
                  >
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                  <button
                    @click="confirmDelete(record)"
                    class="text-red-600 hover:text-red-700 p-2"
                    title="Delete"
                  >
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>

              <div class="grid md:grid-cols-2 gap-4 mb-4">
                <div v-if="record.diagnosis">
                  <p class="text-sm font-medium text-gray-500">Diagnosis</p>
                  <p class="text-gray-900">{{ record.diagnosis }}</p>
                </div>

                <div v-if="record.treatment">
                  <p class="text-sm font-medium text-gray-500">Treatment</p>
                  <p class="text-gray-900">{{ record.treatment }}</p>
                </div>

                <div v-if="record.vet_name">
                  <p class="text-sm font-medium text-gray-500">Veterinarian</p>
                  <p class="text-gray-900">{{ record.vet_name }}</p>
                </div>

                <div v-if="record.cost">
                  <p class="text-sm font-medium text-gray-500">Cost</p>
                  <p class="text-gray-900">${{ record.cost }}</p>
                </div>
              </div>

              <div v-if="record.notes" class="mt-4 pt-4 border-t border-gray-200">
                <p class="text-sm font-medium text-gray-500 mb-2">Notes</p>
                <p class="text-gray-700 whitespace-pre-wrap">{{ record.notes }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div v-else class="bg-white rounded-lg shadow-md p-12 text-center">
        <div class="text-6xl mb-4">📋</div>
        <h3 class="text-xl font-semibold text-gray-900 mb-2">No Health Records Yet</h3>
        <p class="text-gray-600 mb-6">Start tracking {{ dogName }}'s medical history</p>
        <button
          @click="showAddModal = true"
          class="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
        >
          Add First Health Record
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
            {{ editingRecord ? 'Edit Health Record' : 'Add Health Record' }}
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

        <form @submit.prevent="saveRecord">
          <div class="space-y-4">
            <div>
              <label for="title" class="block text-sm font-medium text-gray-700 mb-2">
                Title *
              </label>
              <input
                id="title"
                v-model="form.title"
                type="text"
                required
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="e.g., Annual Checkup, Ear Infection"
              />
            </div>

            <div>
              <label for="visit_date" class="block text-sm font-medium text-gray-700 mb-2">
                Visit Date *
              </label>
              <input
                id="visit_date"
                v-model="form.visit_date"
                type="date"
                required
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label for="diagnosis" class="block text-sm font-medium text-gray-700 mb-2">
                Diagnosis
              </label>
              <input
                id="diagnosis"
                v-model="form.diagnosis"
                type="text"
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="e.g., Ear infection, Healthy"
              />
            </div>

            <div>
              <label for="treatment" class="block text-sm font-medium text-gray-700 mb-2">
                Treatment
              </label>
              <input
                id="treatment"
                v-model="form.treatment"
                type="text"
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="e.g., Prescribed antibiotics"
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
                rows="4"
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Additional notes about the visit..."
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
              {{ saving ? 'Saving...' : (editingRecord ? 'Update' : 'Add') }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>

  <!-- Delete Confirmation Modal -->
  <div v-if="showDeleteModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
    <div class="bg-white rounded-lg max-w-md w-full p-6">
      <h3 class="text-xl font-bold text-gray-900 mb-4">Delete Health Record</h3>
      <p class="text-gray-600 mb-6">Are you sure you want to delete this health record? This action cannot be undone.</p>
      <div class="flex justify-end space-x-4">
        <button
          @click="showDeleteModal = false"
          class="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
        >
          Cancel
        </button>
        <button
          @click="deleteRecord"
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

interface HealthRecord {
  id: string
  dog_id: string
  user_id: string
  title: string
  record_date: string
  visit_date: string | null
  record_type: string
  diagnosis: string | null
  treatment: string | null
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

const records = ref<HealthRecord[]>([])
const vets = ref<Vet[]>([])
const loading = ref(true)
const showAddModal = ref(false)
const showDeleteModal = ref(false)
const editingRecord = ref<HealthRecord | null>(null)
const recordToDelete = ref<HealthRecord | null>(null)
const saving = ref(false)
const deleting = ref(false)
const formError = ref('')

const form = ref({
  title: '',
  visit_date: '',
  diagnosis: '',
  treatment: '',
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

const fetchRecords = async () => {
  try {
    loading.value = true
    
    // Try simple query first (without vet join)
    const { data, error } = await supabase
      .from('doghealthy_health_records')
      .select('*')
      .eq('dog_id', dogId)
      .order('record_date', { ascending: false })
    
    if (error) throw error
    
    // Transform data and set vet_name to null (will be populated later when vet_id column exists)
    records.value = (data || []).map(record => ({
      ...record,
      vet_name: null
    }))
  } catch (err: any) {
    console.error('Error fetching health records:', err)
  } finally {
    loading.value = false
  }
}

const formatDate = (dateStr: string) => {
  const date = new Date(dateStr)
  return date.toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  })
}

const editRecord = (record: HealthRecord) => {
  editingRecord.value = record
  form.value = {
    title: record.title,
    visit_date: record.visit_date || record.record_date,
    diagnosis: record.diagnosis || '',
    treatment: record.treatment || '',
    vet_id: record.vet_id || '',
    cost: record.cost,
    notes: record.notes || ''
  }
  showAddModal.value = true
}

const closeModal = () => {
  showAddModal.value = false
  editingRecord.value = null
  form.value = {
    title: '',
    visit_date: '',
    diagnosis: '',
    treatment: '',
    vet_id: '',
    cost: null,
    notes: ''
  }
  formError.value = ''
}

const saveRecord = async () => {
  try {
    saving.value = true
    formError.value = ''

    const recordData = {
      dog_id: dogId,
      user_id: authStore.userId,
      title: form.value.title,
      record_date: form.value.visit_date,
      visit_date: form.value.visit_date,
      record_type: 'checkup', // Default type, you can make this a form field later
      diagnosis: form.value.diagnosis || null,
      treatment: form.value.treatment || null,
      vet_id: form.value.vet_id || null,
      cost: form.value.cost,
      notes: form.value.notes || null
    }

    if (editingRecord.value) {
      const { error } = await supabase
        .from('doghealthy_health_records')
        .update(recordData)
        .eq('id', editingRecord.value.id)
      
      if (error) throw error
    } else {
      const { error } = await supabase
        .from('doghealthy_health_records')
        .insert(recordData)
      
      if (error) throw error
    }

    await fetchRecords()
    closeModal()
  } catch (err: any) {
    console.error('Error saving health record:', err)
    formError.value = err.message || 'Failed to save health record'
  } finally {
    saving.value = false
  }
}

const confirmDelete = (record: HealthRecord) => {
  recordToDelete.value = record
  showDeleteModal.value = true
}

const deleteRecord = async () => {
  if (!recordToDelete.value) return

  try {
    deleting.value = true
    const { error } = await supabase
      .from('doghealthy_health_records')
      .delete()
      .eq('id', recordToDelete.value.id)

    if (error) throw error

    await fetchRecords()
    showDeleteModal.value = false
    recordToDelete.value = null
  } catch (err: any) {
    console.error('Error deleting health record:', err)
    alert('Failed to delete health record')
  } finally {
    deleting.value = false
  }
}

onMounted(() => {
  fetchDogName()
  fetchVets()
  fetchRecords()
})
</script>

