<template>
  <div class="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
    <h1 class="text-3xl font-bold text-gray-900 mb-6">Terms of Service</h1>
    <p class="text-gray-600 mb-4">Last updated: {{ lastUpdated }}</p>
    <div class="prose prose-gray max-w-none">
      <h2>Agreement</h2>
      <p>By using DogHealthy, you agree to these terms. If you do not agree, do not use the service.</p>
      <h2>Use of Service</h2>
      <ul>
        <li>You are responsible for the content you add.</li>
        <li>Do not misuse the service or attempt to disrupt it.</li>
      </ul>
      <h2>Disclaimer</h2>
      <p>DogHealthy is not a substitute for veterinary advice. Always consult a qualified professional for medical decisions.</p>
      <h2>Termination</h2>
      <p>We may suspend or terminate access for violations of these terms.</p>
      <h2>Contact</h2>
      <p>Questions? <NuxtLink to="/contact">Contact us</NuxtLink>.</p>
    </div>
  </div>
</template>

<script setup lang="ts">
const lastUpdated = new Date().toLocaleDateString('en-GB')
</script>


