<template>
  <footer class="bg-gray-900 text-white">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div class="grid md:grid-cols-4 gap-8">
        <!-- About Section -->
        <div>
          <h3 class="text-lg font-semibold mb-4">DogHealthy</h3>
          <p class="text-gray-400 text-sm">
            Your complete UK-only solution for managing your dog's health, vaccinations, medications, NFC tags, and found-pet alerts.
          </p>
          <p class="text-gray-500 text-xs mt-3">
            United Kingdom only · UK mobile numbers (+44)
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
            <li>
              <NuxtLink to="/news" class="text-gray-400 hover:text-white transition-colors">
                News
              </NuxtLink>
            </li>
            <li>
              <NuxtLink to="/how-to" class="text-gray-400 hover:text-white transition-colors">
                How to
              </NuxtLink>
            </li>
          </ul>
        </div>

        <!-- Features -->
        <div>
          <h3 class="text-lg font-semibold mb-4">Features</h3>
          <ul class="space-y-2 text-sm">
            <li>
              <NuxtLink to="/dogs" class="text-gray-400 hover:text-white transition-colors">
                📋 Health Records
              </NuxtLink>
            </li>
            <li>
              <NuxtLink to="/dogs" class="text-gray-400 hover:text-white transition-colors">
                💉 Vaccinations
              </NuxtLink>
            </li>
            <li>
              <NuxtLink to="/dogs" class="text-gray-400 hover:text-white transition-colors">
                💊 Medications
              </NuxtLink>
            </li>
            <li>
              <NuxtLink to="/dogs" class="text-gray-400 hover:text-white transition-colors">
                📅 Appointments
              </NuxtLink>
            </li>
            <li>
              <NuxtLink to="/vets" class="text-gray-400 hover:text-white transition-colors">
                🏥 Vet Contacts
              </NuxtLink>
            </li>
            <li>
              <NuxtLink to="/food-finder" class="text-gray-400 hover:text-white transition-colors">
                🍖 Food Finder
              </NuxtLink>
            </li>
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

      <!-- Banner Ad -->
      <div class="border-t border-gray-800 mt-8 pt-8">
        <AdUnit 
          ad-slot="footer-banner"
          ad-format="horizontal"
          class-name="max-w-4xl mx-auto"
        />
      </div>

      <!-- Bottom Bar -->
      <div class="border-t border-gray-800 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
        <p class="text-gray-400 text-sm">
          © {{ currentYear }} DogHealthy. All rights reserved.
        </p>
        <div class="flex space-x-6 mt-4 md:mt-0">
          <NuxtLink to="/privacy" class="text-gray-400 hover:text-white text-sm transition-colors">
            Privacy Policy
          </NuxtLink>
          <NuxtLink to="/terms" class="text-gray-400 hover:text-white text-sm transition-colors">
            Terms of Service
          </NuxtLink>
          <NuxtLink to="/contact" class="text-gray-400 hover:text-white text-sm transition-colors">
            Contact
          </NuxtLink>
        </div>
      </div>
    </div>
  </footer>
</template>

<script setup lang="ts">
import AdUnit from '~/components/ads/AdUnit.vue'

const currentYear = new Date().getFullYear()
</script>

