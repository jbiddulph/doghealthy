<template>
  <footer class="bg-gray-900 text-white">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div class="grid md:grid-cols-4 gap-8">
        <!-- About Section -->
        <div>
          <h3 class="text-lg font-semibold mb-4">DogHealthy</h3>
          <p class="text-gray-400 text-sm">
            Your complete solution for managing your dog's health, vaccinations, medications, and appointments all in one place.
          </p>
        </div>

        <!-- Quick Links -->
        <div>
          <h3 class="text-lg font-semibold mb-4">Quick Links</h3>
          <ul class="space-y-2 text-sm">
            <li>
              <NuxtLink to="/" class="text-gray-400 hover:text-white transition-colors">
                Home
              </NuxtLink>
            </li>
            <li>
              <NuxtLink to="/dogs" class="text-gray-400 hover:text-white transition-colors">
                My Dogs
              </NuxtLink>
            </li>
            <li>
              <NuxtLink to="/food-finder" class="text-gray-400 hover:text-white transition-colors">
                Food Finder
              </NuxtLink>
            </li>
            <li>
              <NuxtLink to="/food-finder/quiz" class="text-gray-400 hover:text-white transition-colors">
                Food Quiz
              </NuxtLink>
            </li>
          </ul>
        </div>

        <!-- Features -->
        <div>
          <h3 class="text-lg font-semibold mb-4">Features</h3>
          <ul class="space-y-2 text-sm text-gray-400">
            <li>📋 Health Records</li>
            <li>💉 Vaccinations</li>
            <li>💊 Medications</li>
            <li>📅 Appointments</li>
            <li>🏥 Vet Contacts</li>
            <li>🍖 Food Finder</li>
          </ul>
        </div>

        <!-- Contact & Legal -->
        <div>
          <h3 class="text-lg font-semibold mb-4">Information</h3>
          <ul class="space-y-2 text-sm">
            <li class="text-gray-400">
              100% Free
            </li>
            <li class="text-gray-400">
              No Credit Card Required
            </li>
            <li class="text-gray-400">
              Secure & Private
            </li>
          </ul>
        </div>
      </div>

      <!-- Bottom Bar -->
      <div class="border-t border-gray-800 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
        <p class="text-gray-400 text-sm">
          © {{ currentYear }} DogHealthy. All rights reserved.
        </p>
        <div class="flex space-x-6 mt-4 md:mt-0">
          <a href="#" class="text-gray-400 hover:text-white text-sm transition-colors">
            Privacy Policy
          </a>
          <a href="#" class="text-gray-400 hover:text-white text-sm transition-colors">
            Terms of Service
          </a>
          <a href="#" class="text-gray-400 hover:text-white text-sm transition-colors">
            Contact
          </a>
        </div>
      </div>
    </div>
  </footer>
</template>

<script setup lang="ts">
const currentYear = new Date().getFullYear()
</script>

