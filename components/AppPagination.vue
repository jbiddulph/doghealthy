<template>
  <div
    v-if="total > 0"
    class="flex flex-wrap items-center justify-between gap-3 mt-6 text-sm text-gray-600"
  >
    <p>
      Showing
      <span class="font-medium text-gray-800">{{ fromDisplay }}–{{ toDisplay }}</span>
      of
      <span class="font-medium text-gray-800">{{ total }}</span>
    </p>
    <div class="flex items-center gap-2">
      <button
        type="button"
        class="px-3 py-1.5 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
        :disabled="page <= 1 || disabled"
        @click="go(page - 1)"
      >
        Previous
      </button>
      <span class="tabular-nums px-1">
        Page {{ page }} / {{ pages }}
      </span>
      <button
        type="button"
        class="px-3 py-1.5 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
        :disabled="page >= pages || disabled"
        @click="go(page + 1)"
      >
        Next
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { DOG_RECORDS_PAGE_SIZE, totalPages } from '~/utils/pagination'

const props = withDefaults(
  defineProps<{
    page: number
    total: number
    pageSize?: number
    disabled?: boolean
  }>(),
  {
    pageSize: DOG_RECORDS_PAGE_SIZE,
    disabled: false
  }
)

const emit = defineEmits<{
  'update:page': [page: number]
}>()

const pages = computed(() => totalPages(props.total, props.pageSize))
const fromDisplay = computed(() => {
  if (props.total === 0) return 0
  return (props.page - 1) * props.pageSize + 1
})
const toDisplay = computed(() => Math.min(props.page * props.pageSize, props.total))

const go = (next: number) => {
  const clamped = Math.min(Math.max(1, next), pages.value)
  if (clamped !== props.page) emit('update:page', clamped)
}
</script>
