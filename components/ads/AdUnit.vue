<template>
  <div class="ad-unit">
    <!-- Placeholder for development -->
    <div v-if="isDevelopment" class="bg-muted border-2 border-dashed border-secondary rounded-lg p-8 text-center">
      <div class="text-secondary text-sm mb-2">Advertisement Space</div>
      <div class="text-xs text-secondary">{{ adSlot }}</div>
      <div class="text-xs text-secondary mt-1">{{ adSize }}</div>
    </div>
    
    <!-- Actual AdSense ad for production -->
    <div v-else :id="adId" :class="containerClass">
      <!-- AdSense script will be injected here -->
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'

interface Props {
  adSlot: string
  adSize?: string
  adFormat?: 'auto' | 'rectangle' | 'vertical' | 'horizontal'
  responsive?: boolean
  className?: string
}

const props = withDefaults(defineProps<Props>(), {
  adSize: 'auto',
  adFormat: 'auto',
  responsive: true,
  className: ''
})

const config = useRuntimeConfig()
const isDevelopment = process.env.NODE_ENV === 'development'

// Generate unique ad ID
const adId = ref(`adsense-${props.adSlot}-${Math.random().toString(36).substr(2, 9)}`)

const containerClass = computed(() => {
  const baseClasses = 'adsense-ad'
  const sizeClasses = {
    'auto': 'w-full',
    'rectangle': 'w-full max-w-md mx-auto',
    'vertical': 'w-full max-w-xs mx-auto',
    'horizontal': 'w-full max-w-2xl mx-auto'
  }
  
  return `${baseClasses} ${sizeClasses[props.adFormat]} ${props.className}`
})

const loadAdSense = () => {
  if (isDevelopment || !config.public.adsenseClient) return
  
  // Check if AdSense is already loaded
  if (typeof window !== 'undefined' && (window as any).adsbygoogle) {
    try {
      // Initialize the ad
      ((window as any).adsbygoogle = (window as any).adsbygoogle || []).push({})
    } catch (error) {
      console.error('Error loading AdSense:', error)
    }
  }
}

onMounted(() => {
  if (!isDevelopment) {
    // Load AdSense script if not already loaded
    if (typeof window !== 'undefined' && !(window as any).adsbygoogle) {
      const script = document.createElement('script')
      script.async = true
      script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${config.public.adsenseClient}`
      script.crossOrigin = 'anonymous'
      document.head.appendChild(script)
      
      script.onload = () => {
        loadAdSense()
      }
    } else {
      loadAdSense()
    }
  }
})
</script>

<style scoped>
.adsense-ad {
  min-height: 90px; /* Minimum height for ads */
  display: flex;
  align-items: center;
  justify-content: center;
}

/* Responsive ad sizing */
@media (max-width: 768px) {
  .adsense-ad {
    min-height: 250px;
  }
}
</style>
