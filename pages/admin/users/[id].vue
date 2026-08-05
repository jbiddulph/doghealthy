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

        <button
          type="submit"
          class="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-sm font-semibold disabled:opacity-60"
          :disabled="saving"
        >
          {{ saving ? 'Saving…' : 'Save user' }}
        </button>
      </form>

      <section class="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
        <div class="flex items-center justify-between mb-4">
          <h3 class="font-semibold text-slate-900">Dogs ({{ dogs.length }})</h3>
        </div>
        <div v-if="dogs.length === 0" class="text-sm text-slate-500">No dogs for this user.</div>
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
            <div class="flex gap-3 text-sm">
              <NuxtLink :to="`/admin/dogs/${dog.id}`" class="text-blue-700 font-medium hover:underline">
                Edit dog
              </NuxtLink>
              <NuxtLink :to="`/dogs/${dog.id}`" class="text-slate-600 hover:underline" target="_blank">
                Open app view
              </NuxtLink>
            </div>
          </li>
        </ul>
      </section>
    </template>
  </AdminShell>
</template>

<script setup lang="ts">
definePageMeta({
  middleware: ['auth', 'admin'],
  layout: false
})

const route = useRoute()
const supabase = useSupabase()
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
  is_active: boolean
  nfc_tag_enabled: boolean | null
}

const loading = ref(true)
const saving = ref(false)
const error = ref('')
const success = ref('')
const form = ref<UserForm | null>(null)
const dogs = ref<DogRow[]>([])

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

const load = async () => {
  loading.value = true
  error.value = ''
  success.value = ''
  try {
    const [{ data: user, error: userError }, { data: dogRows, error: dogsError }] = await Promise.all([
      supabase.from('doghealthy_users').select('*').eq('id', userId.value).maybeSingle(),
      supabase
        .from('doghealthy_dogs')
        .select('id, name, breed, is_active, nfc_tag_enabled')
        .eq('user_id', userId.value)
        .order('created_at', { ascending: false })
    ])
    if (userError) throw userError
    if (dogsError) throw dogsError
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
    dogs.value = (dogRows || []) as DogRow[]
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

onMounted(load)
watch(userId, load)
</script>
