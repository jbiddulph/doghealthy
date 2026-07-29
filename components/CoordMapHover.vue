<template>
  <span
    v-if="latitude == null || longitude == null"
    class="text-gray-500"
  >
    No GPS
  </span>
  <span
    v-else
    class="relative inline-flex"
    @mouseenter="open"
    @mouseleave="scheduleClose"
    @focusin="open"
    @focusout="scheduleClose"
  >
    <button
      type="button"
      class="text-blue-600 hover:text-blue-800 underline decoration-dotted underline-offset-2 font-medium tabular-nums"
      :aria-expanded="visible"
      :aria-label="`Show map for ${label}`"
      @click.prevent="toggle"
    >
      {{ label }}
    </button>

    <div
      v-show="visible"
      class="absolute right-0 top-full z-40 mt-2 w-64 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-xl"
      @mouseenter="cancelClose"
      @mouseleave="scheduleClose"
    >
      <div v-if="!token" class="px-3 py-4 text-xs text-amber-800 bg-amber-50">
        Mapbox token not configured.
      </div>
      <div
        v-else
        ref="mapEl"
        class="h-40 w-full bg-gray-100"
      />
      <div class="border-t border-gray-100 px-3 py-2 text-xs text-gray-600">
        {{ label }}
      </div>
    </div>
  </span>
</template>

<script setup lang="ts">
import { nextTick, onBeforeUnmount, ref, watch } from 'vue'
import mapboxgl from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css'

const props = defineProps<{
  latitude: number | null | undefined
  longitude: number | null | undefined
  token?: string
  color?: string
}>()

const visible = ref(false)
const mapEl = ref<HTMLElement | null>(null)
let map: mapboxgl.Map | null = null
let marker: mapboxgl.Marker | null = null
let closeTimer: ReturnType<typeof setTimeout> | null = null

const label = computed(() => {
  if (props.latitude == null || props.longitude == null) return 'No GPS'
  return `${Number(props.latitude).toFixed(4)}, ${Number(props.longitude).toFixed(4)}`
})

const cancelClose = () => {
  if (closeTimer) {
    clearTimeout(closeTimer)
    closeTimer = null
  }
}

const destroyMap = () => {
  marker?.remove()
  marker = null
  map?.remove()
  map = null
}

const initMap = async () => {
  if (!props.token || props.latitude == null || props.longitude == null) return
  await nextTick()
  if (!mapEl.value) return

  const lng = Number(props.longitude)
  const lat = Number(props.latitude)

  if (map) {
    map.setCenter([lng, lat])
    marker?.setLngLat([lng, lat])
    map.resize()
    return
  }

  map = new mapboxgl.Map({
    accessToken: props.token,
    container: mapEl.value,
    style: 'mapbox://styles/mapbox/streets-v12',
    center: [lng, lat],
    zoom: 14,
    interactive: false,
    attributionControl: false
  })

  marker = new mapboxgl.Marker({ color: props.color || '#2563eb' })
    .setLngLat([lng, lat])
    .addTo(map)

  map.on('load', () => map?.resize())
}

const open = async () => {
  cancelClose()
  visible.value = true
  await initMap()
}

const scheduleClose = () => {
  cancelClose()
  closeTimer = setTimeout(() => {
    visible.value = false
  }, 180)
}

const toggle = async () => {
  if (visible.value) {
    visible.value = false
    return
  }
  await open()
}

watch(
  () => [props.latitude, props.longitude, props.token],
  () => {
    if (visible.value) void initMap()
  }
)

onBeforeUnmount(() => {
  cancelClose()
  destroyMap()
})
</script>
