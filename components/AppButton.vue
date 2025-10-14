<template>
  <button
    :type="type"
    :class="buttonClasses"
    :disabled="disabled"
    @click="$emit('click', $event)"
  >
    <slot />
  </button>
</template>

<script setup lang="ts">
interface Props {
  variant?: 'primary' | 'secondary' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  type?: 'button' | 'submit' | 'reset'
  disabled?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'primary',
  size: 'md',
  type: 'button',
  disabled: false
})

defineEmits<{
  click: [event: MouseEvent]
}>()

const buttonClasses = computed(() => {
  const baseClasses = 'font-semibold rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2'
  
  const variantClasses = {
    primary: 'bg-primary hover:brightness-95 text-dark focus:ring-primary disabled:opacity-50',
    secondary: 'bg-secondary hover:brightness-110 text-white focus:ring-secondary disabled:opacity-50',
    danger: 'bg-accent hover:brightness-95 text-white focus:ring-accent disabled:opacity-50'
  }
  
  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2',
    lg: 'px-6 py-3 text-lg'
  }
  
  const disabledClasses = props.disabled ? 'cursor-not-allowed opacity-50' : ''
  
  return `${baseClasses} ${variantClasses[props.variant]} ${sizeClasses[props.size]} ${disabledClasses}`
})
</script>

