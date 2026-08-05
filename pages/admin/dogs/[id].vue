<template>
  <AdminShell :title="form?.name || 'Edit dog'" subtitle="Update this dog’s profile fields.">
    <div class="mb-4 flex flex-wrap gap-3 text-sm">
      <NuxtLink to="/admin/dogs" class="text-blue-700 hover:underline">← All dogs</NuxtLink>
      <NuxtLink
        v-if="form?.user_id"
        :to="`/admin/users/${form.user_id}`"
        class="text-blue-700 hover:underline"
      >
        Owner profile
      </NuxtLink>
      <NuxtLink
        v-if="dogId"
        :to="`/dogs/${dogId}`"
        class="text-slate-600 hover:underline"
        target="_blank"
      >
        Open app view
      </NuxtLink>
    </div>

    <div v-if="error" class="mb-4 text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
      {{ error }}
    </div>
    <div v-if="success" class="mb-4 text-sm text-green-800 bg-green-50 border border-green-200 rounded-lg px-3 py-2">
      {{ success }}
    </div>

    <div v-if="loading" class="text-slate-600 py-8">Loading…</div>

    <form
      v-else-if="form"
      class="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-5"
      @submit.prevent="save"
    >
      <div class="grid sm:grid-cols-2 gap-4">
        <div>
          <label class="block text-xs font-medium text-slate-600 mb-1">Name</label>
          <input v-model="form.name" required type="text" class="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm" />
        </div>
        <div>
          <label class="block text-xs font-medium text-slate-600 mb-1">Breed</label>
          <input v-model="form.breed" type="text" class="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm" />
        </div>
        <div>
          <label class="block text-xs font-medium text-slate-600 mb-1">Gender</label>
          <select v-model="form.gender" class="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm">
            <option value="">—</option>
            <option value="male">male</option>
            <option value="female">female</option>
            <option value="unknown">unknown</option>
          </select>
        </div>
        <div>
          <label class="block text-xs font-medium text-slate-600 mb-1">Birth date</label>
          <input v-model="form.birth_date" type="date" class="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm" />
        </div>
        <div>
          <label class="block text-xs font-medium text-slate-600 mb-1">Weight (kg)</label>
          <input v-model.number="form.weight_kg" type="number" step="0.1" class="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm" />
        </div>
        <div>
          <label class="block text-xs font-medium text-slate-600 mb-1">Colour</label>
          <input v-model="form.color" type="text" class="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm" />
        </div>
        <div>
          <label class="block text-xs font-medium text-slate-600 mb-1">Microchip</label>
          <input v-model="form.microchip_number" type="text" class="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm" />
        </div>
        <div>
          <label class="block text-xs font-medium text-slate-600 mb-1">Photo URL</label>
          <input v-model="form.photo_url" type="url" class="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm" />
        </div>
        <div class="sm:col-span-2">
          <label class="block text-xs font-medium text-slate-600 mb-1">Notes</label>
          <textarea v-model="form.notes" rows="3" class="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm" />
        </div>
        <label class="flex items-center gap-2 text-sm text-slate-700">
          <input v-model="form.is_active" type="checkbox" class="rounded border-slate-300" />
          Active
        </label>
        <label class="flex items-center gap-2 text-sm text-slate-700">
          <input v-model="form.nfc_tag_enabled" type="checkbox" class="rounded border-slate-300" />
          NFC tag enabled (public scan profile)
        </label>
      </div>

      <div class="flex flex-wrap gap-2">
        <button
          type="submit"
          class="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-sm font-semibold disabled:opacity-60"
          :disabled="saving"
        >
          {{ saving ? 'Saving…' : 'Save dog' }}
        </button>
        <button
          type="button"
          class="px-5 py-2.5 border border-slate-300 text-slate-700 rounded-lg text-sm font-semibold hover:bg-slate-50 disabled:opacity-60"
          :disabled="saving"
          @click="deactivate"
        >
          Deactivate
        </button>
        <button
          type="button"
          class="px-5 py-2.5 border border-red-300 text-red-700 rounded-lg text-sm font-semibold hover:bg-red-50 disabled:opacity-60"
          :disabled="saving || deleting"
          @click="removeDog"
        >
          {{ deleting ? 'Deleting…' : 'Delete dog' }}
        </button>
      </div>
    </form>
  </AdminShell>
</template>

<script setup lang="ts">
definePageMeta({
  middleware: ['auth', 'admin'],
  layout: false
})

const route = useRoute()
const router = useRouter()
const supabase = useSupabase()
const dogId = computed(() => route.params.id as string)

usePageSeo({
  title: 'Edit dog — Admin',
  path: '/admin/dogs',
  index: false
})

type DogForm = {
  user_id: string
  name: string
  breed: string
  gender: string
  birth_date: string
  weight_kg: number | null
  color: string
  microchip_number: string
  photo_url: string
  notes: string
  is_active: boolean
  nfc_tag_enabled: boolean
}

const loading = ref(true)
const saving = ref(false)
const deleting = ref(false)
const error = ref('')
const success = ref('')
const form = ref<DogForm | null>(null)

const load = async () => {
  loading.value = true
  error.value = ''
  success.value = ''
  try {
    const { data, error: fetchError } = await supabase
      .from('doghealthy_dogs')
      .select('*')
      .eq('id', dogId.value)
      .maybeSingle()
    if (fetchError) throw fetchError
    if (!data) throw new Error('Dog not found')

    form.value = {
      user_id: data.user_id,
      name: data.name || '',
      breed: data.breed || '',
      gender: data.gender || '',
      birth_date: data.birth_date || '',
      weight_kg: data.weight_kg,
      color: data.color || '',
      microchip_number: data.microchip_number || '',
      photo_url: data.photo_url || '',
      notes: data.notes || '',
      is_active: data.is_active !== false,
      nfc_tag_enabled: !!data.nfc_tag_enabled
    }
  } catch (err: any) {
    error.value = err?.message || 'Failed to load dog'
    form.value = null
  } finally {
    loading.value = false
  }
}

const save = async () => {
  if (!form.value) return
  saving.value = true
  error.value = ''
  success.value = ''
  try {
    const { error: updateError } = await supabase
      .from('doghealthy_dogs')
      .update({
        name: form.value.name.trim(),
        breed: form.value.breed.trim() || null,
        gender: form.value.gender || null,
        birth_date: form.value.birth_date || null,
        weight_kg: form.value.weight_kg,
        color: form.value.color.trim() || null,
        microchip_number: form.value.microchip_number.trim() || null,
        photo_url: form.value.photo_url.trim() || null,
        notes: form.value.notes.trim() || null,
        is_active: form.value.is_active,
        nfc_tag_enabled: form.value.nfc_tag_enabled
      })
      .eq('id', dogId.value)
    if (updateError) throw updateError
    success.value = 'Dog saved.'
  } catch (err: any) {
    error.value = err?.message || 'Failed to save dog'
  } finally {
    saving.value = false
  }
}

const deactivate = async () => {
  if (!form.value) return
  if (!confirm(`Deactivate ${form.value.name}?`)) return
  form.value.is_active = false
  await save()
}

const removeDog = async () => {
  if (!form.value) return
  if (!confirm(`Delete dog “${form.value.name}” and related records? This cannot be undone.`)) return
  deleting.value = true
  error.value = ''
  try {
    const ownerId = form.value.user_id
    const { error: delError } = await supabase.from('doghealthy_dogs').delete().eq('id', dogId.value)
    if (delError) throw delError
    if (ownerId) await router.push(`/admin/users/${ownerId}`)
    else await router.push('/admin/dogs')
  } catch (err: any) {
    error.value = err?.message || 'Failed to delete dog'
  } finally {
    deleting.value = false
  }
}

onMounted(load)
watch(dogId, load)
</script>
