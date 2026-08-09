<template>
  <div>
    <label class="block text-sm font-medium text-slate-700 mb-1">Search Unsplash images</label>
    <div class="flex gap-2 mb-3">
      <input
        v-model="query"
        type="search"
        class="flex-1 px-3 py-2 border border-slate-300 rounded-lg text-sm"
        placeholder="e.g. dog nutrition, puppy training, vet visit"
        @keyup.enter="search"
      />
      <button
        type="button"
        class="px-4 py-2 bg-slate-900 text-white rounded-lg text-sm font-semibold disabled:opacity-60"
        :disabled="searching || !query.trim()"
        @click="search"
      >
        {{ searching ? 'Searching…' : 'Search' }}
      </button>
    </div>
    <p v-if="error" class="text-sm text-red-600 mb-2">{{ error }}</p>
    <p v-if="fallback && results.length" class="text-xs text-slate-500 mb-2">
      Showing fallback photos — Unsplash search may be rate-limited.
    </p>
    <div v-if="results.length" class="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-3">
      <button
        v-for="img in results"
        :key="img.id"
        type="button"
        class="relative overflow-hidden rounded-lg border-2 text-left"
        :class="modelValue?.url === img.url ? 'border-amber-500 ring-2 ring-amber-200' : 'border-transparent hover:border-slate-300'"
        @click="$emit('update:modelValue', img)"
      >
        <img :src="img.thumb" :alt="img.description || ''" class="w-full h-24 object-cover" />
      </button>
    </div>
    <div v-if="modelValue?.url" class="rounded-lg border border-slate-200 overflow-hidden">
      <img :src="modelValue.url" :alt="modelValue.description || 'Selected'" class="w-full h-40 object-cover" />
      <p class="px-3 py-2 text-xs text-slate-500">
        Selected · Photo by
        <a :href="modelValue.authorUrl" target="_blank" rel="noopener noreferrer" class="underline">{{ modelValue.author }}</a>
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { UnsplashSearchResult } from '~/composables/useUnsplash'

const props = defineProps<{
  modelValue: UnsplashSearchResult | null
  suggestedQuery?: string
}>()

defineEmits<{
  'update:modelValue': [value: UnsplashSearchResult]
}>()

const { searchPhotos } = useUnsplash()
const query = ref(props.suggestedQuery?.trim() || 'happy dog')
const searching = ref(false)
const error = ref('')
const fallback = ref(false)
const results = ref<UnsplashSearchResult[]>([])

const search = async () => {
  error.value = ''
  searching.value = true
  try {
    const data = await searchPhotos(query.value.trim() || 'happy dog', 12)
    results.value = data.results
    fallback.value = data.fallback
    if (!results.value.length) error.value = 'No images found. Try another search.'
  } catch (err: any) {
    error.value = err?.data?.error || err?.message || 'Image search failed'
    results.value = []
  } finally {
    searching.value = false
  }
}

watch(
  () => props.suggestedQuery,
  (next) => {
    if (!props.modelValue && next?.trim()) query.value = next.trim()
  }
)

onMounted(search)
</script>
