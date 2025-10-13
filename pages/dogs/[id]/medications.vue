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
          <h1 class="text-3xl font-bold text-gray-900">Medications</h1>
          <p class="text-gray-600 mt-2">Manage medications for {{ dogName }}</p>
        </div>
        <button
          @click="showAddModal = true"
          class="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors inline-flex items-center"
        >
          <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Add Medication
        </button>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="text-center py-12">
        <div class="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <p class="mt-4 text-gray-600">Loading medications...</p>
      </div>

      <!-- Medications List -->
      <div v-else-if="medications.length > 0">
        <!-- Active Medications -->
        <div v-if="activeMedications.length > 0" class="mb-8">
          <h2 class="text-xl font-semibold text-gray-900 mb-4">Active Medications</h2>
          <div class="space-y-4">
            <div
              v-for="medication in activeMedications"
              :key="medication.id"
              class="bg-white rounded-lg shadow-md p-6 border-l-4 border-green-500"
            >
              <div class="flex justify-between items-start">
                <div class="flex-1">
                  <div class="flex items-start justify-between mb-4">
                    <div class="flex items-start">
                      <div class="w-12 h-12 bg-pink-100 rounded-full flex items-center justify-center text-2xl mr-4">
                        💊
                      </div>
                      <div>
                        <h3 class="text-xl font-semibold text-gray-900">{{ medication.medication_name }}</h3>
                        <p class="text-sm text-gray-600 mt-1">{{ medication.dosage }} - {{ medication.frequency }}</p>
                        <span class="inline-block mt-2 px-2 py-1 bg-green-100 text-green-800 text-xs font-semibold rounded">
                          Active
                        </span>
                      </div>
                    </div>
                    <div class="flex space-x-2 ml-4">
                      <button
                        @click="editMedication(medication)"
                        class="text-blue-600 hover:text-blue-700 p-2"
                        title="Edit"
                      >
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                      <button
                        @click="confirmDelete(medication)"
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
                    <div>
                      <p class="text-gray-500">Started</p>
                      <p class="text-gray-900">{{ formatDate(medication.start_date) }}</p>
                    </div>

                    <div v-if="medication.end_date">
                      <p class="text-gray-500">Ends</p>
                      <p class="text-gray-900">{{ formatDate(medication.end_date) }}</p>
                    </div>

                    <div v-if="medication.vet_name">
                      <p class="text-gray-500">Prescribed By</p>
                      <p class="text-gray-900">{{ medication.vet_name }}</p>
                    </div>
                  </div>

                  <div v-if="medication.purpose || medication.notes" class="mt-4 pt-4 border-t border-gray-200">
                    <div v-if="medication.purpose" class="mb-2">
                      <p class="text-sm font-medium text-gray-500">Purpose</p>
                      <p class="text-gray-700 text-sm">{{ medication.purpose }}</p>
                    </div>
                    <div v-if="medication.notes">
                      <p class="text-sm font-medium text-gray-500">Notes</p>
                      <p class="text-gray-700 text-sm">{{ medication.notes }}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Inactive Medications -->
        <div v-if="inactiveMedications.length > 0">
          <h2 class="text-xl font-semibold text-gray-900 mb-4">Past Medications</h2>
          <div class="space-y-4">
            <div
              v-for="medication in inactiveMedications"
              :key="medication.id"
              class="bg-white rounded-lg shadow-md p-6 opacity-75"
            >
              <div class="flex justify-between items-start">
                <div class="flex-1">
                  <div class="flex items-start justify-between mb-4">
                    <div class="flex items-start">
                      <div class="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center text-2xl mr-4">
                        💊
                      </div>
                      <div>
                        <h3 class="text-xl font-semibold text-gray-900">{{ medication.medication_name }}</h3>
                        <p class="text-sm text-gray-600 mt-1">{{ medication.dosage }} - {{ medication.frequency }}</p>
                      </div>
                    </div>
                    <div class="flex space-x-2 ml-4">
                      <button
                        @click="editMedication(medication)"
                        class="text-blue-600 hover:text-blue-700 p-2"
                        title="Edit"
                      >
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                      <button
                        @click="confirmDelete(medication)"
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
                    <div>
                      <p class="text-gray-500">Started</p>
                      <p class="text-gray-900">{{ formatDate(medication.start_date) }}</p>
                    </div>

                    <div v-if="medication.end_date">
                      <p class="text-gray-500">Ended</p>
                      <p class="text-gray-900">{{ formatDate(medication.end_date) }}</p>
                    </div>

                    <div v-if="medication.vet_name">
                      <p class="text-gray-500">Prescribed By</p>
                      <p class="text-gray-900">{{ medication.vet_name }}</p>
                    </div>
                  </div>

                  <div v-if="medication.purpose" class="mt-4 pt-4 border-t border-gray-200">
                    <p class="text-sm font-medium text-gray-500">Purpose</p>
                    <p class="text-gray-700 text-sm">{{ medication.purpose }}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div v-else class="bg-white rounded-lg shadow-md p-12 text-center">
        <div class="text-6xl mb-4">💊</div>
        <h3 class="text-xl font-semibold text-gray-900 mb-2">No Medications Yet</h3>
        <p class="text-gray-600 mb-6">Track medications and dosages for {{ dogName }}</p>
        <button
          @click="showAddModal = true"
          class="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
        >
          Add First Medication
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
            {{ editingMedication ? 'Edit Medication' : 'Add Medication' }}
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

        <form @submit.prevent="saveMedication">
          <div class="space-y-4">
            <div>
              <label for="medication_name" class="block text-sm font-medium text-gray-700 mb-2">
                Medication Name *
              </label>
              <input
                id="medication_name"
                v-model="form.medication_name"
                type="text"
                required
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="e.g., Apoquel, Prednisone"
              />
            </div>

            <div class="grid md:grid-cols-2 gap-4">
              <div>
                <label for="dosage" class="block text-sm font-medium text-gray-700 mb-2">
                  Dosage *
                </label>
                <input
                  id="dosage"
                  v-model="form.dosage"
                  type="text"
                  required
                  class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., 10mg, 1 tablet"
                />
              </div>

              <div>
                <label for="frequency" class="block text-sm font-medium text-gray-700 mb-2">
                  Frequency *
                </label>
                <input
                  id="frequency"
                  v-model="form.frequency"
                  type="text"
                  required
                  class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., Twice daily, Every 8 hours"
                />
              </div>
            </div>

            <div class="grid md:grid-cols-2 gap-4">
              <div>
                <label for="start_date" class="block text-sm font-medium text-gray-700 mb-2">
                  Start Date *
                </label>
                <input
                  id="start_date"
                  v-model="form.start_date"
                  type="date"
                  required
                  class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label for="end_date" class="block text-sm font-medium text-gray-700 mb-2">
                  End Date
                </label>
                <input
                  id="end_date"
                  v-model="form.end_date"
                  type="date"
                  class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <label for="purpose" class="block text-sm font-medium text-gray-700 mb-2">
                Purpose
              </label>
              <input
                id="purpose"
                v-model="form.purpose"
                type="text"
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="e.g., Allergy relief, Pain management"
              />
            </div>

            <div>
              <label for="vet_id" class="block text-sm font-medium text-gray-700 mb-2">
                Prescribed By
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
              <label for="notes" class="block text-sm font-medium text-gray-700 mb-2">
                Notes
              </label>
              <textarea
                id="notes"
                v-model="form.notes"
                rows="3"
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Side effects, special instructions, etc."
              ></textarea>
            </div>

            <div class="flex items-center">
              <input
                id="is_active"
                v-model="form.is_active"
                type="checkbox"
                class="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <label for="is_active" class="ml-2 text-sm font-medium text-gray-700">
                Currently active
              </label>
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
              {{ saving ? 'Saving...' : (editingMedication ? 'Update' : 'Add') }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>

  <!-- Delete Confirmation Modal -->
  <div v-if="showDeleteModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
    <div class="bg-white rounded-lg max-w-md w-full p-6">
      <h3 class="text-xl font-bold text-gray-900 mb-4">Delete Medication</h3>
      <p class="text-gray-600 mb-6">Are you sure you want to delete this medication record? This action cannot be undone.</p>
      <div class="flex justify-end space-x-4">
        <button
          @click="showDeleteModal = false"
          class="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
        >
          Cancel
        </button>
        <button
          @click="deleteMedication"
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

interface Medication {
  id: string
  dog_id: string
  user_id: string
  medication_name: string
  dosage: string
  frequency: string
  start_date: string
  end_date: string | null
  purpose: string | null
  vet_id: string | null
  vet_name: string | null
  notes: string | null
  is_active: boolean
  created_at: string
}

interface Vet {
  id: string
  name: string
  clinic_name: string | null
}

const medications = ref<Medication[]>([])
const vets = ref<Vet[]>([])
const loading = ref(true)
const showAddModal = ref(false)
const showDeleteModal = ref(false)
const editingMedication = ref<Medication | null>(null)
const medicationToDelete = ref<Medication | null>(null)
const saving = ref(false)
const deleting = ref(false)
const formError = ref('')

const form = ref({
  medication_name: '',
  dosage: '',
  frequency: '',
  start_date: '',
  end_date: '',
  purpose: '',
  vet_id: '',
  notes: '',
  is_active: true
})

const activeMedications = computed(() => 
  medications.value.filter(m => m.is_active)
)

const inactiveMedications = computed(() => 
  medications.value.filter(m => !m.is_active)
)

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

const fetchMedications = async () => {
  try {
    loading.value = true
    // Fetch without FK join to avoid PGRST200 when vet FK isn't present in schema cache
    const { data, error } = await supabase
      .from('doghealthy_medications')
      .select('*')
      .eq('dog_id', dogId)
      .order('is_active', { ascending: false })
      .order('start_date', { ascending: false })

    if (error) throw error

    // Build a quick lookup for vet names client-side
    const vetIdToName = new Map<string, string>()
    for (const v of (vets.value || [])) {
      vetIdToName.set(v.id, v.name)
    }

    medications.value = (data || []).map((medication: any) => ({
      ...medication,
      vet_name: medication.vet_id ? (vetIdToName.get(medication.vet_id) || null) : null
    }))
  } catch (err: any) {
    console.error('Error fetching medications:', err)
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

const editMedication = (medication: Medication) => {
  editingMedication.value = medication
  form.value = {
    medication_name: medication.medication_name,
    dosage: medication.dosage,
    frequency: medication.frequency,
    start_date: medication.start_date,
    end_date: medication.end_date || '',
    purpose: medication.purpose || '',
    vet_id: medication.vet_id || '',
    notes: medication.notes || '',
    is_active: medication.is_active
  }
  showAddModal.value = true
}

const closeModal = () => {
  showAddModal.value = false
  editingMedication.value = null
  form.value = {
    medication_name: '',
    dosage: '',
    frequency: '',
    start_date: '',
    end_date: '',
    purpose: '',
    vet_id: '',
    notes: '',
    is_active: true
  }
  formError.value = ''
}

const saveMedication = async () => {
  try {
    saving.value = true
    formError.value = ''

    const medicationData = {
      dog_id: dogId,
      user_id: authStore.userId,
      medication_name: form.value.medication_name,
      dosage: form.value.dosage,
      frequency: form.value.frequency,
      start_date: form.value.start_date,
      end_date: form.value.end_date || null,
      purpose: form.value.purpose || null,
      vet_id: form.value.vet_id || null,
      notes: form.value.notes || null,
      is_active: form.value.is_active
    }

    if (editingMedication.value) {
      const { error } = await supabase
        .from('doghealthy_medications')
        .update(medicationData)
        .eq('id', editingMedication.value.id)
      
      if (error) throw error
    } else {
      const { error } = await supabase
        .from('doghealthy_medications')
        .insert(medicationData)
      
      if (error) throw error
    }

    await fetchMedications()
    closeModal()
  } catch (err: any) {
    console.error('Error saving medication:', err)
    formError.value = err.message || 'Failed to save medication'
  } finally {
    saving.value = false
  }
}

const confirmDelete = (medication: Medication) => {
  medicationToDelete.value = medication
  showDeleteModal.value = true
}

const deleteMedication = async () => {
  if (!medicationToDelete.value) return

  try {
    deleting.value = true
    const { error } = await supabase
      .from('doghealthy_medications')
      .delete()
      .eq('id', medicationToDelete.value.id)

    if (error) throw error

    await fetchMedications()
    showDeleteModal.value = false
    medicationToDelete.value = null
  } catch (err: any) {
    console.error('Error deleting medication:', err)
    alert('Failed to delete medication')
  } finally {
    deleting.value = false
  }
}

onMounted(() => {
  fetchDogName()
  fetchVets()
  fetchMedications()
})
</script>

