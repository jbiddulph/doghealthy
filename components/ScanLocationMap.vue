<template>
  <div>
    <div
      v-if="!token"
      class="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900"
    >
      Mapbox is not configured. Set <code class="text-xs">NUXT_PUBLIC_MAPBOX_TOKEN</code> to show scan locations on a map.
    </div>
    <div
      v-else-if="points.length === 0"
      class="rounded-lg border border-gray-200 bg-gray-50 px-4 py-8 text-center text-sm text-gray-600"
    >
      No scan locations with GPS yet.
    </div>
    <div v-else ref="mapEl" class="w-full h-72 rounded-lg overflow-hidden border border-gray-200" />
  </div>
</template>

<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, watch } from 'vue'
import mapboxgl from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css'

export interface ScanMapPoint {
  id: string
  latitude: number
  longitude: number
  label?: string
  color?: string
}

const props = defineProps<{
  points: ScanMapPoint[]
  token?: string
}>()

const mapEl = ref<HTMLElement | null>(null)
let map: mapboxgl.Map | null = null
let markers: mapboxgl.Marker[] = []

const clearMarkers = () => {
  markers.forEach((m) => m.remove())
  markers = []
}

const renderMarkers = () => {
  if (!map) return
  clearMarkers()

  const bounds = new mapboxgl.LngLatBounds()
  for (const point of props.points) {
    const color = point.color || '#2563eb'
    const marker = new mapboxgl.Marker({ color })
      .setLngLat([point.longitude, point.latitude])
      .setPopup(
        new mapboxgl.Popup({ offset: 16 }).setText(point.label || 'Scan')
      )
      .addTo(map)
    markers.push(marker)
    bounds.extend([point.longitude, point.latitude])
  }

  if (props.points.length === 1) {
    map.flyTo({
      center: [props.points[0].longitude, props.points[0].latitude],
      zoom: 13
    })
  } else if (props.points.length > 1) {
    map.fitBounds(bounds, { padding: 48, maxZoom: 14 })
  }
}

const initMap = () => {
  if (!props.token || !mapEl.value || props.points.length === 0) return

  map = new mapboxgl.Map({
    accessToken: props.token,
    container: mapEl.value,
    style: 'mapbox://styles/mapbox/streets-v12',
    center: [props.points[0].longitude, props.points[0].latitude],
    zoom: 12
  })
  map.addControl(new mapboxgl.NavigationControl({ showCompass: false }), 'top-right')
  map.on('load', renderMarkers)
}

onMounted(() => {
  initMap()
})

watch(
  () => [props.token, props.points.map((p) => p.id).join('|')],
  () => {
    if (!map) {
      initMap()
      return
    }
    renderMarkers()
  }
)

onBeforeUnmount(() => {
  clearMarkers()
  map?.remove()
  map = null
})
</script>
