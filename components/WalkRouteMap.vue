<template>
  <div>
    <div
      v-if="!token"
      class="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900"
    >
      Mapbox is not configured. Set <code class="text-xs">NUXT_PUBLIC_MAPBOX_TOKEN</code> to show walk routes.
    </div>
    <div
      v-else-if="coordinates.length < 2"
      class="rounded-lg border border-gray-200 bg-gray-50 px-4 py-8 text-center text-sm text-gray-600"
    >
      {{
        coordinates.length === 1
          ? 'Only one GPS point recorded for this walk — keep walking to build a route.'
          : 'No GPS route points recorded for this walk yet.'
      }}
    </div>
    <div
      v-show="token && coordinates.length >= 2"
      ref="mapEl"
      class="w-full h-72 rounded-lg overflow-hidden border border-gray-200"
    />
  </div>
</template>

<script setup lang="ts">
import { nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import mapboxgl from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css'

export interface WalkCoord {
  latitude: number
  longitude: number
}

const props = defineProps<{
  coordinates: WalkCoord[]
  token?: string
  lineColor?: string
}>()

const mapEl = ref<HTMLElement | null>(null)
let map: mapboxgl.Map | null = null
let startMarker: mapboxgl.Marker | null = null
let endMarker: mapboxgl.Marker | null = null

const sourceId = 'walk-route'
const layerId = 'walk-route-line'

const clearMarkers = () => {
  startMarker?.remove()
  endMarker?.remove()
  startMarker = null
  endMarker = null
}

const destroyMap = () => {
  clearMarkers()
  if (map?.getLayer(layerId)) map.removeLayer(layerId)
  if (map?.getSource(sourceId)) map.removeSource(sourceId)
  map?.remove()
  map = null
}

const renderRoute = () => {
  if (!map || props.coordinates.length < 2) return

  const line = props.coordinates.map((c) => [c.longitude, c.latitude] as [number, number])
  const geojson: GeoJSON.Feature<GeoJSON.LineString> = {
    type: 'Feature',
    properties: {},
    geometry: { type: 'LineString', coordinates: line }
  }

  if (map.getSource(sourceId)) {
    ;(map.getSource(sourceId) as mapboxgl.GeoJSONSource).setData(geojson)
  } else {
    map.addSource(sourceId, { type: 'geojson', data: geojson })
    map.addLayer({
      id: layerId,
      type: 'line',
      source: sourceId,
      layout: { 'line-join': 'round', 'line-cap': 'round' },
      paint: {
        'line-color': props.lineColor || '#059669',
        'line-width': 4
      }
    })
  }

  clearMarkers()
  const first = props.coordinates[0]
  const last = props.coordinates[props.coordinates.length - 1]
  startMarker = new mapboxgl.Marker({ color: '#059669' })
    .setLngLat([first.longitude, first.latitude])
    .setPopup(new mapboxgl.Popup({ offset: 16 }).setText('Start'))
    .addTo(map)
  endMarker = new mapboxgl.Marker({ color: '#dc2626' })
    .setLngLat([last.longitude, last.latitude])
    .setPopup(new mapboxgl.Popup({ offset: 16 }).setText('End'))
    .addTo(map)

  const bounds = new mapboxgl.LngLatBounds()
  for (const c of props.coordinates) bounds.extend([c.longitude, c.latitude])
  map.fitBounds(bounds, { padding: 48, maxZoom: 15 })
  map.resize()
}

const initMap = async () => {
  if (!props.token || props.coordinates.length < 2) return
  await nextTick()
  if (!mapEl.value) return

  if (map) {
    renderRoute()
    return
  }

  map = new mapboxgl.Map({
    accessToken: props.token,
    container: mapEl.value,
    style: 'mapbox://styles/mapbox/streets-v12',
    center: [props.coordinates[0].longitude, props.coordinates[0].latitude],
    zoom: 13
  })
  map.addControl(new mapboxgl.NavigationControl({ showCompass: false }), 'top-right')
  map.on('load', () => {
    renderRoute()
  })
}

onMounted(() => {
  void initMap()
})

watch(
  () =>
    [
      props.token || '',
      props.coordinates.length,
      props.coordinates.map((c) => `${c.latitude.toFixed(5)},${c.longitude.toFixed(5)}`).join('|')
    ].join('::'),
  async () => {
    if (!props.token || props.coordinates.length < 2) {
      destroyMap()
      return
    }
    await initMap()
    if (map?.isStyleLoaded()) renderRoute()
    else map?.once('load', renderRoute)
  }
)

onBeforeUnmount(() => {
  destroyMap()
})
</script>
