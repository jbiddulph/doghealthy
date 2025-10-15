<template>
  <div class="min-h-screen bg-gradient-to-b from-blue-50 to-white">
    <!-- Hero Section -->
    <div class="relative overflow-hidden text-white bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700">
      <!-- Dynamic Background Image (if available) -->
      <div
        v-if="heroImage"
        class="absolute inset-0 bg-cover bg-center"
        :style="{ backgroundImage: `url(${heroImage})` }"
      ></div>
      
      <!-- Simple Fallback Background -->
      <div v-else class="absolute inset-0 bg-gradient-to-br from-blue-500 to-blue-700"></div>
      
      <!-- Overlay for better text readability -->
      <div class="absolute inset-0 bg-black opacity-20"></div>
      
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
          <p class="text-xl md:text-2xl text-gray-100 mb-8 max-w-3xl mx-auto">
            Track health records, manage vaccinations, find the perfect food, and keep all your dog's information organized
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
        <div class="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow border-t-4 border-blue-500">
          <div class="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center text-3xl mb-4">
            📋
          </div>
          <h3 class="text-2xl font-bold text-gray-900 mb-3">Health Records</h3>
          <p class="text-gray-600 mb-4">
            Keep detailed medical history, diagnoses, and treatments all in one secure place. Never lose important health information again.
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

        <!-- Vaccinations -->
        <div class="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow border-t-4 border-purple-500">
          <div class="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center text-3xl mb-4">
            💉
          </div>
          <h3 class="text-2xl font-bold text-gray-900 mb-3">Vaccinations</h3>
          <p class="text-gray-600 mb-4">
            Never miss a vaccination with automatic reminders and complete immunization tracking for your dog.
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

        <!-- Medications -->
        <div class="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow border-t-4 border-pink-500">
          <div class="w-16 h-16 bg-pink-100 rounded-full flex items-center justify-center text-3xl mb-4">
            💊
          </div>
          <h3 class="text-2xl font-bold text-gray-900 mb-3">Medications</h3>
          <p class="text-gray-600 mb-4">
            Manage all medications, dosages, and schedules to ensure your dog gets the right treatment at the right time.
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

        <!-- Appointments -->
        <div class="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow border-t-4 border-green-500">
          <div class="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center text-3xl mb-4">
            📅
          </div>
          <h3 class="text-2xl font-bold text-gray-900 mb-3">Appointments</h3>
          <p class="text-gray-600 mb-4">
            Schedule and track all vet appointments with reminders so you never miss an important checkup.
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

        <!-- Vet Information -->
        <div class="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow border-t-4 border-red-500">
          <div class="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center text-3xl mb-4">
            🏥
          </div>
          <h3 class="text-2xl font-bold text-gray-900 mb-3">Vet Contacts</h3>
          <p class="text-gray-600 mb-4">
            Store all your vet contact information and emergency numbers for quick access when you need them most.
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

        <!-- Food Finder -->
        <div class="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow border-t-4 border-yellow-500">
          <div class="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center text-3xl mb-4">
            🍖
          </div>
          <h3 class="text-2xl font-bold text-gray-900 mb-3">Dog Food Finder</h3>
          <p class="text-gray-600 mb-4">
            Compare dog foods and find the perfect match based on your dog's breed, age, and dietary needs.
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

        <!-- Weight Tracking -->
        <div class="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow border-t-4 border-indigo-500">
          <div class="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center text-3xl mb-4">
            ⚖️
          </div>
          <h3 class="text-2xl font-bold text-gray-900 mb-3">Weight Tracking</h3>
          <p class="text-gray-600 mb-4">
            Monitor your dog's weight over time with visual charts to ensure they stay healthy and fit.
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

// Fetch hero image from Unsplash
const heroImage = ref('')
const photoCredit = ref<{ author: string; authorUrl: string } | null>(null)

onMounted(async () => {
  // Try to load random dog image using your actual API key
  try {
    const config = useRuntimeConfig()
    const accessKey = config.public.unsplashAccessKey
    
    if (!accessKey) {
      throw new Error('No Unsplash access key configured')
    }
    
    const response = await fetch(
      'https://api.unsplash.com/photos/random?query=dog&orientation=landscape&w=1920&h=1080',
      {
        headers: {
          'Authorization': `Client-ID ${accessKey}`,
          'Accept-Version': 'v1'
        }
      }
    )

    if (response.ok) {
      const data = await response.json()
      
      // Test if the image loads successfully
      const img = new Image()
      img.onload = () => {
        heroImage.value = data.urls.regular
        photoCredit.value = {
          author: data.user.name,
          authorUrl: data.user.links.html
        }
        console.log('Successfully loaded random dog image from Unsplash API')
      }
      img.onerror = () => {
        throw new Error('Image failed to load')
      }
      img.src = data.urls.regular
      
    } else {
      throw new Error('Unsplash API error')
    }
  } catch (error) {
    console.log('Unsplash API not available, using clean blue gradient')
    // Fallback to clean blue gradient
    heroImage.value = ''
    photoCredit.value = null
  }
})

// SEO Meta tags and structured data
useHead({
  title: 'DogHealthy - Complete Health Tracking & Food Finder for Your Dog',
  meta: [
    { name: 'description', content: 'Free dog health tracker with medical records, vaccinations, medications, appointments, and intelligent food finder. Everything your dog needs in one place.' },
    { name: 'keywords', content: 'dog health tracker, dog medical records, dog vaccinations, dog food finder, pet health management, dog care app' },
    { property: 'og:title', content: 'DogHealthy - Complete Health Tracking & Food Finder for Your Dog' },
    { property: 'og:description', content: 'Free dog health tracker with medical records, vaccinations, medications, appointments, and intelligent food finder.' },
    { property: 'og:type', content: 'website' },
    { property: 'og:url', content: 'https://doghealthy.netlify.app' },
    { property: 'og:image', content: 'https://doghealthy.netlify.app/dog_silhouette_friendly_pose_4MtxY.svg' },
    { name: 'twitter:card', content: 'summary_large_image' },
    { name: 'twitter:title', content: 'DogHealthy - Complete Health Tracking & Food Finder' },
    { name: 'twitter:description', content: 'Free dog health tracker with medical records, vaccinations, medications, appointments, and intelligent food finder.' },
    { name: 'twitter:image', content: 'https://doghealthy.netlify.app/dog_silhouette_friendly_pose_4MtxY.svg' }
  ],
  script: [
    {
      type: 'application/ld+json',
      children: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "WebApplication",
        "name": "DogHealthy",
        "description": "Complete health tracking and food finder for your dog. Track medical records, vaccinations, medications, appointments, and find the perfect food.",
        "url": "https://doghealthy.netlify.app",
        "applicationCategory": "HealthApplication",
        "operatingSystem": "Web",
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

