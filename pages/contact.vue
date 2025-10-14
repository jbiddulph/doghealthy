<template>
  <div class="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
    <h1 class="text-3xl font-bold text-gray-900 mb-6">Contact</h1>
    <p class="text-gray-600 mb-8">Have a question or feedback? Send us a message.</p>

    <form @submit.prevent="submit" class="bg-white p-6 rounded-lg shadow">
      <div class="grid md:grid-cols-2 gap-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Name</label>
          <input v-model="form.name" type="text" required class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Email</label>
          <input v-model="form.email" type="email" required class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
        </div>
      </div>
      <div class="mt-4">
        <label class="block text-sm font-medium text-gray-700 mb-2">Message</label>
        <textarea v-model="form.message" rows="5" required class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"></textarea>
      </div>
      <div class="mt-6 flex justify-end">
        <button :disabled="submitting" type="submit" class="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50">
          {{ submitting ? 'Sending...' : 'Send Message' }}
        </button>
      </div>
      <p v-if="success" class="text-green-700 bg-green-50 border border-green-200 rounded-lg p-3 mt-4">Thanks! We received your message.</p>
    </form>
  </div>
</template>

<script setup lang="ts">
const form = ref({ name: '', email: '', message: '' })
const submitting = ref(false)
const success = ref(false)

const submit = async () => {
  try {
    submitting.value = true
    success.value = false
    // In a real app, send to an email service / backend endpoint
    await new Promise(resolve => setTimeout(resolve, 800))
    success.value = true
    form.value = { name: '', email: '', message: '' }
  } finally {
    submitting.value = false
  }
}
</script>


