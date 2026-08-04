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
              width="800"
              height="448"
              class="w-full h-full object-cover"
              loading="eager"
              decoding="async"
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
              DogHealthy is a <strong>UK-only</strong> service. If you have found this dog, alert the owner below with your name and UK mobile. Walkers can check in/out or start a tracked walk (name + number required; GPS updates about every 10 metres).
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
                  :disabled="careSubmitting || walkTracking"
                  @click="recordCareAction('check_in')"
                >
                  Check in
                </button>
                <button
                  type="button"
                  class="bg-slate-700 hover:bg-slate-800 disabled:opacity-60 text-white font-semibold px-4 py-3 rounded-lg"
                  :disabled="careSubmitting || walkTracking"
                  @click="recordCareAction('check_out')"
                >
                  Check out
                </button>
                <button
                  type="button"
                  class="sm:col-span-2 font-semibold px-4 py-3 rounded-lg disabled:opacity-60 text-white"
                  :class="onWalk ? 'bg-orange-600 hover:bg-orange-700' : 'bg-emerald-600 hover:bg-emerald-700'"
                  :disabled="careSubmitting || walkStarting"
                  @click="onWalk ? endWalk() : openWalkModal()"
                >
                  {{ walkStarting || careSubmitting ? 'Saving…' : onWalk ? 'End walk' : 'Start walk' }}
                </button>
              </div>
              <p v-if="onWalk" class="text-sm text-emerald-700">
                Walk in progress for {{ publicDog.name }}
                <span v-if="walkPointCount"> · {{ walkPointCount }} points</span>
                <span v-if="walkDistanceM"> · ~{{ walkDistanceM }} m</span>
                <span v-if="activeWalkerName"> · walker: {{ activeWalkerName }}</span>.
                Keep this page open to record the route.
              </p>
            </div>

            <div v-if="completedWalkRoute.length >= 2" class="mb-6">
              <p class="text-sm font-semibold text-gray-800 mb-2">Walk route just completed</p>
              <WalkRouteMap :token="mapboxToken" :coordinates="completedWalkRoute" />
            </div>

            <div class="border-t border-gray-100 pt-6">
              <p class="text-sm font-semibold text-gray-800 mb-3">Found this dog?</p>
              <button
                type="button"
                class="w-full sm:w-auto bg-red-600 hover:bg-red-700 disabled:opacity-60 text-white font-semibold px-6 py-3 rounded-lg"
                :disabled="foundSubmitting"
                @click="openFoundModal"
              >
                I found this dog — alert owner
              </button>
            </div>

            <p v-if="scanRecorded" class="mt-4 text-xs text-gray-500">
              Scan recorded{{ locationShared ? ' with approximate location' : '' }}.
            </p>
          </div>
        </div>

        <!-- Found contact modal -->
        <div
          v-if="showFoundModal"
          class="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 p-4"
          @click.self="!foundSubmitting && (showFoundModal = false)"
        >
          <div class="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl" @click.stop>
            <h2 class="text-xl font-bold text-gray-900 mb-1">Alert the owner</h2>
            <p class="text-sm text-gray-600 mb-4">
              Please leave your name and UK mobile so they can contact you. DogHealthy is UK-only.
            </p>
            <div
              v-if="foundModalError"
              class="mb-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700"
            >
              {{ foundModalError }}
            </div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Your name</label>
            <input
              v-model="finderForm.name"
              type="text"
              maxlength="80"
              autocomplete="name"
              class="w-full border border-gray-300 rounded-lg px-3 py-2 mb-3"
              placeholder="Full name"
              :disabled="foundSubmitting"
            />
            <label class="block text-sm font-medium text-gray-700 mb-1">UK mobile</label>
            <input
              v-model="finderForm.phone"
              type="tel"
              inputmode="tel"
              autocomplete="tel"
              class="w-full border border-gray-300 rounded-lg px-3 py-2 mb-1"
              placeholder="07XXX XXXXXX"
              :disabled="foundSubmitting"
              @keyup.enter="submitFoundReport"
            />
            <p class="text-xs text-gray-500 mb-4">{{ ukMobileHint(finderForm.phone) }}</p>
            <div class="flex gap-3 justify-end">
              <button
                type="button"
                class="px-4 py-2 text-sm font-medium text-gray-700"
                :disabled="foundSubmitting"
                @click="showFoundModal = false"
              >
                Cancel
              </button>
              <button
                type="button"
                class="bg-red-600 hover:bg-red-700 disabled:opacity-60 text-white font-semibold px-4 py-2 rounded-lg text-sm"
                :disabled="foundSubmitting"
                @click="submitFoundReport"
              >
                {{ foundSubmitting ? 'Sending…' : 'Send alert' }}
              </button>
            </div>
          </div>
        </div>

        <!-- Walk contact modal -->
        <div
          v-if="showWalkModal"
          class="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 p-4"
          @click.self="!walkStarting && (showWalkModal = false)"
        >
          <div class="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl" @click.stop>
            <h2 class="text-xl font-bold text-gray-900 mb-1">Start walk</h2>
            <p class="text-sm text-gray-600 mb-4">
              Enter the walker’s name and UK mobile. We’ll record GPS about every 10 metres until you tap End walk.
            </p>
            <div
              v-if="walkModalError"
              class="mb-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700"
            >
              {{ walkModalError }}
            </div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Walker’s name</label>
            <input
              v-model="walkerForm.name"
              type="text"
              maxlength="80"
              autocomplete="name"
              class="w-full border border-gray-300 rounded-lg px-3 py-2 mb-3"
              placeholder="Full name"
              :disabled="walkStarting"
            />
            <label class="block text-sm font-medium text-gray-700 mb-1">UK mobile</label>
            <input
              v-model="walkerForm.phone"
              type="tel"
              inputmode="tel"
              autocomplete="tel"
              class="w-full border border-gray-300 rounded-lg px-3 py-2 mb-1"
              placeholder="07XXX XXXXXX"
              :disabled="walkStarting"
              @keyup.enter="startWalk"
            />
            <p class="text-xs text-gray-500 mb-4">{{ ukMobileHint(walkerForm.phone) }}</p>
            <div class="flex gap-3 justify-end">
              <button
                type="button"
                class="px-4 py-2 text-sm font-medium text-gray-700"
                :disabled="walkStarting"
                @click="showWalkModal = false"
              >
                Cancel
              </button>
              <button
                type="button"
                class="bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 text-white font-semibold px-4 py-2 rounded-lg text-sm"
                :disabled="walkStarting"
                @click="startWalk"
              >
                {{ walkStarting ? 'Starting…' : 'Start tracking' }}
              </button>
            </div>
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
                width="480"
                height="480"
                class="w-full h-64 md:h-full object-cover"
                loading="eager"
                decoding="async"
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

        <!-- Care shortcuts -->
        <div class="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <NuxtLink
            :to="`/dogs/${dog.id}/health-records`"
            class="inline-flex flex-col items-center justify-center gap-1 rounded-lg bg-blue-600 hover:bg-blue-700 text-white px-4 py-4 text-center shadow-sm transition-colors"
          >
            <i class="bi bi-clipboard2-pulse text-2xl" aria-hidden="true" />
            <span class="font-semibold text-sm leading-tight">Health records</span>
            <span class="text-xs text-blue-100">{{ counts.healthRecords }} records</span>
          </NuxtLink>

          <NuxtLink
            :to="`/dogs/${dog.id}/vaccinations`"
            class="inline-flex flex-col items-center justify-center gap-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-4 text-center shadow-sm transition-colors"
          >
            <svg class="h-7 w-7" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M20.71 3.29a1 1 0 0 0-1.42 0l-1.12 1.12-1.47-1.47a1 1 0 1 0-1.41 1.41l1.47 1.47-8.6 8.6a3 3 0 0 0-.72 1.25l-.9 3.15a1 1 0 0 0 1.23 1.23l3.15-.9a3 3 0 0 0 1.25-.72l8.6-8.6 1.47 1.47a1 1 0 0 0 1.41-1.41l-1.47-1.47 1.12-1.12a1 1 0 0 0 0-1.41zM9.54 17.46l-1.17.33.33-1.17a1 1 0 0 1 .24-.42l.6-.6 1.02 1.02-.6.6a1 1 0 0 1-.42.24zm2.55-1.13-1.02-1.02 6.17-6.17 1.02 1.02-6.17 6.17z"/>
            </svg>
            <span class="font-semibold text-sm leading-tight">Vaccinations</span>
            <span class="text-xs text-emerald-100">{{ counts.vaccinationsUpcoming }} active</span>
          </NuxtLink>

          <NuxtLink
            :to="`/dogs/${dog.id}/medications`"
            class="inline-flex flex-col items-center justify-center gap-1 rounded-lg bg-violet-600 hover:bg-violet-700 text-white px-4 py-4 text-center shadow-sm transition-colors"
          >
            <i class="bi bi-capsule text-2xl" aria-hidden="true" />
            <span class="font-semibold text-sm leading-tight">Medications</span>
            <span class="text-xs text-violet-100">{{ counts.medicationsActive }} active</span>
          </NuxtLink>

          <NuxtLink
            :to="`/dogs/${dog.id}/appointments`"
            class="inline-flex flex-col items-center justify-center gap-1 rounded-lg bg-amber-600 hover:bg-amber-700 text-white px-4 py-4 text-center shadow-sm transition-colors"
          >
            <i class="bi bi-calendar2-event text-2xl" aria-hidden="true" />
            <span class="font-semibold text-sm leading-tight">Appointments</span>
            <span class="text-xs text-amber-100">{{ counts.appointmentsUpcoming }} upcoming</span>
          </NuxtLink>
        </div>

        <!-- QR / NFC tag panel -->
        <div class="bg-white rounded-lg shadow-md p-6">
          <div class="flex flex-wrap items-start justify-between gap-4 mb-4">
            <div>
              <h2 class="text-xl font-semibold text-gray-900">QR / NFC tag</h2>
              <p class="text-sm text-gray-600 mt-1">
                Encode this URL on a QR code or NFC sticker. Anyone who scans it sees {{ dog.name }}’s public found-pet profile.
                Creating a tag also collects your shipping address so we can post a physical NFC chip.
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

          <NfcShippingAddressModal
            :open="showShippingModal"
            :dog-name="dog?.name"
            :dog-id="dog?.id"
            :initial="shippingInitial"
            @cancel="showShippingModal = false"
            @saved="onShippingSaved"
          />

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

        <!-- Check-ins / check-outs -->
        <div class="bg-white rounded-lg shadow-md p-6">
          <div class="flex flex-wrap items-center justify-between gap-3 mb-4">
            <h2 class="text-xl font-semibold text-gray-900">Check-ins & check-outs</h2>
            <button
              type="button"
              class="inline-flex items-center rounded-lg bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white px-3 py-2 text-sm font-semibold"
              :disabled="checkInsLoading"
              @click="loadCheckIns(1)"
            >
              {{ checkInsLoading ? 'Refreshing…' : 'Refresh' }}
            </button>
          </div>

          <div v-if="checkInsLoading && checkIns.length === 0" class="text-gray-600 text-sm">Loading…</div>
          <div v-else-if="checkIns.length === 0" class="text-gray-600 text-sm">
            No check-ins or check-outs yet.
          </div>
          <ul v-else class="space-y-2">
            <li
              v-for="scan in checkIns"
              :key="scan.id"
              class="flex flex-wrap justify-between gap-2 rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm"
            >
              <div>
                <p class="font-semibold text-gray-900">
                  {{ formatDateTimeShort(scan.scanned_at) }}
                  <span
                    class="ml-2 inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold"
                    :class="scan.intent === 'check_in' ? 'bg-blue-100 text-blue-800' : 'bg-slate-200 text-slate-800'"
                  >
                    {{ formatIntent(scan.intent || '') }}
                  </span>
                </p>
                <p class="text-gray-500">{{ scan.device?.platform || 'device unknown' }}</p>
              </div>
              <div class="self-center">
                <CoordMapHover
                  :latitude="scan.latitude"
                  :longitude="scan.longitude"
                  :token="mapboxToken"
                  :color="scan.intent === 'check_in' ? '#2563eb' : '#334155'"
                />
              </div>
            </li>
          </ul>
          <div v-if="checkInsTotalPages > 1" class="mt-4 flex items-center justify-between gap-3">
            <button
              type="button"
              class="rounded-lg bg-slate-700 hover:bg-slate-800 disabled:opacity-40 text-white px-4 py-2 text-sm font-semibold"
              :disabled="checkInsPage <= 1 || checkInsLoading"
              @click="loadCheckIns(checkInsPage - 1)"
            >
              Previous
            </button>
            <span class="text-sm text-gray-600">Page {{ checkInsPage }} of {{ checkInsTotalPages }}</span>
            <button
              type="button"
              class="rounded-lg bg-slate-700 hover:bg-slate-800 disabled:opacity-40 text-white px-4 py-2 text-sm font-semibold"
              :disabled="checkInsPage >= checkInsTotalPages || checkInsLoading"
              @click="loadCheckIns(checkInsPage + 1)"
            >
              Next
            </button>
          </div>
        </div>

        <!-- Recent scans -->
        <div class="bg-white rounded-lg shadow-md p-6">
          <div class="flex flex-wrap items-center justify-between gap-3 mb-4">
            <h2 class="text-xl font-semibold text-gray-900">Recent tag scans</h2>
            <button
              type="button"
              class="inline-flex items-center rounded-lg bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white px-3 py-2 text-sm font-semibold"
              :disabled="scansLoading"
              @click="loadRecentScans(1)"
            >
              {{ scansLoading ? 'Refreshing…' : 'Refresh' }}
            </button>
          </div>

          <div class="mb-6">
            <ScanLocationMap :token="mapboxToken" :points="scanMapPoints" />
          </div>

          <div v-if="!ownerHasPhone" class="mb-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
            Add a UK mobile number on your
            <NuxtLink to="/profile" class="font-semibold underline">profile</NuxtLink>
            so we can SMS you when someone reports finding {{ dog.name }}.
          </div>

          <div v-if="scansLoading && recentScans.length === 0" class="text-gray-600 text-sm">Loading…</div>
          <div v-else-if="recentScans.length === 0" class="text-gray-600 text-sm">
            No scans yet. After someone opens the tag URL, they will appear here.
          </div>
          <ul v-else class="space-y-2">
            <li
              v-for="scan in recentScans"
              :key="scan.id"
              class="flex flex-wrap justify-between gap-2 rounded-lg border border-blue-100 bg-blue-50/60 px-4 py-3 text-sm"
            >
              <div>
                <p class="font-semibold text-gray-900">
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
                <p v-if="scan.finder_name || scan.finder_phone" class="text-gray-700 mt-1">
                  Contact:
                  <span v-if="scan.finder_name">{{ scan.finder_name }}</span>
                  <span v-if="scan.finder_phone"> · {{ scan.finder_phone }}</span>
                </p>
              </div>
              <div class="text-gray-500 self-center">
                <span v-if="scan.latitude != null && scan.longitude != null">
                  {{ Number(scan.latitude).toFixed(4) }}, {{ Number(scan.longitude).toFixed(4) }}
                </span>
                <span v-else>No GPS</span>
              </div>
            </li>
          </ul>
          <div v-if="scansTotalPages > 1" class="mt-4 flex items-center justify-between gap-3">
            <button
              type="button"
              class="rounded-lg bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white px-4 py-2 text-sm font-semibold"
              :disabled="scansPage <= 1 || scansLoading"
              @click="loadRecentScans(scansPage - 1)"
            >
              Previous
            </button>
            <span class="text-sm text-gray-600">Page {{ scansPage }} of {{ scansTotalPages }}</span>
            <button
              type="button"
              class="rounded-lg bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white px-4 py-2 text-sm font-semibold"
              :disabled="scansPage >= scansTotalPages || scansLoading"
              @click="loadRecentScans(scansPage + 1)"
            >
              Next
            </button>
          </div>
        </div>

        <!-- Recent walks -->
        <div class="bg-white rounded-lg shadow-md p-6">
          <div class="flex flex-wrap items-center justify-between gap-3 mb-4">
            <h2 class="text-xl font-semibold text-gray-900">Recent walks</h2>
            <button
              type="button"
              class="inline-flex items-center rounded-lg bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 text-white px-3 py-2 text-sm font-semibold"
              :disabled="walksLoading"
              @click="loadRecentWalks(1)"
            >
              {{ walksLoading ? 'Refreshing…' : 'Refresh' }}
            </button>
          </div>
          <div v-if="walksLoading && recentWalks.length === 0" class="text-gray-600 text-sm">
            Loading walks…
          </div>
          <div v-else-if="recentWalks.length === 0" class="text-gray-600 text-sm">
            No tracked walks yet. When someone starts and ends a walk from the public tag page, the GPS route appears here.
          </div>
          <div v-else class="space-y-4">
            <div
              v-for="walk in recentWalks"
              :key="walk.id"
              class="rounded-lg border border-emerald-100 bg-emerald-50/50 p-4"
            >
              <div class="mb-3 text-sm">
                <p class="font-semibold text-gray-900">
                  {{ formatDateTimeShort(walk.started_at) }}
                  <span v-if="walk.ended_at"> → {{ formatDateTimeShort(walk.ended_at) }}</span>
                  <span
                    class="ml-2 inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold"
                    :class="walk.status === 'completed' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'"
                  >
                    {{ walk.status }}
                  </span>
                </p>
                <p class="text-gray-600">
                  Walker: {{ walk.walker_name || 'Unknown' }}
                  <span v-if="walk.walker_phone"> · {{ walk.walker_phone }}</span>
                </p>
                <p class="text-gray-500">
                  {{ walkRouteCoords(walk.id).length || walk.point_count || 0 }} GPS points
                  <span v-if="walk.distance_m"> · ~{{ Math.round(Number(walk.distance_m)) }} m</span>
                </p>
              </div>
              <WalkRouteMap
                :token="mapboxToken"
                :coordinates="walkRouteCoords(walk.id)"
              />
            </div>
          </div>
          <div v-if="walksTotalPages > 1" class="mt-4 flex items-center justify-between gap-3">
            <button
              type="button"
              class="rounded-lg bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 text-white px-4 py-2 text-sm font-semibold"
              :disabled="walksPage <= 1 || walksLoading"
              @click="loadRecentWalks(walksPage - 1)"
            >
              Previous
            </button>
            <span class="text-sm text-gray-600">Page {{ walksPage }} of {{ walksTotalPages }}</span>
            <button
              type="button"
              class="rounded-lg bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 text-white px-4 py-2 text-sm font-semibold"
              :disabled="walksPage >= walksTotalPages || walksLoading"
              @click="loadRecentWalks(walksPage + 1)"
            >
              Next
            </button>
          </div>
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
import WalkRouteMap from '~/components/WalkRouteMap.vue'
import CoordMapHover from '~/components/CoordMapHover.vue'
import QRCode from 'qrcode'
import { normalizeUkMobile, ukMobileHint } from '~/utils/ukPhone'

const route = useRoute()
const supabase = useSupabase()
const authStore = useAuthStore()
const config = useRuntimeConfig()
const router = useRouter()
const {
  ensureSubscribed,
  markSubscribed,
  clearSubscribedFlag,
  consumePendingAction,
  peekPendingAction,
  checkSubscription
} = usePlanLimits()

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
  finder_name?: string | null
  finder_phone?: string | null
  device: { platform?: string; isMobile?: boolean } | null
}

interface DogWalk {
  id: string
  started_at: string
  ended_at: string | null
  status: string
  point_count: number | null
  distance_m: number | null
  walker_name: string | null
  walker_phone: string | null
}

const WALK_STORAGE_PREFIX = 'dh_walk_'
const WALK_MIN_METERS = 10

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
const foundModalError = ref('')
const showFoundModal = ref(false)
const finderForm = reactive({ name: '', phone: '' })

const careSubmitting = ref(false)
const careSuccess = ref('')
const careError = ref('')
const onWalk = ref(false)
const showWalkModal = ref(false)
const walkModalError = ref('')
const walkStarting = ref(false)
const walkTracking = ref(false)
const walkId = ref<string | null>(null)
const walkClientToken = ref<string | null>(null)
const walkPointCount = ref(0)
const walkDistanceM = ref(0)
const activeWalkerName = ref('')
const walkerForm = reactive({ name: '', phone: '' })
const completedWalkRoute = ref<{ latitude: number; longitude: number }[]>([])
let watchId: number | null = null
let lastWalkPoint: { latitude: number; longitude: number } | null = null

const activeTag = ref<ActiveTag | null>(null)
const tagUrl = ref('')
const qrDataUrl = ref('')
const tagLoading = ref(false)
const tagError = ref('')
const showShippingModal = ref(false)
const shippingInitial = ref<Partial<{
  billing_name: string
  address_line1: string
  address_line2: string
  address_city: string
  address_postcode: string
  address_country: string
  phone: string
}>>({})
const addressConfirmedForCreate = ref(false)
const copied = ref(false)
const PAGE_SIZE = 20

const recentScans = ref<TagScan[]>([])
const scansPage = ref(1)
const scansTotal = ref(0)
const scansLoading = ref(false)
const scansTotalPages = computed(() => Math.max(1, Math.ceil(scansTotal.value / PAGE_SIZE)))

const checkIns = ref<TagScan[]>([])
const checkInsPage = ref(1)
const checkInsTotal = ref(0)
const checkInsLoading = ref(false)
const checkInsTotalPages = computed(() => Math.max(1, Math.ceil(checkInsTotal.value / PAGE_SIZE)))

const recentWalks = ref<DogWalk[]>([])
const walkRoutes = ref<Record<string, { latitude: number; longitude: number }[]>>({})
const walksLoading = ref(false)
const walksPage = ref(1)
const walksTotal = ref(0)
const walksTotalPages = computed(() => Math.max(1, Math.ceil(walksTotal.value / PAGE_SIZE)))
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

const loadShippingProfile = async () => {
  if (!authStore.userId) return null
  const { data } = await supabase
    .from('doghealthy_users')
    .select(
      'full_name, phone, billing_name, address_line1, address_line2, address_city, address_postcode, address_country, nfc_chip_status'
    )
    .eq('id', authStore.userId)
    .maybeSingle()
  return data
}

const openShippingModal = async () => {
  const profile = await loadShippingProfile()
  shippingInitial.value = {
    billing_name: profile?.billing_name || profile?.full_name || '',
    address_line1: profile?.address_line1 || '',
    address_line2: profile?.address_line2 || '',
    address_city: profile?.address_city || '',
    address_postcode: profile?.address_postcode || '',
    address_country: profile?.address_country || 'GB',
    phone: profile?.phone || ''
  }
  showShippingModal.value = true
}

const onShippingSaved = async () => {
  showShippingModal.value = false
  addressConfirmedForCreate.value = true
  await ensureTag({ skipSubscriptionCheck: true, skipAddressCheck: true })
}

const ensureTag = async (options?: { skipSubscriptionCheck?: boolean; skipAddressCheck?: boolean }) => {
  if (!dog.value) return
  tagLoading.value = true
  tagError.value = ''
  try {
    // New tags require a DogHealthy Stripe subscription; refreshing an existing tag does not.
    if (!options?.skipSubscriptionCheck && !activeTag.value) {
      const allowed = await ensureSubscribed({
        reason: 'nfc-tag',
        next: `/dogs/${dog.value.id}?createTag=1`,
        pending: {
          action: 'createTag',
          petId: dog.value.id,
          createdAt: Date.now()
        }
      })
      if (!allowed) return
    }

    // First-time create: collect shipping address so admin can post an NFC chip
    if (!activeTag.value && !options?.skipAddressCheck && !addressConfirmedForCreate.value) {
      tagLoading.value = false
      await openShippingModal()
      return
    }

    const accessToken = await getAccessToken()
    if (!accessToken) throw new Error('Please log in again to manage tags')

    const runEnsure = () =>
      $fetch<{
        tag: ActiveTag & { petId: string }
        tagUrl: string
      }>('/.netlify/functions/tag-ensure', {
        method: 'POST',
        headers: { Authorization: `Bearer ${accessToken}` },
        body: { petId: dog.value!.id }
      })

    let result
    try {
      result = await runEnsure()
    } catch (firstErr: any) {
      const code = firstErr?.data?.code || firstErr?.statusCode
      const needsSub =
        code === 'subscription_required' ||
        firstErr?.statusCode === 402 ||
        firstErr?.data?.statusCode === 402

      // Webhook can lag a few seconds after Stripe checkout success
      if (needsSub && options?.skipSubscriptionCheck) {
        tagError.value = 'Confirming your subscription…'
        for (let attempt = 0; attempt < 6; attempt++) {
          await new Promise((r) => setTimeout(r, 1500))
          const ready = await checkSubscription()
          if (!ready) continue
          try {
            result = await runEnsure()
            tagError.value = ''
            break
          } catch {
            // keep retrying
          }
        }
        if (!result) throw firstErr
      } else if (needsSub) {
        // Server says no sub — clear any stale local flag and go to upgrade
        clearSubscribedFlag()
        await ensureSubscribed({
          reason: 'nfc-tag',
          next: `/dogs/${dog.value.id}?createTag=1`,
          pending: {
            action: 'createTag',
            petId: dog.value.id,
            createdAt: Date.now()
          }
        })
        return
      } else {
        throw firstErr
      }
    }

    activeTag.value = {
      id: result.tag.id,
      uid: result.tag.uid,
      status: result.tag.status
    }
    tagUrl.value = result.tagUrl || `${baseUrl.value}/dogs/${dog.value.id}`
    await renderQr(tagUrl.value)
    addressConfirmedForCreate.value = false
    await Promise.all([loadRecentScans(1), loadCheckIns(1), loadRecentWalks(1)])
  } catch (err: any) {
    console.error(err)
    if (err?.data?.code === 'subscription_required' || err?.statusCode === 402) {
      clearSubscribedFlag()
      await ensureSubscribed({
        reason: 'nfc-tag',
        next: dog.value ? `/dogs/${dog.value.id}?createTag=1` : undefined,
        pending: dog.value
          ? { action: 'createTag', petId: dog.value.id, createdAt: Date.now() }
          : undefined
      })
      return
    }
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

const loadRecentScans = async (page = 1) => {
  if (!activeTag.value) {
    recentScans.value = []
    scansTotal.value = 0
    scansPage.value = 1
    return
  }

  scansLoading.value = true
  scansPage.value = page
  try {
    const from = (page - 1) * PAGE_SIZE
    const to = from + PAGE_SIZE - 1
    const { data, error, count } = await supabase
      .from('doghealthy_scans')
      .select('id, scanned_at, ip, latitude, longitude, device, intent, sms_sent_at, finder_name, finder_phone', {
        count: 'exact'
      })
      .eq('tag_id', activeTag.value.id)
      .not('intent', 'in', '("check_in","check_out")')
      .order('scanned_at', { ascending: false })
      .range(from, to)

    if (error) {
      console.error('loadRecentScans', error)
      recentScans.value = []
      scansTotal.value = 0
      return
    }

    recentScans.value = (data || []) as TagScan[]
    scansTotal.value = count || 0
  } finally {
    scansLoading.value = false
  }
}

const loadCheckIns = async (page = 1) => {
  if (!activeTag.value) {
    checkIns.value = []
    checkInsTotal.value = 0
    checkInsPage.value = 1
    return
  }

  checkInsLoading.value = true
  checkInsPage.value = page
  try {
    const from = (page - 1) * PAGE_SIZE
    const to = from + PAGE_SIZE - 1
    const { data, error, count } = await supabase
      .from('doghealthy_scans')
      .select('id, scanned_at, ip, latitude, longitude, device, intent, sms_sent_at, finder_name, finder_phone', {
        count: 'exact'
      })
      .eq('tag_id', activeTag.value.id)
      .in('intent', ['check_in', 'check_out'])
      .order('scanned_at', { ascending: false })
      .range(from, to)

    if (error) {
      console.error('loadCheckIns', error)
      checkIns.value = []
      checkInsTotal.value = 0
      return
    }

    checkIns.value = (data || []) as TagScan[]
    checkInsTotal.value = count || 0
  } finally {
    checkInsLoading.value = false
  }
}

const walkRouteCoords = (walkId: string) => walkRoutes.value[walkId] || []

const loadRecentWalks = async (page = 1) => {
  if (!dog.value) {
    recentWalks.value = []
    walkRoutes.value = {}
    walksTotal.value = 0
    walksPage.value = 1
    return
  }

  walksLoading.value = true
  walksPage.value = page
  try {
    const from = (page - 1) * PAGE_SIZE
    const to = from + PAGE_SIZE - 1
    const { data, error: walksError, count } = await supabase
      .from('doghealthy_walks')
      .select('id, started_at, ended_at, status, point_count, distance_m, walker_name, walker_phone', {
        count: 'exact'
      })
      .eq('pet_id', dog.value.id)
      .order('started_at', { ascending: false })
      .range(from, to)

    if (walksError) {
      console.error('loadRecentWalks', walksError)
      recentWalks.value = []
      walkRoutes.value = {}
      walksTotal.value = 0
      return
    }

    recentWalks.value = (data || []) as DogWalk[]
    walksTotal.value = count || 0
    const walkIds = recentWalks.value.map((w) => w.id)
    if (walkIds.length === 0) {
      walkRoutes.value = {}
      return
    }

    const { data: points, error: pointsError } = await supabase
      .from('doghealthy_walk_points')
      .select('walk_id, latitude, longitude, sequence')
      .in('walk_id', walkIds)
      .order('sequence', { ascending: true })

    if (pointsError) {
      console.error('loadRecentWalk points', pointsError)
      walkRoutes.value = {}
      return
    }

    const routes: Record<string, { latitude: number; longitude: number }[]> = {}
    for (const id of walkIds) routes[id] = []
    for (const p of points || []) {
      const id = String(p.walk_id)
      if (!routes[id]) routes[id] = []
      routes[id].push({
        latitude: Number(p.latitude),
        longitude: Number(p.longitude)
      })
    }
    walkRoutes.value = routes
  } finally {
    walksLoading.value = false
  }
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
    await Promise.all([loadRecentScans(1), loadCheckIns(1), loadRecentWalks(1)])
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
      { enableHighAccuracy: true, timeout: 8000, maximumAge: 15000 }
    )
  })
}

const distanceMeters = (
  a: { latitude: number; longitude: number },
  b: { latitude: number; longitude: number }
) => {
  const toRad = (d: number) => (d * Math.PI) / 180
  const R = 6371000
  const dLat = toRad(b.latitude - a.latitude)
  const dLon = toRad(b.longitude - a.longitude)
  const lat1 = toRad(a.latitude)
  const lat2 = toRad(b.latitude)
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2
  return 2 * R * Math.asin(Math.sqrt(h))
}

const walkStorageKey = (petId: string) => `${WALK_STORAGE_PREFIX}${petId}`

const saveWalkSession = (petId: string) => {
  if (!walkId.value || !walkClientToken.value) return
  sessionStorage.setItem(
    walkStorageKey(petId),
    JSON.stringify({
      walkId: walkId.value,
      clientToken: walkClientToken.value,
      walkerName: activeWalkerName.value
    })
  )
}

const clearWalkSession = (petId: string) => {
  sessionStorage.removeItem(walkStorageKey(petId))
}

const stopWalkWatch = () => {
  if (watchId != null && navigator.geolocation) {
    navigator.geolocation.clearWatch(watchId)
  }
  watchId = null
  walkTracking.value = false
}

const postWalkPoint = async (geo: { latitude: number; longitude: number; accuracyM?: number }) => {
  if (!publicDog.value || !walkId.value || !walkClientToken.value) return
  try {
    const result = await $fetch<{
      pointCount?: number
      distanceM?: number
      skipped?: boolean
    }>('/.netlify/functions/tag-walk', {
      method: 'POST',
      body: {
        action: 'point',
        petId: publicDog.value.id,
        walkId: walkId.value,
        clientToken: walkClientToken.value,
        ...geo
      }
    })
    if (typeof result.pointCount === 'number') walkPointCount.value = result.pointCount
    if (typeof result.distanceM === 'number') walkDistanceM.value = result.distanceM
    if (!result.skipped) lastWalkPoint = { latitude: geo.latitude, longitude: geo.longitude }
  } catch (err) {
    console.error('walk point failed', err)
  }
}

const startWalkWatch = () => {
  if (!navigator.geolocation) return
  stopWalkWatch()
  walkTracking.value = true
  watchId = navigator.geolocation.watchPosition(
    (pos) => {
      const geo = {
        latitude: pos.coords.latitude,
        longitude: pos.coords.longitude,
        accuracyM: pos.coords.accuracy
      }
      locationShared.value = true
      if (
        lastWalkPoint &&
        distanceMeters(lastWalkPoint, geo) < WALK_MIN_METERS
      ) {
        return
      }
      void postWalkPoint(geo)
    },
    () => {},
    { enableHighAccuracy: true, maximumAge: 5000, timeout: 15000 }
  )
}

const restoreWalkSession = (petId: string) => {
  try {
    const raw = sessionStorage.getItem(walkStorageKey(petId))
    if (!raw) return
    const parsed = JSON.parse(raw) as {
      walkId?: string
      clientToken?: string
      walkerName?: string
    }
    if (!parsed.walkId || !parsed.clientToken) return
    walkId.value = parsed.walkId
    walkClientToken.value = parsed.clientToken
    activeWalkerName.value = parsed.walkerName || ''
    onWalk.value = true
    startWalkWatch()
  } catch {
    clearWalkSession(petId)
  }
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
  restoreWalkSession(petId)
}

const recordCareAction = async (intent: 'check_in' | 'check_out') => {
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

const openFoundModal = () => {
  foundError.value = ''
  foundModalError.value = ''
  showFoundModal.value = true
}

const openWalkModal = () => {
  careError.value = ''
  walkModalError.value = ''
  showWalkModal.value = true
}

const submitFoundReport = async () => {
  if (!publicDog.value) return
  const name = finderForm.name.trim()
  const phone = normalizeUkMobile(finderForm.phone)
  foundModalError.value = ''

  if (name.length < 2) {
    foundModalError.value = 'Please enter your name'
    return
  }
  if (!phone) {
    foundModalError.value =
      'Please enter a valid UK mobile like 07XXX XXXXXX (saved as +44…). Landlines are not accepted.'
    return
  }

  foundSubmitting.value = true
  foundSuccess.value = ''
  foundError.value = ''
  try {
    // Don't block the alert on slow/denied GPS
    const geo = await Promise.race([
      getOptionalGeo(),
      new Promise<{ latitude?: number; longitude?: number; accuracyM?: number }>((resolve) =>
        setTimeout(() => resolve({}), 2500)
      )
    ])
    const result = await $fetch<{
      success: boolean
      message: string
      sms?: { sent?: boolean; skipped?: boolean; reason?: string | null }
    }>('/.netlify/functions/tag-report-found', {
      method: 'POST',
      body: {
        petId: publicDog.value.id,
        scanId: lastScanId.value,
        finderName: name,
        finderPhone: phone,
        ...geo
      }
    })

    showFoundModal.value = false
    foundSuccess.value = result.message
    if (result.sms?.skipped && result.sms.reason) {
      foundSuccess.value += ` (${result.sms.reason})`
    } else if (result.sms?.sent === false && result.sms?.reason) {
      foundError.value = `Report saved, but SMS failed: ${result.sms.reason}`
    }
  } catch (err: any) {
    console.error(err)
    foundModalError.value =
      err?.data?.error || err?.message || 'Could not notify the owner. Please try again.'
  } finally {
    foundSubmitting.value = false
  }
}

const startWalk = async () => {
  if (!publicDog.value) return
  const name = walkerForm.name.trim()
  const phone = normalizeUkMobile(walkerForm.phone)
  walkModalError.value = ''

  if (name.length < 2) {
    walkModalError.value = 'Please enter the walker’s name'
    return
  }
  if (!phone) {
    walkModalError.value =
      'Please enter a valid UK mobile like 07XXX XXXXXX (saved as +44…). Landlines are not accepted.'
    return
  }

  walkStarting.value = true
  careSuccess.value = ''
  careError.value = ''
  completedWalkRoute.value = []
  try {
    const geo = await getOptionalGeo()
    if (geo.latitude == null || geo.longitude == null) {
      throw new Error('Location permission is required to start a walk')
    }
    const result = await $fetch<{
      walkId: string
      clientToken: string
      message: string
      pointCount?: number
      distanceM?: number
      walkerName?: string
    }>('/.netlify/functions/tag-walk', {
      method: 'POST',
      body: {
        action: 'start',
        petId: publicDog.value.id,
        walkerName: name,
        walkerPhone: phone,
        ...geo
      }
    })

    walkId.value = result.walkId
    walkClientToken.value = result.clientToken
    onWalk.value = true
    walkPointCount.value = result.pointCount || 1
    walkDistanceM.value = result.distanceM || 0
    activeWalkerName.value = result.walkerName || name
    lastWalkPoint = { latitude: geo.latitude, longitude: geo.longitude }
    saveWalkSession(publicDog.value.id)
    showWalkModal.value = false
    careSuccess.value = result.message
    startWalkWatch()
  } catch (err: any) {
    console.error(err)
    walkModalError.value =
      err?.data?.error || err?.message || 'Could not start walk. Please try again.'
    if (typeof err?.data?.onWalk === 'boolean') onWalk.value = err.data.onWalk
  } finally {
    walkStarting.value = false
  }
}

const endWalk = async () => {
  if (!publicDog.value || !walkId.value || !walkClientToken.value) {
    // Fallback if session lost but scan says on walk
    careError.value =
      'No active walk session on this device. If a walk was started here, keep the same browser tab open.'
    return
  }

  careSubmitting.value = true
  careSuccess.value = ''
  careError.value = ''
  stopWalkWatch()
  try {
    const geo = await getOptionalGeo()
    const result = await $fetch<{
      message: string
      points?: { latitude: number; longitude: number }[]
      walk?: { point_count?: number; distance_m?: number }
    }>('/.netlify/functions/tag-walk', {
      method: 'POST',
      body: {
        action: 'end',
        petId: publicDog.value.id,
        walkId: walkId.value,
        clientToken: walkClientToken.value,
        ...geo
      }
    })

    onWalk.value = false
    completedWalkRoute.value = result.points || []
    careSuccess.value = result.message
    clearWalkSession(publicDog.value.id)
    walkId.value = null
    walkClientToken.value = null
    activeWalkerName.value = ''
    lastWalkPoint = null
  } catch (err: any) {
    console.error(err)
    careError.value =
      err?.data?.error || err?.message || 'Could not end walk. Please try again.'
    if (onWalk.value) startWalkWatch()
  } finally {
    careSubmitting.value = false
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

        const pending = peekPendingAction()
        const resumeCreateTag =
          route.query.createTag === '1' ||
          route.query.subscription === 'success' ||
          (pending?.action === 'createTag' && pending.petId === dogId)

        if (resumeCreateTag) {
          if (pending?.action === 'createTag' && pending.petId === dogId) {
            consumePendingAction()
          }
          if (route.query.subscription === 'success' || route.query.createTag === '1') {
            markSubscribed()
          }
          await ensureTag({ skipSubscriptionCheck: true })
          const q = { ...route.query } as Record<string, any>
          delete q.createTag
          delete q.subscription
          await router.replace({ path: route.path, query: q })
        }
        return
      }
    }

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

onBeforeUnmount(() => {
  stopWalkWatch()
})

usePageSeo(() => {
  const name = dog.value?.name || publicDog.value?.name
  const isPublic = viewMode.value === 'public'
  const breed = dog.value?.breed || publicDog.value?.breed

  if (name) {
    return {
      title: isPublic
        ? `${name} — DogHealthy Pet Tag Profile`
        : `${name} — Dog Health Profile`,
      description: isPublic
        ? `${name}${breed ? ` (${breed})` : ''} has a DogHealthy NFC / QR tag. If you have found this dog in the UK, use the page tools to alert the owner, check in, or start a walk.`
        : `Manage ${name}’s health on DogHealthy — records, vaccinations, medications, appointments, NFC / QR tag and found-dog alerts for UK owners.`,
      keywords: isPublic
        ? `${name}, found dog UK, NFC dog tag, DogHealthy pet profile, lost dog alert`
        : `${name}, dog health profile, DogHealthy, vaccinations, medications`,
      path: route.path,
      index: false
    }
  }

  return {
    title: 'Pet Profile',
    description:
      'DogHealthy pet profile for UK dog owners — health tracking and NFC / QR found-pet tools.',
    path: route.path,
    index: false
  }
})
</script>
