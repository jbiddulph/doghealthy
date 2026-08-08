<script setup lang="ts">
definePageMeta({
  middleware: ['auth', 'admin'],
  layout: false
})

await navigateTo('/admin/nfc-orders', { replace: true })
</script>
