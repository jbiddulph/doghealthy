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
          <h1 class="text-3xl font-bold text-gray-900">Appointments</h1>
          <p class="text-gray-600 mt-2">Manage vet appointments for {{ dogName }}</p>
        </div>
        <button
          @click="showAddModal = true"
          class="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors inline-flex items-center"
        >
          <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Add Appointment
        </button>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="text-center py-12">
        <div class="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <p class="mt-4 text-gray-600">Loading appointments...</p>
      </div>

      <!-- Appointments List -->
      <div v-else-if="appointments.length > 0">
        <!-- Upcoming Appointments -->
        <div v-if="upcomingAppointments.length > 0" class="mb-8">
          <h2 class="text-xl font-semibold text-gray-900 mb-4">Upcoming Appointments</h2>
          <div class="space-y-4">
            <div
              v-for="appointment in upcomingAppointments"
              :key="appointment.id"
              class="bg-white rounded-lg shadow-md p-6 border-l-4 border-blue-500"
            >
              <div class="flex justify-between items-start">
                <div class="flex-1">
                  <div class="flex items-start justify-between mb-4">
                    <div class="flex items-start">
                      <div class="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center text-2xl mr-4">
                        📅
                      </div>
                      <div>
                        <h3 class="text-xl font-semibold text-gray-900">{{ appointment.title }}</h3>
                        <p class="text-sm text-gray-600 mt-1">
                          {{ formatDateTime(appointment.appointment_date) }}
                        </p>
                        <span
                          v-if="appointment.status === 'scheduled'"
                          class="inline-block mt-2 px-2 py-1 bg-blue-100 text-blue-800 text-xs font-semibold rounded"
                        >
                          Scheduled
                        </span>
                        <span
                          v-else-if="appointment.status === 'confirmed'"
                          class="inline-block mt-2 px-2 py-1 bg-green-100 text-green-800 text-xs font-semibold rounded"
                        >
                          Confirmed
                        </span>
                      </div>
                    </div>
                    <div class="flex space-x-2 ml-4">
                      <button
                        @click="editAppointment(appointment)"
                        class="text-blue-600 hover:text-blue-700 p-2"
                        title="Edit"
                      >
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                      <button
                        @click="confirmDelete(appointment)"
                        class="text-red-600 hover:text-red-700 p-2"
                        title="Delete"
                      >
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>

                  <div class="grid md:grid-cols-2 gap-4 text-sm">
                    <div v-if="appointment.vet_name">
                      <p class="text-gray-500">Veterinarian</p>
                      <p class="text-gray-900">{{ appointment.vet_name }}</p>
                    </div>

                    <div v-if="appointment.location">
                      <p class="text-gray-500">Location</p>
                      <p class="text-gray-900">{{ appointment.location }}</p>
                    </div>
                  </div>

                  <div v-if="appointment.purpose || appointment.notes" class="mt-4 pt-4 border-t border-gray-200">
                    <div v-if="appointment.purpose" class="mb-2">
                      <p class="text-sm font-medium text-gray-500">Purpose</p>
                      <p class="text-gray-700 text-sm">{{ appointment.purpose }}</p>
                    </div>
                    <div v-if="appointment.notes">
                      <p class="text-sm font-medium text-gray-500">Notes</p>
                      <p class="text-gray-700 text-sm">{{ appointment.notes }}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Past Appointments -->
        <div v-if="pastAppointments.length > 0">
          <h2 class="text-xl font-semibold text-gray-900 mb-4">Past Appointments</h2>
          <div class="space-y-4">
            <div
              v-for="appointment in pastAppointments"
              :key="appointment.id"
              class="bg-white rounded-lg shadow-md p-6 opacity-75"
            >
              <div class="flex justify-between items-start">
                <div class="flex-1">
                  <div class="flex items-start justify-between mb-4">
                    <div class="flex items-start">
                      <div class="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center text-2xl mr-4">
                        📅
                      </div>
                      <div>
                        <h3 class="text-xl font-semibold text-gray-900">{{ appointment.title }}</h3>
                        <p class="text-sm text-gray-600 mt-1">
                          {{ formatDateTime(appointment.appointment_date) }}
                        </p>
                        <span
                          v-if="appointment.status === 'completed'"
                          class="inline-block mt-2 px-2 py-1 bg-gray-100 text-gray-800 text-xs font-semibold rounded"
                        >
                          Completed
                        </span>
                        <span
                          v-else-if="appointment.status === 'cancelled'"
                          class="inline-block mt-2 px-2 py-1 bg-red-100 text-red-800 text-xs font-semibold rounded"
                        >
                          Cancelled
                        </span>
                      </div>
                    </div>
                    <div class="flex space-x-2 ml-4">
                      <button
                        @click="editAppointment(appointment)"
                        class="text-blue-600 hover:text-blue-700 p-2"
                        title="Edit"
                      >
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                      <button
                        @click="confirmDelete(appointment)"
                        class="text-red-600 hover:text-red-700 p-2"
                        title="Delete"
                      >
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>

                  <div class="grid md:grid-cols-2 gap-4 text-sm">
                    <div v-if="appointment.vet_name">
                      <p class="text-gray-500">Veterinarian</p>
                      <p class="text-gray-900">{{ appointment.vet_name }}</p>
                    </div>

                    <div v-if="appointment.location">
                      <p class="text-gray-500">Location</p>
                      <p class="text-gray-900">{{ appointment.location }}</p>
                    </div>
                  </div>

                  <div v-if="appointment.purpose" class="mt-4 pt-4 border-t border-gray-200">
                    <p class="text-sm font-medium text-gray-500">Purpose</p>
                    <p class="text-gray-700 text-sm">{{ appointment.purpose }}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div v-else class="bg-white rounded-lg shadow-md p-12 text-center">
        <div class="text-6xl mb-4">📅</div>
        <h3 class="text-xl font-semibold text-gray-900 mb-2">No Appointments Yet</h3>
        <p class="text-gray-600 mb-6">Schedule vet appointments for {{ dogName }}</p>
        <button
          @click="showAddModal = true"
          class="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
        >
          Add First Appointment
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
            {{ editingAppointment ? 'Edit Appointment' : 'Add Appointment' }}
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

        <form @submit.prevent="saveAppointment">
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
                placeholder="e.g., Annual Checkup, Dental Cleaning"
              />
            </div>

            <div class="grid md:grid-cols-2 gap-4">
              <div>
                <label for="appointment_date" class="block text-sm font-medium text-gray-700 mb-2">
                  Date *
                </label>
                <input
                  id="appointment_date"
                  v-model="form.appointment_date"
                  type="date"
                  required
                  class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label for="appointment_time" class="block text-sm font-medium text-gray-700 mb-2">
                  Time *
                </label>
                <input
                  id="appointment_time"
                  v-model="form.appointment_time"
                  type="time"
                  required
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
                placeholder="e.g., Routine checkup, Follow-up"
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
              <label for="location" class="block text-sm font-medium text-gray-700 mb-2">
                Location
              </label>
              <input
                id="location"
                v-model="form.location"
                type="text"
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Clinic name or address"
              />
            </div>

            <div>
              <label for="status" class="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <select
                id="status"
                v-model="form.status"
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="scheduled">Scheduled</option>
                <option value="confirmed">Confirmed</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
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
                placeholder="Reminders, special instructions, etc."
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
              {{ saving ? 'Saving...' : (editingAppointment ? 'Update' : 'Add') }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>

  <!-- Delete Confirmation Modal -->
  <div v-if="showDeleteModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
    <div class="bg-white rounded-lg max-w-md w-full p-6">
      <h3 class="text-xl font-bold text-gray-900 mb-4">Delete Appointment</h3>
      <p class="text-gray-600 mb-6">Are you sure you want to delete this appointment? This action cannot be undone.</p>
      <div class="flex justify-end space-x-4">
        <button
          @click="showDeleteModal = false"
          class="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
        >
          Cancel
        </button>
        <button
          @click="deleteAppointment"
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

interface Appointment {
  id: string
  dog_id: string
  user_id: string
  title: string
  appointment_date: string
  purpose: string | null
  vet_id: string | null
  vet_name: string | null
  location: string | null
  status: string
  notes: string | null
  created_at: string
}

interface Vet {
  id: string
  name: string
  clinic_name: string | null
}

const appointments = ref<Appointment[]>([])
const vets = ref<Vet[]>([])
const loading = ref(true)
const showAddModal = ref(false)
const showDeleteModal = ref(false)
const editingAppointment = ref<Appointment | null>(null)
const appointmentToDelete = ref<Appointment | null>(null)
const saving = ref(false)
const deleting = ref(false)
const formError = ref('')

const form = ref({
  title: '',
  appointment_date: '',
  appointment_time: '',
  purpose: '',
  vet_id: '',
  location: '',
  status: 'scheduled',
  notes: ''
})

const upcomingAppointments = computed(() => {
  const now = new Date()
  return appointments.value.filter(a => {
    const appointmentDate = new Date(a.appointment_date)
    return appointmentDate >= now && (a.status === 'scheduled' || a.status === 'confirmed')
  })
})

const pastAppointments = computed(() => {
  const now = new Date()
  return appointments.value.filter(a => {
    const appointmentDate = new Date(a.appointment_date)
    return appointmentDate < now || a.status === 'completed' || a.status === 'cancelled'
  })
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

const fetchAppointments = async () => {
  try {
    loading.value = true
    const { data, error } = await supabase
      .from('doghealthy_appointments')
      .select(`
        *,
        vet:vet_id (
          name
        )
      `)
      .eq('dog_id', dogId)
      .order('appointment_date', { ascending: false })

    if (error) throw error
    
    appointments.value = (data || []).map(appointment => ({
      ...appointment,
      vet_name: appointment.vet?.name || null
    }))
  } catch (err: any) {
    console.error('Error fetching appointments:', err)
  } finally {
    loading.value = false
  }
}

const formatDateTime = (dateTimeStr: string) => {
  const date = new Date(dateTimeStr)
  return date.toLocaleString('en-US', { 
    weekday: 'short',
    year: 'numeric', 
    month: 'short', 
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit'
  })
}

const editAppointment = (appointment: Appointment) => {
  editingAppointment.value = appointment
  const date = new Date(appointment.appointment_date)
  const dateStr = date.toISOString().split('T')[0]
  const timeStr = date.toTimeString().slice(0, 5)
  
  form.value = {
    title: appointment.title,
    appointment_date: dateStr,
    appointment_time: timeStr,
    purpose: appointment.purpose || '',
    vet_id: appointment.vet_id || '',
    location: appointment.location || '',
    status: appointment.status,
    notes: appointment.notes || ''
  }
  showAddModal.value = true
}

const closeModal = () => {
  showAddModal.value = false
  editingAppointment.value = null
  form.value = {
    title: '',
    appointment_date: '',
    appointment_time: '',
    purpose: '',
    vet_id: '',
    location: '',
    status: 'scheduled',
    notes: ''
  }
  formError.value = ''
}

const saveAppointment = async () => {
  try {
    saving.value = true
    formError.value = ''

    // Combine date and time
    const appointmentDateTime = `${form.value.appointment_date}T${form.value.appointment_time}:00`

    const appointmentData = {
      dog_id: dogId,
      user_id: authStore.userId,
      title: form.value.title,
      appointment_date: appointmentDateTime,
      purpose: form.value.purpose || null,
      vet_id: form.value.vet_id || null,
      location: form.value.location || null,
      status: form.value.status,
      notes: form.value.notes || null
    }

    if (editingAppointment.value) {
      const { error } = await supabase
        .from('doghealthy_appointments')
        .update(appointmentData)
        .eq('id', editingAppointment.value.id)
      
      if (error) throw error
    } else {
      const { error } = await supabase
        .from('doghealthy_appointments')
        .insert(appointmentData)
      
      if (error) throw error
    }

    await fetchAppointments()
    closeModal()
  } catch (err: any) {
    console.error('Error saving appointment:', err)
    formError.value = err.message || 'Failed to save appointment'
  } finally {
    saving.value = false
  }
}

const confirmDelete = (appointment: Appointment) => {
  appointmentToDelete.value = appointment
  showDeleteModal.value = true
}

const deleteAppointment = async () => {
  if (!appointmentToDelete.value) return

  try {
    deleting.value = true
    const { error } = await supabase
      .from('doghealthy_appointments')
      .delete()
      .eq('id', appointmentToDelete.value.id)

    if (error) throw error

    await fetchAppointments()
    showDeleteModal.value = false
    appointmentToDelete.value = null
  } catch (err: any) {
    console.error('Error deleting appointment:', err)
    alert('Failed to delete appointment')
  } finally {
    deleting.value = false
  }
}

onMounted(() => {
  fetchDogName()
  fetchVets()
  fetchAppointments()
})
</script>

