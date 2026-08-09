<template>
  <div class="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
    <h1 class="text-3xl font-bold text-gray-900 mb-6">Privacy Policy</h1>
    <p class="text-gray-600 mb-4">Last updated: {{ lastUpdated }}</p>
    <div class="prose prose-gray max-w-none">
      <p>
        We respect your privacy. This policy explains what data we collect and how we use it to provide DogHealthy services.
      </p>
      <h2>Information We Collect</h2>
      <ul>
        <li>Account information (name, email) to authenticate you</li>
        <li>Dog profiles and health data you add to the app</li>
      </ul>
      <h2>How We Use Information</h2>
      <ul>
        <li>To provide features like records, vaccinations, medications and appointments</li>
        <li>To secure your account and improve the service</li>
      </ul>
      <h2>Advertising &amp; analytics</h2>
      <p>
        We use Google AdSense to show ads on some public pages and Google Analytics to understand how the site is used.
        Google and its partners may use cookies or similar technologies to serve and measure ads. You can learn more in
        <a href="https://policies.google.com/technologies/ads" target="_blank" rel="noopener noreferrer">Google’s advertising policy</a>
        and opt out via
        <a href="https://adssettings.google.com/" target="_blank" rel="noopener noreferrer">Google Ads Settings</a>.
        Ads are not shown on private account areas such as your dogs, inbox or admin.
      </p>
      <h2>Data Retention & Deletion</h2>
      <p>You can delete your data at any time. We retain data only as long as needed to provide the service.</p>
      <h2>Contact</h2>
      <p>If you have questions, please <NuxtLink to="/contact">contact us</NuxtLink>.</p>
    </div>
  </div>
  
</template>

<script setup lang="ts">
const lastUpdated = new Date().toLocaleDateString('en-GB')

usePageSeo({
  title: 'Privacy Policy',
  description:
    'Read how DogHealthy collects and uses account and dog health data for UK users. Learn about retention, deletion and how to contact us about privacy.',
  keywords: 'DogHealthy privacy policy, dog health app privacy UK, pet data protection, GDPR dog app',
  path: '/privacy'
})
</script>


