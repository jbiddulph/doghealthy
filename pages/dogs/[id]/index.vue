<template>
  <div class="min-h-screen bg-gray-50 py-8">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div v-if="viewMode === 'owner'" class="mb-6">
        <NuxtLink
          to="/dogs"
          class="text-blue-600 hover:text-blue-700 font-medium inline-flex items-center"
        >
          <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to My Dogs
        </NuxtLink>
      </div>

      <div v-if="loading" class="text-center py-12">
        <div class="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <p class="mt-4 text-gray-600">Loading dog details...</p>
      </div>

      <div v-else-if="error && viewMode !== 'public'" class="bg-red-50 border border-red-200 rounded-lg p-6">
        <h2 class="text-xl font-semibold text-red-800 mb-2">Pet profile unavailable</h2>
        <p class="text-red-600">{{ error }}</p>
        <NuxtLink to="/" class="mt-4 inline-block text-blue-600 hover:text-blue-700">
          Go to DogHealthy
        </NuxtLink>
      </div>

      <!-- Public found-pet view (NFC / QR scan) -->
      <div v-else-if="viewMode === 'public' && publicDog" class="max-w-3xl mx-auto">
        <div class="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div class="h-56 bg-gray-100">
            <img
              v-if="publicDog.photo_url"
              :src="publicDog.photo_url"
              :alt="publicDog.name"
              class="w-full h-full object-cover"
            />
            <div v-else class="w-full h-full flex items-center justify-center text-7xl">🐕</div>
          </div>

          <div class="p-8">
            <p class="text-sm font-semibold text-blue-600 mb-2">Found pet profile</p>
            <h1 class="text-3xl font-bold text-gray-900 mb-2">{{ publicDog.name }}</h1>
            <p v-if="publicDog.breed" class="text-lg text-gray-600 mb-6">{{ publicDog.breed }}</p>

            <div class="grid sm:grid-cols-2 gap-4 mb-6">
              <div v-if="publicDog.gender" class="bg-gray-50 rounded-lg p-4">
                <p class="text-xs uppercase tracking-wide text-gray-500">Gender</p>
                <p class="font-medium text-gray-900 capitalize">{{ publicDog.gender }}</p>
              </div>
              <div v-if="publicDog.color" class="bg-gray-50 rounded-lg p-4">
                <p class="text-xs uppercase tracking-wide text-gray-500">Colour</p>
                <p class="font-medium text-gray-900">{{ publicDog.color }}</p>
              </div>
              <div v-if="publicDog.microchip_number" class="bg-gray-50 rounded-lg p-4 sm:col-span-2">
                <p class="text-xs uppercase tracking-wide text-gray-500">Microchip</p>
                <p class="font-mono text-sm text-gray-900">{{ publicDog.microchip_number }}</p>
              </div>
            </div>

            <div v-if="publicDog.notes" class="mb-6">
              <p class="text-sm font-medium text-gray-500 mb-1">Owner notes</p>
              <p class="text-gray-800 whitespace-pre-wrap">{{ publicDog.notes }}</p>
            </div>

            <div class="rounded-xl bg-amber-50 border border-amber-200 p-4 text-sm text-amber-900 mb-6">
              If you have found this dog, alert the owner below. Walkers and sitters can check in/out or log a walk — these are saved with location, but do not send SMS.
            </div>

            <div v-if="foundSuccess" class="mb-4 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800">
              {{ foundSuccess }}
            </div>
            <div v-if="foundError" class="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {{ foundError }}
            </div>
            <div v-if="careSuccess" class="mb-4 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800">
              {{ careSuccess }}
            </div>
            <div v-if="careError" class="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {{ careError }}
            </div>

            <div class="space-y-3 mb-6">
              <p class="text-sm font-semibold text-gray-800">Care actions</p>
              <div class="grid sm:grid-cols-2 gap-3">
                <button
                  type="button"
                  class="bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-semibold px-4 py-3 rounded-lg"
                  :disabled="careSubmitting"
                  @click="recordCareAction('check_in')"
                >
                  Check in
                </button>
                <button
                  type="button"
                  class="bg-slate-700 hover:bg-slate-800 disabled:opacity-60 text-white font-semibold px-4 py-3 rounded-lg"
                  :disabled="careSubmitting"
                  @click="recordCareAction('check_out')"
                >
                  Check out
                </button>
                <button
                  type="button"
                  class="sm:col-span-2 font-semibold px-4 py-3 rounded-lg disabled:opacity-60 text-white"
                  :class="onWalk ? 'bg-orange-600 hover:bg-orange-700' : 'bg-emerald-600 hover:bg-emerald-700'"
                  :disabled="careSubmitting"
                  @click="recordCareAction(onWalk ? 'walk_end' : 'walk_start')"
                >
                  {{ careSubmitting ? 'Saving…' : onWalk ? 'End walk' : 'Start walk' }}
                </button>
              </div>
              <p v-if="onWalk" class="text-sm text-emerald-700">Walk in progress for {{ publicDog.name }}.</p>
            </div>

            <div class="border-t border-gray-100 pt-6">
              <p class="text-sm font-semibold text-gray-800 mb-3">Found this dog?</p>
              <button
                type="button"
                class="w-full sm:w-auto bg-red-600 hover:bg-red-700 disabled:opacity-60 text-white font-semibold px-6 py-3 rounded-lg"
                :disabled="foundSubmitting"
                @click="reportFound"
              >
                {{ foundSubmitting ? 'Notifying owner…' : 'I found this dog — alert owner' }}
              </button>
            </div>

            <p v-if="scanRecorded" class="mt-4 text-xs text-gray-500">
              Scan recorded{{ locationShared ? ' with approximate location' : '' }}.
            </p>
          </div>
        </div>
      </div>

      <!-- Owner private dashboard -->
      <div v-else-if="viewMode === 'owner' && dog" class="space-y-6">
        <div class="bg-white rounded-lg shadow-md overflow-hidden">
          <div class="md:flex">
            <div class="md:w-1/3">
              <img
                v-if="dog.photo_url"
                :src="dog.photo_url"
                :alt="dog.name"
                class="w-full h-64 md:h-full object-cover"
              />
              <div
                v-else
                class="w-full h-64 md:h-full bg-gray-200 flex items-center justify-center"
              >
                <svg class="h-24 w-24 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
            </div>

            <div class="md:w-2/3 p-6">
              <div class="flex justify-between items-start mb-4">
                <div>
                  <h1 class="text-3xl font-bold text-gray-900">{{ dog.name }}</h1>
                  <p v-if="dog.breed" class="text-xl text-gray-600 mt-1">{{ dog.breed }}</p>
                </div>
                <NuxtLink
                  :to="`/dogs/${dog.id}/edit`"
                  class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  Edit
                </NuxtLink>
              </div>

              <div class="grid md:grid-cols-2 gap-4 mt-6">
                <div v-if="dog.birth_date" class="flex items-start">
                  <div>
                    <p class="text-sm font-medium text-gray-500">Date of Birth</p>
                    <p class="text-gray-900">{{ formatDate(dog.birth_date) }}</p>
                    <p class="text-sm text-gray-500">{{ calculateAge(dog.birth_date) }}</p>
                  </div>
                </div>

                <div v-if="dog.gender" class="flex items-start">
                  <div>
                    <p class="text-sm font-medium text-gray-500">Gender</p>
                    <p class="text-gray-900 capitalize">{{ dog.gender }}</p>
                  </div>
                </div>

                <div v-if="dog.weight_kg" class="flex items-start">
                  <div>
                    <p class="text-sm font-medium text-gray-500">Weight</p>
                    <p class="text-gray-900">{{ dog.weight_kg }} kg</p>
                  </div>
                </div>

                <div v-if="dog.microchip_number" class="flex items-start">
                  <div>
                    <p class="text-sm font-medium text-gray-500">Microchip</p>
                    <p class="text-gray-900 font-mono text-sm">{{ dog.microchip_number }}</p>
                  </div>
                </div>
              </div>

              <div v-if="dog.notes" class="mt-6">
                <p class="text-sm font-medium text-gray-500 mb-2">Notes</p>
                <p class="text-gray-900">{{ dog.notes }}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- QR / NFC tag panel -->
        <div class="bg-white rounded-lg shadow-md p-6">
          <div class="flex flex-wrap items-start justify-between gap-4 mb-4">
            <div>
              <h2 class="text-xl font-semibold text-gray-900">QR / NFC tag</h2>
              <p class="text-sm text-gray-600 mt-1">
                Encode this URL on a QR code or NFC sticker. Anyone who scans it sees {{ dog.name }}’s public found-pet profile.
              </p>
            </div>
            <button
              type="button"
              class="bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white px-4 py-2 rounded-lg text-sm font-semibold"
              :disabled="tagLoading"
              @click="ensureTag"
            >
              {{ tagLoading ? 'Preparing…' : activeTag ? 'Refresh tag' : 'Create tag + QR' }}
            </button>
          </div>

          <div v-if="tagError" class="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {{ tagError }}
          </div>

          <div v-if="activeTag && tagUrl" class="grid md:grid-cols-2 gap-6 items-start">
            <div class="flex flex-col items-center">
              <img
                v-if="qrDataUrl"
                :src="qrDataUrl"
                alt="QR code for pet tag"
                class="w-56 h-56 border border-gray-200 rounded-lg bg-white p-2"
              />
              <p class="mt-2 text-xs text-gray-500">Scan with a phone camera to test</p>
            </div>
            <div class="space-y-3">
              <div>
                <p class="text-xs uppercase tracking-wide text-gray-500 mb-1">Tag URL (write this to NFC)</p>
                <div class="flex gap-2">
                  <input
                    :value="tagUrl"
                    readonly
                    class="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm font-mono bg-gray-50"
                  />
                  <button
                    type="button"
                    class="px-3 py-2 rounded-lg border border-gray-300 text-sm font-medium hover:bg-gray-50"
                    @click="copyTagUrl"
                  >
                    {{ copied ? 'Copied' : 'Copy' }}
                  </button>
                </div>
              </div>
              <p class="text-sm text-gray-600">
                UID: <code class="bg-gray-100 px-1.5 py-0.5 rounded text-xs">{{ activeTag.uid }}</code>
                · Status: <span class="capitalize">{{ activeTag.status }}</span>
              </p>
              <p class="text-sm text-gray-500">
                Home test: copy the URL into an NFC writer app (e.g. NFC Tools), write to your sticker, then scan in a private browser window.
              </p>
            </div>
          </div>
        </div>

        <!-- Recent scans -->
        <div class="bg-white rounded-lg shadow-md p-6">
          <h2 class="text-xl font-semibold text-gray-900 mb-4">Recent tag scans</h2>

          <div class="mb-6">
            <ScanLocationMap :token="mapboxToken" :points="scanMapPoints" />
          </div>

          <div v-if="!ownerHasPhone" class="mb-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
            Add a UK mobile number on your
            <NuxtLink to="/profile" class="font-semibold underline">profile</NuxtLink>
            so we can SMS you when someone reports finding {{ dog.name }}.
          </div>

          <div v-if="recentScans.length === 0" class="text-gray-600 text-sm">
            No scans yet. After someone opens the tag URL, they will appear here.
          </div>
          <ul v-else class="divide-y divide-gray-100">
            <li v-for="scan in recentScans" :key="scan.id" class="py-3 flex flex-wrap justify-between gap-2 text-sm">
              <div>
                <p class="font-medium text-gray-900">
                  {{ formatDateTimeShort(scan.scanned_at) }}
                  <span
                    v-if="scan.intent && scan.intent !== 'scan'"
                    class="ml-2 inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold"
                    :class="scan.intent === 'found' ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'"
                  >
                    {{ formatIntent(scan.intent) }}
                  </span>
                </p>
                <p class="text-gray-500">
                  {{ scan.device?.platform || 'device unknown' }}
                  <span v-if="scan.ip"> · {{ scan.ip }}</span>
                  <span v-if="scan.sms_sent_at" class="text-green-700"> · SMS sent</span>
                </p>
              </div>
              <div class="text-gray-500">
                <span v-if="scan.latitude != null && scan.longitude != null">
                  {{ Number(scan.latitude).toFixed(4) }}, {{ Number(scan.longitude).toFixed(4) }}
                </span>
                <span v-else>No GPS</span>
              </div>
            </li>
          </ul>
        </div>

        <div class="grid md:grid-cols-3 lg:grid-cols-4 gap-4">
          <NuxtLink
            :to="`/dogs/${dog.id}/health-records`"
            class="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow text-center"
          >
            <div class="text-4xl mb-2"><i class="bi bi-clipboard2-pulse"></i></div>
            <h3 class="font-semibold text-gray-900">{{ dog.name }}'s Health Records</h3>
            <p class="text-sm text-gray-600 mt-1">View medical history ({{ counts.healthRecords }})</p>
          </NuxtLink>

          <NuxtLink
            :to="`/dogs/${dog.id}/vaccinations`"
            class="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow text-center"
          >
            <div class="text-4xl mb-2"><i class="bi bi-syringe"></i></div>
            <h3 class="font-semibold text-gray-900">{{ dog.name }}'s Vaccinations</h3>
            <p class="text-sm text-gray-600 mt-1">Active {{ counts.vaccinationsUpcoming }} · Inactive {{ counts.vaccinationsPast }}</p>
          </NuxtLink>

          <NuxtLink
            :to="`/dogs/${dog.id}/medications`"
            class="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow text-center"
          >
            <div class="text-4xl mb-2"><i class="bi bi-capsule"></i></div>
            <h3 class="font-semibold text-gray-900">{{ dog.name }}'s Medications</h3>
            <p class="text-sm text-gray-600 mt-1">Active {{ counts.medicationsActive }} · Inactive {{ counts.medicationsInactive }}</p>
          </NuxtLink>

          <NuxtLink
            :to="`/dogs/${dog.id}/appointments`"
            class="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow text-center"
          >
            <div class="text-4xl mb-2"><i class="bi bi-calendar2-event"></i></div>
            <h3 class="font-semibold text-gray-900">{{ dog.name }}'s Appointments</h3>
            <p class="text-sm text-gray-600 mt-1">Upcoming {{ counts.appointmentsUpcoming }} · Past {{ counts.appointmentsPast }}</p>
          </NuxtLink>
        </div>

        <div class="bg-white rounded-lg shadow-md p-6">
          <AdUnit
            ad-slot="dog-detail-sidebar"
            ad-format="horizontal"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import AdUnit from '~/components/ads/AdUnit.vue'
import ScanLocationMap from '~/components/ScanLocationMap.vue'
import QRCode from 'qrcode'

const route = useRoute()
const supabase = useSupabase()
const authStore = useAuthStore()
const config = useRuntimeConfig()

interface Dog {
  id: string
  user_id: string
  name: string
  breed: string | null
  gender: string | null
  birth_date: string | null
  weight_kg: number | null
  color: string | null
  microchip_number: string | null
  photo_url: string | null
  notes: string | null
  is_active: boolean
  nfc_tag_enabled?: boolean
  created_at: string
  updated_at: string
}

interface PublicDog {
  id: string
  name: string
  breed: string | null
  gender: string | null
  color: string | null
  microchip_number: string | null
  photo_url: string | null
  notes: string | null
}

interface ActiveTag {
  id: string
  uid: string
  status: string
}

interface TagScan {
  id: string
  scanned_at: string
  ip: string | null
  latitude: number | null
  longitude: number | null
  intent?: string | null
  sms_sent_at?: string | null
  device: { platform?: string; isMobile?: boolean } | null
}

const dog = ref<Dog | null>(null)
const publicDog = ref<PublicDog | null>(null)
const loading = ref(true)
const error = ref('')
const viewMode = ref<'owner' | 'public' | 'error'>('error')
const scanRecorded = ref(false)
const locationShared = ref(false)
const lastScanId = ref<string | null>(null)
const lastGeo = ref<{ latitude?: number; longitude?: number; accuracyM?: number }>({})

const foundSubmitting = ref(false)
const foundSuccess = ref('')
const foundError = ref('')
const careSubmitting = ref(false)
const careSuccess = ref('')
const careError = ref('')
const onWalk = ref(false)

const activeTag = ref<ActiveTag | null>(null)
const tagUrl = ref('')
const qrDataUrl = ref('')
const tagLoading = ref(false)
const tagError = ref('')
const copied = ref(false)
const recentScans = ref<TagScan[]>([])
const ownerHasPhone = ref(true)

const counts = ref({
  healthRecords: 0,
  vaccinationsUpcoming: 0,
  vaccinationsPast: 0,
  medicationsActive: 0,
  medicationsInactive: 0,
  appointmentsUpcoming: 0,
  appointmentsPast: 0
})

const baseUrl = computed(() =>
  String(config.public.baseUrl || 'https://doghealthy.co.uk').replace(/\/$/, '')
)
const mapboxToken = computed(() => String(config.public.mapboxToken || ''))

const scanMapPoints = computed(() =>
  recentScans.value
    .filter((s) => s.latitude != null && s.longitude != null)
    .map((s) => ({
      id: s.id,
      latitude: Number(s.latitude),
      longitude: Number(s.longitude),
      label: `${s.intent === 'found' ? 'Found' : 'Scan'} · ${formatDateTimeShort(s.scanned_at)}`,
      color: s.intent === 'found' ? '#dc2626' : '#2563eb'
    }))
)

const waitForAuth = async () => {
  if ((authStore as any).loading) {
    await new Promise<void>((resolve) => {
      const check = () => {
        if (!(authStore as any).loading) resolve()
        else setTimeout(check, 50)
      }
      check()
    })
  }
}

const formatDate = (dateStr: string | null) => {
  if (!dateStr) return 'Unknown'
  const date = new Date(dateStr)
  return date.toLocaleDateString('en-GB', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

const calculateAge = (dateStr: string | null) => {
  if (!dateStr) return ''

  const birthDate = new Date(dateStr)
  const today = new Date()
  let years = today.getFullYear() - birthDate.getFullYear()
  let months = today.getMonth() - birthDate.getMonth()

  if (months < 0) {
    years--
    months += 12
  }

  if (years === 0) {
    return `${months} month${months !== 1 ? 's' : ''} old`
  } else if (months === 0) {
    return `${years} year${years !== 1 ? 's' : ''} old`
  }
  return `${years} year${years !== 1 ? 's' : ''}, ${months} month${months !== 1 ? 's' : ''} old`
}

const formatDateTimeShort = (dateStr: string) => {
  const date = new Date(dateStr)
  return date.toLocaleString('en-GB', {
    day: 'numeric',
    month: 'short',
    hour: 'numeric',
    minute: '2-digit'
  })
}

const formatIntent = (intent: string) => {
  const labels: Record<string, string> = {
    found: 'Found report',
    check_in: 'Check in',
    check_out: 'Check out',
    walk_start: 'Walk started',
    walk_end: 'Walk ended',
    walk: 'Walk',
    test: 'Test'
  }
  return labels[intent] || intent
}

const getAccessToken = async () => {
  const { data: sessionData } = await supabase.auth.getSession()
  return sessionData.session?.access_token || null
}

const renderQr = async (url: string) => {
  qrDataUrl.value = await QRCode.toDataURL(url, {
    width: 448,
    margin: 2,
    errorCorrectionLevel: 'M'
  })
}

const ensureTag = async () => {
  if (!dog.value) return
  tagLoading.value = true
  tagError.value = ''
  try {
    const accessToken = await getAccessToken()
    if (!accessToken) throw new Error('Please log in again to manage tags')

    const result = await $fetch<{
      tag: ActiveTag & { petId: string }
      tagUrl: string
    }>('/.netlify/functions/tag-ensure', {
      method: 'POST',
      headers: { Authorization: `Bearer ${accessToken}` },
      body: { petId: dog.value.id }
    })

    activeTag.value = {
      id: result.tag.id,
      uid: result.tag.uid,
      status: result.tag.status
    }
    tagUrl.value = result.tagUrl || `${baseUrl.value}/dogs/${dog.value.id}`
    await renderQr(tagUrl.value)
    await loadRecentScans()
  } catch (err: any) {
    console.error(err)
    tagError.value = err?.data?.error || err?.message || 'Failed to create tag'
  } finally {
    tagLoading.value = false
  }
}

const copyTagUrl = async () => {
  if (!tagUrl.value) return
  try {
    await navigator.clipboard.writeText(tagUrl.value)
    copied.value = true
    setTimeout(() => { copied.value = false }, 2000)
  } catch {
    tagError.value = 'Could not copy URL'
  }
}

const loadRecentScans = async () => {
  if (!activeTag.value) {
    recentScans.value = []
    return
  }
  const { data } = await supabase
    .from('doghealthy_scans')
    .select('id, scanned_at, ip, latitude, longitude, device, intent, sms_sent_at')
    .eq('tag_id', activeTag.value.id)
    .order('scanned_at', { ascending: false })
    .limit(20)

  recentScans.value = (data || []) as TagScan[]
}

const loadOwnerPhoneHint = async () => {
  if (!authStore.userId) return
  const { data } = await supabase
    .from('doghealthy_users')
    .select('phone')
    .eq('id', authStore.userId)
    .maybeSingle()
  ownerHasPhone.value = !!(data?.phone && /^\+44\d{10}$/.test(String(data.phone).trim()))
}

const loadOwnerTag = async (petId: string) => {
  const { data } = await supabase
    .from('doghealthy_tags')
    .select('id, uid, status')
    .eq('pet_id', petId)
    .eq('status', 'active')
    .maybeSingle()

  if (data) {
    activeTag.value = data
    tagUrl.value = `${baseUrl.value}/dogs/${petId}`
    await renderQr(tagUrl.value)
    await loadRecentScans()
  }
}

const fetchCountsAndActivity = async () => {
  if (!dog.value) return

  try {
    const dogId = dog.value.id

    const { count: healthCount } = await supabase
      .from('doghealthy_health_records')
      .select('*', { count: 'exact', head: true })
      .eq('dog_id', dogId)

    const { data: vaccinations } = await supabase
      .from('doghealthy_vaccinations')
      .select('vaccination_date, next_due_date')
      .eq('dog_id', dogId)

    const { data: medications } = await supabase
      .from('doghealthy_medications')
      .select('is_active')
      .eq('dog_id', dogId)

    const { data: appointments } = await supabase
      .from('doghealthy_appointments')
      .select('appointment_date, status')
      .eq('dog_id', dogId)

    counts.value.healthRecords = healthCount || 0

    const now = new Date()
    counts.value.vaccinationsUpcoming = vaccinations?.filter(v =>
      v.next_due_date && new Date(v.next_due_date) >= now
    ).length || 0
    counts.value.vaccinationsPast = vaccinations?.filter(v =>
      v.vaccination_date && new Date(v.vaccination_date) < now
    ).length || 0

    counts.value.medicationsActive = medications?.filter(m => m.is_active).length || 0
    counts.value.medicationsInactive = medications?.filter(m => !m.is_active).length || 0

    counts.value.appointmentsUpcoming = appointments?.filter(a =>
      new Date(a.appointment_date) >= now && (a.status === 'scheduled' || a.status === 'confirmed')
    ).length || 0
    counts.value.appointmentsPast = appointments?.filter(a =>
      new Date(a.appointment_date) < now || a.status === 'completed' || a.status === 'cancelled'
    ).length || 0
  } catch (err) {
    console.error('Error fetching counts:', err)
  }
}

const getOptionalGeo = (): Promise<{ latitude?: number; longitude?: number; accuracyM?: number }> => {
  return new Promise((resolve) => {
    if (!navigator.geolocation) {
      resolve({})
      return
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        locationShared.value = true
        resolve({
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
          accuracyM: pos.coords.accuracy
        })
      },
      () => resolve({}),
      { enableHighAccuracy: false, timeout: 4000, maximumAge: 60000 }
    )
  })
}

const loadPublicScan = async (petId: string) => {
  const geo = await getOptionalGeo()
  lastGeo.value = geo
  const result = await $fetch<{
    dog: PublicDog
    scanId: string
    onWalk?: boolean
  }>('/.netlify/functions/tag-record-scan', {
    method: 'POST',
    body: {
      petId,
      ...geo
    }
  })

  publicDog.value = result.dog
  lastScanId.value = result.scanId
  onWalk.value = !!result.onWalk
  scanRecorded.value = true
  viewMode.value = 'public'
}

const recordCareAction = async (intent: 'check_in' | 'check_out' | 'walk_start' | 'walk_end') => {
  if (!publicDog.value) return
  careSubmitting.value = true
  careSuccess.value = ''
  careError.value = ''
  try {
    const geo = await getOptionalGeo()
    const result = await $fetch<{
      success: boolean
      message: string
      onWalk?: boolean
    }>('/.netlify/functions/tag-care-action', {
      method: 'POST',
      body: {
        petId: publicDog.value.id,
        intent,
        ...geo
      }
    })
    careSuccess.value = result.message
    if (typeof result.onWalk === 'boolean') onWalk.value = result.onWalk
  } catch (err: any) {
    console.error(err)
    careError.value =
      err?.data?.error || err?.message || 'Could not save that action. Please try again.'
    if (typeof err?.data?.onWalk === 'boolean') onWalk.value = err.data.onWalk
  } finally {
    careSubmitting.value = false
  }
}

const reportFound = async () => {
  if (!publicDog.value) return
  foundSubmitting.value = true
  foundSuccess.value = ''
  foundError.value = ''
  try {
    // Refresh GPS when reporting found (more accurate than initial passive scan)
    const geo = await getOptionalGeo()
    const result = await $fetch<{
      success: boolean
      message: string
      sms?: { sent?: boolean; skipped?: boolean; reason?: string | null }
    }>('/.netlify/functions/tag-report-found', {
      method: 'POST',
      body: {
        petId: publicDog.value.id,
        scanId: lastScanId.value,
        ...geo
      }
    })

    foundSuccess.value = result.message
    if (result.sms?.skipped && result.sms.reason) {
      foundSuccess.value += ` (${result.sms.reason})`
    } else if (result.sms?.sent === false && result.sms?.reason) {
      foundError.value = `Report saved, but SMS failed: ${result.sms.reason}`
    }
  } catch (err: any) {
    console.error(err)
    foundError.value =
      err?.data?.error || err?.message || 'Could not notify the owner. Please try again.'
  } finally {
    foundSubmitting.value = false
  }
}

const bootstrap = async () => {
  loading.value = true
  error.value = ''
  const dogId = route.params.id as string

  try {
    await waitForAuth()

    if (authStore.isAuthenticated && authStore.userId) {
      const { data, error: fetchError } = await supabase
        .from('doghealthy_dogs')
        .select('*')
        .eq('id', dogId)
        .eq('user_id', authStore.userId)
        .maybeSingle()

      if (!fetchError && data) {
        dog.value = data
        viewMode.value = 'owner'
        await Promise.all([fetchCountsAndActivity(), loadOwnerTag(dogId), loadOwnerPhoneHint()])
        return
      }
    }

    // Guest or non-owner: try public scan path
    try {
      await loadPublicScan(dogId)
    } catch (publicErr: any) {
      console.error(publicErr)
      error.value =
        publicErr?.data?.error ||
        publicErr?.message ||
        'This pet profile is not available.'
      viewMode.value = 'error'
    }
  } catch (err: any) {
    console.error(err)
    error.value = err?.message || 'Failed to load dog details'
    viewMode.value = 'error'
  } finally {
    loading.value = false
  }
}

onMounted(bootstrap)

useHead(() => ({
  title: dog.value?.name
    ? `${dog.value.name} | DogHealthy`
    : publicDog.value?.name
      ? `${publicDog.value.name} | DogHealthy`
      : 'Pet Profile | DogHealthy',
  meta: viewMode.value === 'public'
    ? [{ name: 'robots', content: 'noindex' }]
    : []
}))
</script>
