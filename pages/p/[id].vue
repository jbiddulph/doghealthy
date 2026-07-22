<template>
  <div class="min-h-screen bg-gradient-to-b from-blue-50 to-white">
    <div class="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div v-if="loading" class="text-center py-16">
        <div class="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <p class="mt-4 text-gray-600">Loading pet profile...</p>
      </div>

      <div v-else-if="error" class="bg-white rounded-xl shadow-md p-8 text-center">
        <div class="text-5xl mb-4">🐕</div>
        <h1 class="text-2xl font-bold text-gray-900 mb-2">Pet profile unavailable</h1>
        <p class="text-gray-600 mb-6">{{ error }}</p>
        <NuxtLink to="/" class="text-blue-600 hover:text-blue-700 font-medium">
          Go to DogHealthy
        </NuxtLink>
      </div>

      <div v-else-if="dog" class="bg-white rounded-2xl shadow-lg overflow-hidden">
        <div class="h-56 bg-gray-100">
          <img
            v-if="dog.photo_url"
            :src="dog.photo_url"
            :alt="dog.name"
            class="w-full h-full object-cover"
          />
          <div v-else class="w-full h-full flex items-center justify-center text-7xl">🐕</div>
        </div>

        <div class="p-8">
          <p class="text-sm font-semibold text-blue-600 mb-2">NFC Pet Profile</p>
          <h1 class="text-3xl font-bold text-gray-900 mb-2">{{ dog.name }}</h1>
          <p v-if="dog.breed" class="text-lg text-gray-600 mb-6">{{ dog.breed }}</p>

          <div class="grid sm:grid-cols-2 gap-4 mb-6">
            <div v-if="dog.gender" class="bg-gray-50 rounded-lg p-4">
              <p class="text-xs uppercase tracking-wide text-gray-500">Gender</p>
              <p class="font-medium text-gray-900 capitalize">{{ dog.gender }}</p>
            </div>
            <div v-if="dog.color" class="bg-gray-50 rounded-lg p-4">
              <p class="text-xs uppercase tracking-wide text-gray-500">Colour</p>
              <p class="font-medium text-gray-900">{{ dog.color }}</p>
            </div>
            <div v-if="dog.microchip_number" class="bg-gray-50 rounded-lg p-4 sm:col-span-2">
              <p class="text-xs uppercase tracking-wide text-gray-500">Microchip</p>
              <p class="font-mono text-sm text-gray-900">{{ dog.microchip_number }}</p>
            </div>
          </div>

          <div v-if="dog.notes" class="mb-6">
            <p class="text-sm font-medium text-gray-500 mb-1">Owner notes</p>
            <p class="text-gray-800 whitespace-pre-wrap">{{ dog.notes }}</p>
          </div>

          <div class="rounded-xl bg-amber-50 border border-amber-200 p-4 text-sm text-amber-900">
            If you have found this dog, please contact the owner using the details they have shared,
            or take them to a local vet/rescue so the microchip can be checked.
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const route = useRoute()
const supabase = useSupabase()

const dog = ref<{
  id: string
  name: string
  breed: string | null
  gender: string | null
  color: string | null
  microchip_number: string | null
  photo_url: string | null
  notes: string | null
} | null>(null)
const loading = ref(true)
const error = ref('')

onMounted(async () => {
  try {
    const id = route.params.id as string
    const { data, error: fetchError } = await supabase
      .from('doghealthy_dogs')
      .select('id, name, breed, gender, color, microchip_number, photo_url, notes, nfc_tag_enabled, is_active')
      .eq('id', id)
      .eq('nfc_tag_enabled', true)
      .eq('is_active', true)
      .single()

    if (fetchError || !data) {
      error.value = 'This NFC pet profile is not available.'
      return
    }

    dog.value = data
  } catch (err: any) {
    error.value = err?.message || 'Failed to load pet profile'
  } finally {
    loading.value = false
  }
})

useHead({
  title: dog.value?.name ? `${dog.value.name} | DogHealthy NFC` : 'Pet Profile | DogHealthy',
  meta: [
    { name: 'robots', content: 'noindex' }
  ]
})
</script>
