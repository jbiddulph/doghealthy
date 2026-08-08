<template>
  <div class="inline-flex items-center gap-1.5">
    <button
      type="button"
      class="bg-white hover:bg-gray-50 text-gray-900 border border-gray-200 px-4 py-2 rounded-lg font-semibold transition-colors"
      :class="buttonClass"
      @click="$emit('click')"
    >
      Add Multiple Dogs
    </button>
    <span class="relative inline-flex group">
      <button
        type="button"
        class="h-6 w-6 rounded-full border border-current text-xs font-bold leading-none inline-flex items-center justify-center opacity-80 hover:opacity-100"
        :class="hintClass"
        aria-label="First 3 dogs are free then each dog will cost £2"
      >
        ?
      </button>
      <span
        role="tooltip"
        class="pointer-events-none absolute right-0 top-full z-30 mt-2 w-64 rounded-lg bg-slate-900 px-3 py-2 text-xs font-medium text-white shadow-lg opacity-0 translate-y-1 group-hover:opacity-100 group-hover:translate-y-0 group-focus-within:opacity-100 group-focus-within:translate-y-0 transition"
      >
        First 3 dogs are free then each dog will cost £2.
      </span>
    </span>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  buttonClass?: string
  hintClass?: string
}>()

defineEmits<{
  click: []
}>()
</script>
