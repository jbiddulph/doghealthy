<template>
  <AdminShell :title="pageTitle" subtitle="Edit profile, subscription, shipping and this user’s dogs.">
    <div class="mb-4">
      <NuxtLink to="/admin/users" class="text-sm text-blue-700 hover:underline">← All users</NuxtLink>
    </div>

    <div v-if="error" class="mb-4 text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
      {{ error }}
    </div>
    <div v-if="success" class="mb-4 text-sm text-green-800 bg-green-50 border border-green-200 rounded-lg px-3 py-2">
      {{ success }}
    </div>

    <div v-if="loading" class="text-slate-600 py-8">Loading…</div>

    <template v-else-if="form">
      <form class="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-5 mb-8" @submit.prevent="saveUser">
        <div class="grid sm:grid-cols-2 gap-4">
          <div>
            <label class="block text-xs font-medium text-slate-600 mb-1">Email</label>
            <input v-model="form.email" type="email" class="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm" />
          </div>
          <div>
            <label class="block text-xs font-medium text-slate-600 mb-1">Full name</label>
            <input v-model="form.full_name" type="text" class="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm" />
          </div>
          <div>
            <label class="block text-xs font-medium text-slate-600 mb-1">Phone</label>
            <input v-model="form.phone" type="text" class="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm" />
          </div>
          <div>
            <label class="block text-xs font-medium text-slate-600 mb-1">Billing / shipping name</label>
            <input v-model="form.billing_name" type="text" class="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm" />
          </div>
          <div class="sm:col-span-2">
            <label class="block text-xs font-medium text-slate-600 mb-1">Address line 1</label>
            <input v-model="form.address_line1" type="text" class="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm" />
          </div>
          <div class="sm:col-span-2">
            <label class="block text-xs font-medium text-slate-600 mb-1">Address line 2</label>
            <input v-model="form.address_line2" type="text" class="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm" />
          </div>
          <div>
            <label class="block text-xs font-medium text-slate-600 mb-1">City</label>
            <input v-model="form.address_city" type="text" class="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm" />
          </div>
          <div>
            <label class="block text-xs font-medium text-slate-600 mb-1">Postcode</label>
            <input v-model="form.address_postcode" type="text" class="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm uppercase" />
          </div>
          <div>
            <label class="block text-xs font-medium text-slate-600 mb-1">Subscription status</label>
            <select v-model="form.subscription_status" class="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm">
              <option value="">none</option>
              <option value="active">active</option>
              <option value="trialing">trialing</option>
              <option value="canceled">canceled</option>
              <option value="past_due">past_due</option>
              <option value="unpaid">unpaid</option>
            </select>
          </div>
          <div>
            <label class="block text-xs font-medium text-slate-600 mb-1">Subscription plan</label>
            <select v-model="form.subscription_plan" class="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm">
              <option value="">none</option>
              <option value="monthly">monthly</option>
              <option value="yearly">yearly</option>
            </select>
          </div>
          <div>
            <label class="block text-xs font-medium text-slate-600 mb-1">Period end</label>
            <input
              v-model="form.subscription_current_period_end"
              type="datetime-local"
              class="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
            />
          </div>
          <div>
            <label class="block text-xs font-medium text-slate-600 mb-1">NFC chip status</label>
            <select v-model="form.nfc_chip_status" class="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm">
              <option value="none">none</option>
              <option value="pending">pending</option>
              <option value="shipped">shipped</option>
              <option value="cancelled">cancelled</option>
            </select>
          </div>
          <div class="sm:col-span-2">
            <label class="block text-xs font-medium text-slate-600 mb-1">NFC chip notes</label>
            <textarea v-model="form.nfc_chip_notes" rows="2" class="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm" />
          </div>
          <label class="flex items-center gap-2 text-sm text-slate-700 sm:col-span-2">
            <input v-model="form.is_admin" type="checkbox" class="rounded border-slate-300" />
            Admin role
          </label>
          <label class="flex items-center gap-2 text-sm text-slate-700 sm:col-span-2">
            <input v-model="form.notify_found_sms" type="checkbox" class="rounded border-slate-300" />
            Found-dog SMS enabled
          </label>
        </div>

        <div class="flex flex-wrap gap-2">
          <button
            type="submit"
            class="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-sm font-semibold disabled:opacity-60"
            :disabled="saving"
          >
            {{ saving ? 'Saving…' : 'Save user' }}
          </button>
          <button
            type="button"
            class="px-5 py-2.5 border border-red-300 text-red-700 rounded-lg text-sm font-semibold hover:bg-red-50 disabled:opacity-60"
            :disabled="saving || deletingUser"
            @click="deleteUser"
          >
            {{ deletingUser ? 'Deleting…' : 'Delete user' }}
          </button>
        </div>
      </form>

      <section class="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
        <div class="flex flex-wrap items-center justify-between gap-3 mb-4">
          <h3 class="font-semibold text-slate-900">Dogs ({{ dogsTotal }})</h3>
          <button
            type="button"
            class="px-3 py-1.5 bg-slate-900 text-white rounded-lg text-sm font-semibold"
            @click="openDogEditor()"
          >
            Add dog
          </button>
        </div>

        <div
          v-if="dogEditorOpen"
          class="mb-5 rounded-lg border border-slate-200 bg-slate-50 p-4 space-y-3"
        >
          <h4 class="text-sm font-semibold text-slate-900">
            {{ dogForm.id ? 'Edit dog' : 'Add dog' }}
          </h4>
          <div class="grid sm:grid-cols-2 gap-3">
            <div>
              <label class="block text-xs font-medium text-slate-600 mb-1">Name</label>
              <input v-model="dogForm.name" required type="text" class="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white" />
            </div>
            <div>
              <label class="block text-xs font-medium text-slate-600 mb-1">Breed</label>
              <input v-model="dogForm.breed" type="text" class="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white" />
            </div>
            <div>
              <label class="block text-xs font-medium text-slate-600 mb-1">Gender</label>
              <select v-model="dogForm.gender" class="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white">
                <option value="">—</option>
                <option value="male">male</option>
                <option value="female">female</option>
                <option value="unknown">unknown</option>
              </select>
            </div>
            <div>
              <label class="block text-xs font-medium text-slate-600 mb-1">Birth date</label>
              <input v-model="dogForm.birth_date" type="date" class="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white" />
            </div>
            <div>
              <label class="block text-xs font-medium text-slate-600 mb-1">Weight (kg)</label>
              <input v-model.number="dogForm.weight_kg" type="number" step="0.1" class="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white" />
            </div>
            <div>
              <label class="block text-xs font-medium text-slate-600 mb-1">Colour</label>
              <input v-model="dogForm.color" type="text" class="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white" />
            </div>
            <div>
              <label class="block text-xs font-medium text-slate-600 mb-1">Microchip</label>
              <input v-model="dogForm.microchip_number" type="text" class="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white" />
            </div>
            <div class="sm:col-span-2">
              <label class="block text-xs font-medium text-slate-600 mb-1">Notes</label>
              <textarea v-model="dogForm.notes" rows="2" class="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white" />
            </div>
            <label class="flex items-center gap-2 text-sm text-slate-700">
              <input v-model="dogForm.is_active" type="checkbox" class="rounded border-slate-300" />
              Active
            </label>
            <label class="flex items-center gap-2 text-sm text-slate-700">
              <input v-model="dogForm.nfc_tag_enabled" type="checkbox" class="rounded border-slate-300" />
              NFC tag enabled
            </label>
          </div>
          <div class="flex flex-wrap gap-2">
            <button
              type="button"
              class="px-4 py-2 bg-slate-900 text-white rounded-lg text-sm font-semibold disabled:opacity-60"
              :disabled="savingDog || !dogForm.name.trim()"
              @click="saveDog"
            >
              {{ savingDog ? 'Saving…' : dogForm.id ? 'Save dog' : 'Create dog' }}
            </button>
            <button
              type="button"
              class="px-4 py-2 border border-slate-300 rounded-lg text-sm font-medium hover:bg-white"
              :disabled="savingDog"
              @click="closeDogEditor"
            >
              Cancel
            </button>
          </div>
        </div>

        <div v-if="dogsLoading" class="text-sm text-slate-500">Loading dogs…</div>
        <div v-else-if="dogs.length === 0" class="text-sm text-slate-500">No dogs for this user.</div>
        <ul v-else class="divide-y divide-slate-100">
          <li v-for="dog in dogs" :key="dog.id" class="py-3 flex flex-wrap items-center justify-between gap-2">
            <div>
              <p class="font-medium text-slate-900">{{ dog.name }}</p>
              <p class="text-xs text-slate-500">
                {{ dog.breed || 'Unknown breed' }}
                · {{ dog.is_active ? 'active' : 'inactive' }}
                <span v-if="dog.nfc_tag_enabled"> · NFC enabled</span>
              </p>
            </div>
            <div class="flex flex-wrap gap-3 text-sm">
              <button type="button" class="text-blue-700 font-medium hover:underline" @click="openDogEditor(dog)">
                Edit
              </button>
              <NuxtLink :to="`/admin/dogs/${dog.id}`" class="text-slate-600 hover:underline">
                Full editor
              </NuxtLink>
              <NuxtLink :to="`/dogs/${dog.id}`" class="text-slate-600 hover:underline" target="_blank">
                App view
              </NuxtLink>
              <button
                type="button"
                class="text-red-700 font-medium hover:underline disabled:opacity-50"
                :disabled="deletingDogId === dog.id"
                @click="deleteDog(dog)"
              >
                {{ deletingDogId === dog.id ? 'Deleting…' : 'Delete' }}
              </button>
            </div>
          </li>
        </ul>

        <AdminPagination
          v-model:page="dogsPage"
          :total="dogsTotal"
          :disabled="dogsLoading"
        />
      </section>
    </template>
  </AdminShell>
</template>

<script setup lang="ts">
import { adminPageRange } from '~/utils/adminPagination'

definePageMeta({
  middleware: ['auth', 'admin'],
  layout: false
})

const route = useRoute()
const router = useRouter()
const supabase = useSupabase()
const authStore = useAuthStore()
const userId = computed(() => route.params.id as string)

usePageSeo({
  title: 'Edit user — Admin',
  path: '/admin/users',
  index: false
})

type UserForm = {
  email: string
  full_name: string
  phone: string
  billing_name: string
  address_line1: string
  address_line2: string
  address_city: string
  address_postcode: string
  subscription_status: string
  subscription_plan: string
  subscription_current_period_end: string
  nfc_chip_status: string
  nfc_chip_notes: string
  is_admin: boolean
  notify_found_sms: boolean
}

type DogRow = {
  id: string
  name: string
  breed: string | null
  gender: string | null
  birth_date: string | null
  weight_kg: number | null
  color: string | null
  microchip_number: string | null
  notes: string | null
  is_active: boolean
  nfc_tag_enabled: boolean | null
}

type DogFormState = {
  id: string | null
  name: string
  breed: string
  gender: string
  birth_date: string
  weight_kg: number | null
  color: string
  microchip_number: string
  notes: string
  is_active: boolean
  nfc_tag_enabled: boolean
}

const emptyDogForm = (): DogFormState => ({
  id: null,
  name: '',
  breed: '',
  gender: '',
  birth_date: '',
  weight_kg: null,
  color: '',
  microchip_number: '',
  notes: '',
  is_active: true,
  nfc_tag_enabled: false
})

const loading = ref(true)
const saving = ref(false)
const deletingUser = ref(false)
const error = ref('')
const success = ref('')
const form = ref<UserForm | null>(null)

const dogs = ref<DogRow[]>([])
const dogsPage = ref(1)
const dogsTotal = ref(0)
const dogsLoading = ref(false)
const dogEditorOpen = ref(false)
const dogForm = ref<DogFormState>(emptyDogForm())
const savingDog = ref(false)
const deletingDogId = ref('')

const pageTitle = computed(() => form.value?.full_name || form.value?.email || 'Edit user')

const toLocalInput = (iso: string | null) => {
  if (!iso) return ''
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return ''
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

const fromLocalInput = (value: string) => {
  if (!value) return null
  const d = new Date(value)
  return Number.isNaN(d.getTime()) ? null : d.toISOString()
}

const loadDogs = async () => {
  dogsLoading.value = true
  try {
    const { from, to } = adminPageRange(dogsPage.value)
    const { data, error: dogsError, count } = await supabase
      .from('doghealthy_dogs')
      .select(
        'id, name, breed, gender, birth_date, weight_kg, color, microchip_number, notes, is_active, nfc_tag_enabled',
        { count: 'exact' }
      )
      .eq('user_id', userId.value)
      .order('created_at', { ascending: false })
      .range(from, to)
    if (dogsError) throw dogsError
    dogs.value = (data || []) as DogRow[]
    dogsTotal.value = count || 0
  } catch (err: any) {
    error.value = err?.message || 'Failed to load dogs'
    dogs.value = []
    dogsTotal.value = 0
  } finally {
    dogsLoading.value = false
  }
}

const load = async () => {
  loading.value = true
  error.value = ''
  success.value = ''
  dogEditorOpen.value = false
  dogsPage.value = 1
  try {
    const { data: user, error: userError } = await supabase
      .from('doghealthy_users')
      .select('*')
      .eq('id', userId.value)
      .maybeSingle()
    if (userError) throw userError
    if (!user) throw new Error('User not found')

    form.value = {
      email: user.email || '',
      full_name: user.full_name || '',
      phone: user.phone || '',
      billing_name: user.billing_name || '',
      address_line1: user.address_line1 || '',
      address_line2: user.address_line2 || '',
      address_city: user.address_city || '',
      address_postcode: user.address_postcode || '',
      subscription_status: user.subscription_status || '',
      subscription_plan: user.subscription_plan || '',
      subscription_current_period_end: toLocalInput(user.subscription_current_period_end),
      nfc_chip_status: user.nfc_chip_status || 'none',
      nfc_chip_notes: user.nfc_chip_notes || '',
      is_admin: !!user.is_admin,
      notify_found_sms: user.notify_found_sms !== false
    }
    await loadDogs()
  } catch (err: any) {
    error.value = err?.message || 'Failed to load user'
    form.value = null
  } finally {
    loading.value = false
  }
}

const saveUser = async () => {
  if (!form.value) return
  saving.value = true
  error.value = ''
  success.value = ''
  try {
    const payload: Record<string, unknown> = {
      email: form.value.email.trim(),
      full_name: form.value.full_name.trim() || null,
      phone: form.value.phone.trim() || null,
      billing_name: form.value.billing_name.trim() || null,
      address_line1: form.value.address_line1.trim() || null,
      address_line2: form.value.address_line2.trim() || null,
      address_city: form.value.address_city.trim() || null,
      address_postcode: form.value.address_postcode.trim().toUpperCase() || null,
      address_country: 'GB',
      subscription_status: form.value.subscription_status || null,
      subscription_plan: form.value.subscription_plan || null,
      subscription_current_period_end: fromLocalInput(form.value.subscription_current_period_end),
      nfc_chip_status: form.value.nfc_chip_status || 'none',
      nfc_chip_notes: form.value.nfc_chip_notes.trim() || null,
      is_admin: form.value.is_admin,
      notify_found_sms: form.value.notify_found_sms
    }

    if (form.value.nfc_chip_status === 'shipped') {
      payload.nfc_chip_shipped_at = new Date().toISOString()
    }

    const { error: updateError } = await supabase
      .from('doghealthy_users')
      .update(payload)
      .eq('id', userId.value)

    if (updateError) throw updateError
    success.value = 'User saved.'
  } catch (err: any) {
    error.value = err?.message || 'Failed to save user'
  } finally {
    saving.value = false
  }
}

const deleteUser = async () => {
  if (!form.value) return
  if (authStore.user?.id === userId.value) {
    error.value = 'You cannot delete your own admin account.'
    return
  }
  const label = form.value.full_name || form.value.email
  if (
    !confirm(
      `Delete user “${label}” and all their dogs / related data? This cannot be undone.`
    )
  ) {
    return
  }
  deletingUser.value = true
  error.value = ''
  try {
    const { error: delError } = await supabase.from('doghealthy_users').delete().eq('id', userId.value)
    if (delError) throw delError
    await router.push('/admin/users')
  } catch (err: any) {
    error.value = err?.message || 'Failed to delete user'
  } finally {
    deletingUser.value = false
  }
}

const openDogEditor = (dog?: DogRow) => {
  error.value = ''
  success.value = ''
  if (dog) {
    dogForm.value = {
      id: dog.id,
      name: dog.name || '',
      breed: dog.breed || '',
      gender: dog.gender || '',
      birth_date: dog.birth_date || '',
      weight_kg: dog.weight_kg,
      color: dog.color || '',
      microchip_number: dog.microchip_number || '',
      notes: dog.notes || '',
      is_active: dog.is_active !== false,
      nfc_tag_enabled: !!dog.nfc_tag_enabled
    }
  } else {
    dogForm.value = emptyDogForm()
  }
  dogEditorOpen.value = true
}

const closeDogEditor = () => {
  dogEditorOpen.value = false
  dogForm.value = emptyDogForm()
}

const saveDog = async () => {
  const name = dogForm.value.name.trim()
  if (!name) return
  savingDog.value = true
  error.value = ''
  success.value = ''
  try {
    const payload = {
      user_id: userId.value,
      name,
      breed: dogForm.value.breed.trim() || null,
      gender: dogForm.value.gender || null,
      birth_date: dogForm.value.birth_date || null,
      weight_kg: dogForm.value.weight_kg,
      color: dogForm.value.color.trim() || null,
      microchip_number: dogForm.value.microchip_number.trim() || null,
      notes: dogForm.value.notes.trim() || null,
      is_active: dogForm.value.is_active,
      nfc_tag_enabled: dogForm.value.nfc_tag_enabled
    }

    if (dogForm.value.id) {
      const { error: updateError } = await supabase
        .from('doghealthy_dogs')
        .update(payload)
        .eq('id', dogForm.value.id)
      if (updateError) throw updateError
      success.value = 'Dog updated.'
    } else {
      const { error: insertError } = await supabase.from('doghealthy_dogs').insert(payload)
      if (insertError) throw insertError
      success.value = 'Dog created.'
      dogsPage.value = 1
    }
    closeDogEditor()
    await loadDogs()
  } catch (err: any) {
    error.value = err?.message || 'Failed to save dog'
  } finally {
    savingDog.value = false
  }
}

const deleteDog = async (dog: DogRow) => {
  if (!confirm(`Delete dog “${dog.name}” and related records? This cannot be undone.`)) return
  deletingDogId.value = dog.id
  error.value = ''
  try {
    const { error: delError } = await supabase.from('doghealthy_dogs').delete().eq('id', dog.id)
    if (delError) throw delError
    success.value = `Deleted ${dog.name}.`
    if (dogForm.value.id === dog.id) closeDogEditor()
    if (dogs.value.length <= 1 && dogsPage.value > 1) dogsPage.value -= 1
    else await loadDogs()
  } catch (err: any) {
    error.value = err?.message || 'Failed to delete dog'
  } finally {
    deletingDogId.value = ''
  }
}

onMounted(load)
watch(userId, load)
watch(dogsPage, () => {
  if (!loading.value) loadDogs()
})
</script>
