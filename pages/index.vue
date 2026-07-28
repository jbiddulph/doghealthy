<template>
  <div class="min-h-screen bg-gradient-to-b from-blue-50 to-white">
    <!-- Hero Section -->
    <div class="relative overflow-hidden text-white bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700">
      <div
        v-if="heroImage"
        class="absolute inset-0 bg-cover bg-center"
        :style="{ backgroundImage: `url(${heroImage})` }"
        role="img"
        aria-label="Happy dog"
      />
      <div v-else class="absolute inset-0 bg-gradient-to-br from-blue-500 to-blue-700" />

      <!-- Overlay for better text readability -->
      <div class="absolute inset-0 bg-black/40" />

      <!-- Photo credit (only show if Unsplash image is loaded) -->
      <div v-if="heroImage && photoCredit" class="absolute bottom-2 right-2 text-xs text-white/70 z-10">
        Photo by <a :href="photoCredit.authorUrl + '?utm_source=doghealthy&utm_medium=referral'" target="_blank" rel="noopener noreferrer" class="underline hover:text-white">{{ photoCredit.author }}</a> on <a href="https://unsplash.com?utm_source=doghealthy&utm_medium=referral" target="_blank" rel="noopener noreferrer" class="underline hover:text-white">Unsplash</a>
      </div>
      
      <div class="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div class="text-center">
          <h1 class="text-5xl md:text-6xl font-extrabold mb-6">
            <span class="block">Everything Your Dog Needs</span>
            <span class="block text-gray-100">All in One Place</span>
          </h1>
          <p class="inline-flex items-center rounded-full bg-white/15 border border-white/30 px-4 py-1.5 text-sm font-semibold text-white mb-6">
            🇬🇧 UK-only service
          </p>
          <p class="text-xl md:text-2xl text-gray-100 mb-8 max-w-3xl mx-auto">
            Track health records, manage vaccinations, find the perfect food, and keep all your dog's information organised — built for dog owners in the United Kingdom.
          </p>
          
          <div class="flex flex-col sm:flex-row justify-center gap-4 mb-12">
            <NuxtLink
              v-if="!authStore.isAuthenticated"
              to="/auth/register"
              class="bg-white text-blue-700 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-blue-50 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              🐕 Get Started Free
            </NuxtLink>
            <NuxtLink
              v-else
              to="/dogs"
              class="bg-white text-blue-700 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-blue-50 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              🐕 View My Dogs
            </NuxtLink>
            <NuxtLink
              to="/food-finder/quiz"
              class="bg-green-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-green-700 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              🍖 Find Perfect Food
            </NuxtLink>
          </div>
          
          <div class="flex justify-center items-center gap-8 text-gray-100">
            <div class="flex items-center">
              <svg class="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
              </svg>
              <span>100% Free</span>
            </div>
            <div class="flex items-center">
              <svg class="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
              </svg>
              <span>No Credit Card</span>
            </div>
            <div class="flex items-center">
              <svg class="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
              </svg>
              <span>Secure & Private</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- NFC / QR pet tag features -->
    <section class="bg-white border-b border-gray-100">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-20">
        <div class="grid md:grid-cols-2 gap-10 md:gap-14 items-center">
          <div class="order-2 md:order-1">
            <p class="text-sm font-semibold uppercase tracking-wide text-blue-600 mb-3">
              New · NFC &amp; QR pet tags
            </p>
            <h2 class="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Scan the tag. Help the dog. Alert the owner.
            </h2>
            <p class="text-lg text-gray-600 mb-8">
              Encode your dog’s DogHealthy profile on an NFC sticker or QR code. Anyone who taps or scans it can take care actions — and if the dog is lost, the owner can be alerted by SMS.
            </p>
            <ul class="space-y-4 mb-8">
              <li class="flex gap-3">
                <span class="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-emerald-600 text-white text-sm font-bold">1</span>
                <div>
                  <p class="font-semibold text-gray-900">Record a dog walk</p>
                  <p class="text-sm text-gray-600">Start and end a walk with live GPS — the route is saved for the owner to review.</p>
                </div>
              </li>
              <li class="flex gap-3">
                <span class="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-600 text-white text-sm font-bold">2</span>
                <div>
                  <p class="font-semibold text-gray-900">Check in / check out</p>
                  <p class="text-sm text-gray-600">Sitters and walkers can log when they arrive or leave, with approximate location.</p>
                </div>
              </li>
              <li class="flex gap-3">
                <span class="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-red-600 text-white text-sm font-bold">3</span>
                <div>
                  <p class="font-semibold text-gray-900">Report a lost dog</p>
                  <p class="text-sm text-gray-600">Finders share their name and UK mobile — the owner gets an SMS alert with contact details and location when available.</p>
                </div>
              </li>
            </ul>
            <NuxtLink
              :to="authStore.isAuthenticated ? '/dogs' : '/auth/register'"
              class="inline-flex items-center justify-center rounded-lg bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 font-semibold transition-colors"
            >
              {{ authStore.isAuthenticated ? 'Set up a tag for your dog' : 'Get started free' }}
            </NuxtLink>
          </div>
          <div class="order-1 md:order-2">
            <img
              src="/nfc-qr-features.png"
              alt="DogHealthy NFC collar tag and phone showing care actions: check in, check out, start walk, and alert owner"
              width="1024"
              height="1024"
              class="w-full rounded-2xl shadow-xl object-cover"
              loading="lazy"
              decoding="async"
            />
          </div>
        </div>
      </div>
    </section>

    <!-- Features Section -->
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
      <div class="text-center mb-16">
        <h2 class="text-4xl font-bold text-gray-900 mb-4">
          Comprehensive Care for Your Furry Friend
        </h2>
        <p class="text-xl text-gray-600 max-w-3xl mx-auto">
          DogHealthy is your personalized hub for managing every aspect of your dog's health and wellbeing
        </p>
      </div>

      <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
        <!-- Health Records -->
        <div class="bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow border-t-4 border-blue-500 overflow-hidden">
          <div v-if="featureImages.health" class="w-full h-48 overflow-hidden">
            <img
              :src="featureImages.health.url"
              :alt="featureImages.health.description || 'Dog health care'"
              width="640"
              height="384"
              class="w-full h-full object-cover"
              loading="lazy"
              decoding="async"
            />
          </div>
          <div v-else class="w-full h-48 bg-blue-100 flex items-center justify-center text-6xl">
            📋
          </div>
          <div class="p-8">
            <h3 class="text-2xl font-bold text-gray-900 mb-3">Health Records</h3>
          <p class="text-gray-600 mb-4">
            Keep detailed medical history, diagnoses, and treatments all in one secure place. Never lose important health information again. Regular health tracking helps you spot potential issues early and maintain your dog's wellbeing.
          </p>
          <ul class="space-y-2 text-sm text-gray-600">
            <li class="flex items-start">
              <svg class="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
              </svg>
              Complete medical history
            </li>
            <li class="flex items-start">
              <svg class="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
              </svg>
              Diagnosis tracking
            </li>
            <li class="flex items-start">
              <svg class="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
              </svg>
              Treatment notes
            </li>
          </ul>
          </div>
        </div>

        <!-- Vaccinations -->
        <div class="bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow border-t-4 border-purple-500 overflow-hidden">
          <div v-if="featureImages.vaccination" class="w-full h-48 overflow-hidden">
            <img
              :src="featureImages.vaccination.url"
              :alt="featureImages.vaccination.description || 'Dog vaccination'"
              width="640"
              height="384"
              class="w-full h-full object-cover"
              loading="lazy"
              decoding="async"
            />
          </div>
          <div v-else class="w-full h-48 bg-purple-100 flex items-center justify-center text-6xl">
            💉
          </div>
          <div class="p-8">
            <h3 class="text-2xl font-bold text-gray-900 mb-3">Vaccinations</h3>
          <p class="text-gray-600 mb-4">
            Never miss a vaccination with automatic reminders and complete immunization tracking for your dog. Protect your furry friend from preventable diseases with timely vaccinations and boosters.
          </p>
          <ul class="space-y-2 text-sm text-gray-600">
            <li class="flex items-start">
              <svg class="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
              </svg>
              Smart reminders
            </li>
            <li class="flex items-start">
              <svg class="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
              </svg>
              Complete history
            </li>
            <li class="flex items-start">
              <svg class="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
              </svg>
              Due date tracking
            </li>
          </ul>
          </div>
        </div>

        <!-- Medications -->
        <div class="bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow border-t-4 border-pink-500 overflow-hidden">
          <div v-if="featureImages.medication" class="w-full h-48 overflow-hidden">
            <img
              :src="featureImages.medication.url"
              :alt="featureImages.medication.description || 'Dog medication'"
              width="640"
              height="384"
              class="w-full h-full object-cover"
              loading="lazy"
              decoding="async"
            />
          </div>
          <div v-else class="w-full h-48 bg-pink-100 flex items-center justify-center text-6xl">
            💊
          </div>
          <div class="p-8">
            <h3 class="text-2xl font-bold text-gray-900 mb-3">Medications</h3>
          <p class="text-gray-600 mb-4">
            Manage all medications, dosages, and schedules to ensure your dog gets the right treatment at the right time. Proper medication management is crucial for your dog's recovery and long-term health.
          </p>
          <ul class="space-y-2 text-sm text-gray-600">
            <li class="flex items-start">
              <svg class="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
              </svg>
              Dosage tracking
            </li>
            <li class="flex items-start">
              <svg class="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
              </svg>
              Schedule reminders
            </li>
            <li class="flex items-start">
              <svg class="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
              </svg>
              Refill alerts
            </li>
          </ul>
          </div>
        </div>

        <!-- Appointments -->
        <div class="bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow border-t-4 border-green-500 overflow-hidden">
          <div v-if="featureImages.appointment" class="w-full h-48 overflow-hidden">
            <img
              :src="featureImages.appointment.url"
              :alt="featureImages.appointment.description || 'Dog at vet appointment'"
              width="640"
              height="384"
              class="w-full h-full object-cover"
              loading="lazy"
              decoding="async"
            />
          </div>
          <div v-else class="w-full h-48 bg-green-100 flex items-center justify-center text-6xl">
            📅
          </div>
          <div class="p-8">
            <h3 class="text-2xl font-bold text-gray-900 mb-3">Appointments</h3>
          <p class="text-gray-600 mb-4">
            Schedule and track all vet appointments with reminders so you never miss an important checkup. Regular veterinary visits are essential for preventive care and early detection of health issues.
          </p>
          <ul class="space-y-2 text-sm text-gray-600">
            <li class="flex items-start">
              <svg class="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
              </svg>
              Calendar integration
            </li>
            <li class="flex items-start">
              <svg class="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
              </svg>
              Email reminders
            </li>
            <li class="flex items-start">
              <svg class="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
              </svg>
              Visit history
            </li>
          </ul>
          </div>
        </div>

        <!-- Vet Information -->
        <div class="bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow border-t-4 border-red-500 overflow-hidden">
          <div v-if="featureImages.vet" class="w-full h-48 overflow-hidden">
            <img
              :src="featureImages.vet.url"
              :alt="featureImages.vet.description || 'Veterinary clinic'"
              width="640"
              height="384"
              class="w-full h-full object-cover"
              loading="lazy"
              decoding="async"
            />
          </div>
          <div v-else class="w-full h-48 bg-red-100 flex items-center justify-center text-6xl">
            🏥
          </div>
          <div class="p-8">
            <h3 class="text-2xl font-bold text-gray-900 mb-3">Vet Contacts</h3>
          <p class="text-gray-600 mb-4">
            Store all your vet contact information and emergency numbers for quick access when you need them most. Having your veterinarian's details readily available can be crucial during emergencies.
          </p>
          <ul class="space-y-2 text-sm text-gray-600">
            <li class="flex items-start">
              <svg class="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
              </svg>
              Regular vet details
            </li>
            <li class="flex items-start">
              <svg class="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
              </svg>
              Emergency contacts
            </li>
            <li class="flex items-start">
              <svg class="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
              </svg>
              Quick call access
            </li>
          </ul>
          </div>
        </div>

        <!-- Food Finder -->
        <div class="bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow border-t-4 border-yellow-500 overflow-hidden">
          <div v-if="featureImages.food" class="w-full h-48 overflow-hidden">
            <img
              :src="featureImages.food.url"
              :alt="featureImages.food.description || 'Dog food'"
              width="640"
              height="384"
              class="w-full h-full object-cover"
              loading="lazy"
              decoding="async"
            />
          </div>
          <div v-else class="w-full h-48 bg-yellow-100 flex items-center justify-center text-6xl">
            🍖
          </div>
          <div class="p-8">
            <h3 class="text-2xl font-bold text-gray-900 mb-3">Dog Food Finder</h3>
          <p class="text-gray-600 mb-4">
            Compare dog foods and find the perfect match based on your dog's breed, age, and dietary needs. Proper nutrition is fundamental to your dog's health, energy levels, and overall wellbeing.
          </p>
          <ul class="space-y-2 text-sm text-gray-600">
            <li class="flex items-start">
              <svg class="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
              </svg>
              Personalized quiz
            </li>
            <li class="flex items-start">
              <svg class="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
              </svg>
              Price comparison
            </li>
            <li class="flex items-start">
              <svg class="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
              </svg>
              Nutrition analysis
            </li>
          </ul>
          </div>
        </div>

        <!-- Weight Tracking -->
        <div class="bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow border-t-4 border-indigo-500 overflow-hidden">
          <div v-if="featureImages.weight" class="w-full h-48 overflow-hidden">
            <img
              :src="featureImages.weight.url"
              :alt="featureImages.weight.description || 'Dog weight tracking'"
              width="640"
              height="384"
              class="w-full h-full object-cover"
              loading="lazy"
              decoding="async"
            />
          </div>
          <div v-else class="w-full h-48 bg-indigo-100 flex items-center justify-center text-6xl">
            ⚖️
          </div>
          <div class="p-8">
            <h3 class="text-2xl font-bold text-gray-900 mb-3">Weight Tracking</h3>
          <p class="text-gray-600 mb-4">
            Monitor your dog's weight over time with visual charts to ensure they stay healthy and fit. Maintaining a healthy weight helps prevent obesity-related health problems and keeps your dog active and happy.
          </p>
          <ul class="space-y-2 text-sm text-gray-600">
            <li class="flex items-start">
              <svg class="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
              </svg>
              Weight history
            </li>
            <li class="flex items-start">
              <svg class="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
              </svg>
              Visual charts
            </li>
            <li class="flex items-start">
              <svg class="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
              </svg>
              Trend analysis
            </li>
          </ul>
          </div>
        </div>
      </div>
    </div>

    <!-- Food Finder Spotlight -->
    <div class="bg-gradient-to-r from-green-600 to-emerald-700 text-white py-20">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="lg:flex lg:items-center lg:justify-between">
          <div class="lg:w-1/2 mb-8 lg:mb-0">
            <div class="inline-block bg-white/20 text-white px-4 py-1 rounded-full text-sm font-semibold mb-4">
              ✨ NEW FEATURE
            </div>
            <h2 class="text-4xl font-bold mb-4">Find the Perfect Food for Your Dog</h2>
            <p class="text-xl text-green-100 mb-6">
              Take our personalized quiz and get instant recommendations based on your dog's breed, age, and dietary needs.
            </p>
            <ul class="space-y-3 mb-8">
              <li class="flex items-center">
                <svg class="w-6 h-6 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
                </svg>
                <span class="text-lg">Compare prices & nutrition</span>
              </li>
              <li class="flex items-center">
                <svg class="w-6 h-6 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
                </svg>
                <span class="text-lg">Filter by breed size & age</span>
              </li>
              <li class="flex items-center">
                <svg class="w-6 h-6 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
                </svg>
                <span class="text-lg">Grain-free & special diets</span>
              </li>
            </ul>
            <div class="flex gap-4">
              <NuxtLink
                to="/food-finder/quiz"
                class="bg-white text-green-700 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-green-50 transition-all shadow-lg"
              >
                Take the Quiz →
              </NuxtLink>
              <NuxtLink
                to="/food-finder"
                class="bg-green-800 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-green-900 transition-all"
              >
                Browse All Foods
              </NuxtLink>
            </div>
          </div>
          
          <div class="lg:w-1/2 lg:pl-12">
            <div class="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20">
              <h3 class="text-2xl font-bold mb-4">How It Works</h3>
              <div class="space-y-4">
                <div class="flex items-start">
                  <div class="bg-white text-green-700 rounded-full w-10 h-10 flex items-center justify-center font-bold mr-4 flex-shrink-0">
                    1
                  </div>
                  <div>
                    <h4 class="font-semibold text-lg mb-1">Select Your Dog</h4>
                    <p class="text-green-100">Choose from your saved dogs or enter details manually</p>
                  </div>
                </div>
                <div class="flex items-start">
                  <div class="bg-white text-green-700 rounded-full w-10 h-10 flex items-center justify-center font-bold mr-4 flex-shrink-0">
                    2
                  </div>
                  <div>
                    <h4 class="font-semibold text-lg mb-1">Answer 3-5 Questions</h4>
                    <p class="text-green-100">Quick questions about food preferences and budget</p>
                  </div>
                </div>
                <div class="flex items-start">
                  <div class="bg-white text-green-700 rounded-full w-10 h-10 flex items-center justify-center font-bold mr-4 flex-shrink-0">
                    3
                  </div>
                  <div>
                    <h4 class="font-semibold text-lg mb-1">Get Recommendations</h4>
                    <p class="text-green-100">Receive personalized food matches with prices and reviews</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- How It Works -->
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
      <div class="text-center mb-16">
        <h2 class="text-4xl font-bold text-gray-900 mb-4">
          Simple, Secure, and Always Free
        </h2>
        <p class="text-xl text-gray-600">
          Get started in minutes and keep all your dog's information organized forever
        </p>
      </div>

      <div class="grid md:grid-cols-3 gap-12">
        <div class="text-center">
          <div class="w-20 h-20 bg-blue-600 rounded-full flex items-center justify-center text-4xl mx-auto mb-6 shadow-lg">
            🐕
          </div>
          <h3 class="text-xl font-bold text-gray-900 mb-3">Add Your Dogs</h3>
          <p class="text-gray-600">
            Create profiles for all your dogs with photos, breed info, and microchip details
          </p>
        </div>
        
        <div class="text-center">
          <div class="w-20 h-20 bg-purple-600 rounded-full flex items-center justify-center text-4xl mx-auto mb-6 shadow-lg">
            📝
          </div>
          <h3 class="text-xl font-bold text-gray-900 mb-3">Track Everything</h3>
          <p class="text-gray-600">
            Log health records, vaccinations, medications, and appointments all in one place
          </p>
        </div>
        
        <div class="text-center">
          <div class="w-20 h-20 bg-green-600 rounded-full flex items-center justify-center text-4xl mx-auto mb-6 shadow-lg">
            💝
          </div>
          <h3 class="text-xl font-bold text-gray-900 mb-3">Stay Healthy</h3>
          <p class="text-gray-600">
            Get reminders, find the best food, and ensure your furry friend lives their best life
          </p>
        </div>
      </div>
    </div>

    <!-- CTA Section -->
    <div class="bg-gray-900 text-white py-20">
      <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 class="text-4xl font-bold mb-4">
          Ready to Give Your Dog the Best Care?
        </h2>
        <p class="text-xl text-gray-300 mb-8">
          Join thousands of dog owners keeping their pets healthy and happy
        </p>
        <NuxtLink
          v-if="!authStore.isAuthenticated"
          to="/auth/register"
          class="inline-block bg-blue-600 hover:bg-blue-700 text-white font-semibold px-12 py-4 rounded-lg text-xl transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
        >
          Start Free Today →
        </NuxtLink>
        <NuxtLink
          v-else
          to="/dogs"
          class="inline-block bg-blue-600 hover:bg-blue-700 text-white font-semibold px-12 py-4 rounded-lg text-xl transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
        >
          Go to My Dogs →
        </NuxtLink>
        <p class="text-sm text-gray-400 mt-6">
          No credit card required • Free forever • Secure & private
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const authStore = useAuthStore()
const { fetchImageWithFallback } = useUnsplash()

// Fetch hero image from Unsplash
const heroImage = ref('')
const photoCredit = ref<{ author: string; authorUrl: string } | null>(null)

// Feature images
const featureImages = ref<Record<string, { url: string; description?: string; author?: string; authorUrl?: string }>>({})

onMounted(async () => {
  // Hero first (LCP), then feature images in parallel
  try {
    const hero = await fetchImageWithFallback('happy dog', {
      orientation: 'landscape',
      width: 1600,
      height: 900
    })
    if (hero) {
      heroImage.value = hero.url
      photoCredit.value = {
        author: hero.author,
        authorUrl: hero.authorUrl
      }
    }
  } catch {
    console.log('Hero image not available')
  }

  const featureQueries = {
    health: 'dog health checkup veterinary',
    vaccination: 'dog vaccination veterinary care',
    medication: 'dog medication pills',
    appointment: 'dog at veterinarian clinic',
    vet: 'veterinary clinic dog',
    food: 'dog food bowl nutrition',
    weight: 'dog exercise healthy weight'
  }

  const entries = Object.entries(featureQueries)
  const results = await Promise.all(
    entries.map(async ([key, query]) => {
      try {
        const image = await fetchImageWithFallback(query, {
          orientation: 'landscape',
          width: 640,
          height: 384
        })
        return [key, image] as const
      } catch {
        return [key, null] as const
      }
    })
  )

  for (const [key, image] of results) {
    if (image) {
      featureImages.value[key] = {
        url: image.url,
        description: image.description || undefined,
        author: image.author,
        authorUrl: image.authorUrl
      }
    }
  }
})

// SEO Meta tags and structured data
useHead({
  title: 'DogHealthy - UK Dog Health Tracking & Food Finder',
  meta: [
    { name: 'description', content: 'UK-only dog health tracker with medical records, vaccinations, medications, NFC pet tags, found-dog alerts, and food finder. Built for dog owners in the United Kingdom.' },
    { name: 'keywords', content: 'UK dog health tracker, dog medical records, dog vaccinations, dog food finder, pet health management, NFC dog tag UK' },
    { property: 'og:title', content: 'DogHealthy - UK Dog Health Tracking & Food Finder' },
    { property: 'og:description', content: 'UK-only dog health tracker with medical records, vaccinations, NFC tags, and found-pet alerts.' },
    { property: 'og:type', content: 'website' },
    { property: 'og:url', content: 'https://doghealthy.co.uk' },
    { property: 'og:image', content: 'https://doghealthy.co.uk/dog_silhouette_friendly_pose_4MtxY.svg' },
    { name: 'twitter:card', content: 'summary_large_image' },
    { name: 'twitter:title', content: 'DogHealthy - UK Dog Health Tracking & Food Finder' },
    { name: 'twitter:description', content: 'UK-only dog health tracker with medical records, vaccinations, NFC tags, and found-pet alerts.' },
    { name: 'twitter:image', content: 'https://doghealthy.co.uk/dog_silhouette_friendly_pose_4MtxY.svg' }
  ],
  script: [
    {
      type: 'application/ld+json',
      children: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "WebApplication",
        "name": "DogHealthy",
        "description": "UK-only dog health tracking and food finder. Track medical records, vaccinations, medications, appointments, NFC tags, and found-pet alerts.",
        "url": "https://doghealthy.co.uk",
        "applicationCategory": "HealthApplication",
        "operatingSystem": "Web",
        "areaServed": "GB",
        "offers": {
          "@type": "Offer",
          "price": "0",
          "priceCurrency": "GBP"
        },
        "featureList": [
          "Dog Health Records",
          "Vaccination Tracking", 
          "Medication Management",
          "Appointment Scheduling",
          "Dog Food Finder",
          "Weight Tracking",
          "Vet Contact Management"
        ],
        "provider": {
          "@type": "Organization",
          "name": "DogHealthy",
          "url": "https://doghealthy.netlify.app"
        }
      })
    }
  ]
})
</script>

