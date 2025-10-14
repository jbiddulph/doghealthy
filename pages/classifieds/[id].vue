<template>
  <div class="container mx-auto px-4 py-8">
    <!-- Loading State -->
    <div v-if="loading" class="text-center py-12">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
      <p class="text-secondary mt-4">Loading listing...</p>
    </div>

    <!-- Not Found -->
    <div v-else-if="!listing" class="text-center py-12">
      <div class="text-6xl mb-4">🐕❌</div>
      <h3 class="text-xl font-semibold text-dark mb-2">Listing not found</h3>
      <p class="text-secondary mb-6">This listing may have been removed or doesn't exist.</p>
      <NuxtLink to="/classifieds" class="bg-primary hover:bg-accent text-dark px-6 py-3 rounded-lg font-semibold transition-colors">
        Browse All Listings
      </NuxtLink>
    </div>

    <!-- Listing Content -->
    <div v-else class="max-w-6xl mx-auto">
      <!-- Back Button -->
      <NuxtLink to="/classifieds" class="inline-flex items-center text-secondary hover:text-primary mb-6">
        <i class="bi bi-arrow-left mr-2"></i>
        Back to Classifieds
      </NuxtLink>

      <!-- Featured Badge -->
      <div v-if="listing.is_featured" class="bg-primary text-dark px-4 py-2 text-sm font-semibold text-center mb-6 rounded-lg">
        ⭐ Featured Listing
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <!-- Main Content -->
        <div class="lg:col-span-2">
          <!-- Images -->
          <div class="mb-6">
            <div v-if="listing.images && listing.images.length > 0" class="bg-white rounded-lg shadow-sm border border-muted overflow-hidden">
              <div class="h-96 bg-cover bg-center" :style="{ backgroundImage: `url(${listing.images[0]})` }"></div>
              <!-- Additional images thumbnails could go here -->
            </div>
            <div v-else class="h-96 bg-muted rounded-lg flex items-center justify-center">
              <div class="text-6xl text-secondary">🐕</div>
            </div>
          </div>

          <!-- Description -->
          <div class="bg-white rounded-lg shadow-sm border border-muted p-6 mb-6">
            <h1 class="text-3xl font-bold text-dark mb-4">{{ listing.title }}</h1>
            <div class="prose text-secondary max-w-none">
              <p class="whitespace-pre-wrap">{{ listing.description }}</p>
            </div>
          </div>

          <!-- Details -->
          <div class="bg-white rounded-lg shadow-sm border border-muted p-6">
            <h2 class="text-xl font-semibold text-dark mb-4">Details</h2>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div v-if="listing.breed" class="flex items-center">
                <i class="bi bi-tag text-primary mr-3"></i>
                <div>
                  <div class="text-sm text-secondary">Breed</div>
                  <div class="font-medium text-dark">{{ listing.breed }}</div>
                </div>
              </div>
              <div v-if="listing.age_weeks" class="flex items-center">
                <i class="bi bi-calendar text-primary mr-3"></i>
                <div>
                  <div class="text-sm text-secondary">Age</div>
                  <div class="font-medium text-dark">{{ getAgeText(listing.age_weeks) }}</div>
                </div>
              </div>
              <div v-if="listing.gender" class="flex items-center">
                <i class="bi bi-gender-ambiguous text-primary mr-3"></i>
                <div>
                  <div class="text-sm text-secondary">Gender</div>
                  <div class="font-medium text-dark">{{ listing.gender }}</div>
                </div>
              </div>
              <div v-if="listing.location" class="flex items-center">
                <i class="bi bi-geo-alt text-primary mr-3"></i>
                <div>
                  <div class="text-sm text-secondary">Location</div>
                  <div class="font-medium text-dark">{{ listing.location }}</div>
                </div>
              </div>
              <div class="flex items-center">
                <i class="bi bi-eye text-primary mr-3"></i>
                <div>
                  <div class="text-sm text-secondary">Views</div>
                  <div class="font-medium text-dark">{{ listing.view_count || 0 }}</div>
                </div>
              </div>
              <div class="flex items-center">
                <i class="bi bi-clock text-primary mr-3"></i>
                <div>
                  <div class="text-sm text-secondary">Listed</div>
                  <div class="font-medium text-dark">{{ formatDate(listing.created_at) }}</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Sidebar -->
        <div class="lg:col-span-1">
          <!-- Price & Contact -->
          <div class="bg-white rounded-lg shadow-sm border border-muted p-6 mb-6 sticky top-6">
            <div class="text-center mb-6">
              <div class="text-4xl font-bold text-primary mb-2">
                £{{ listing.price_gbp?.toFixed(2) || 'Contact' }}
              </div>
              <div v-if="listing.is_premium" class="bg-accent text-white px-3 py-1 rounded-full text-sm font-semibold inline-block">
                Premium Listing
              </div>
            </div>

            <div class="space-y-4">
              <button 
                @click="openChat" 
                :disabled="isOwner"
                class="w-full bg-primary hover:bg-accent text-dark py-3 px-4 rounded-lg font-semibold transition-colors disabled:bg-muted disabled:cursor-not-allowed"
              >
                <i class="bi bi-chat-dots mr-2"></i>
                {{ isOwner ? 'Your Listing' : 'Contact Seller' }}
              </button>

              <button 
                v-if="!isOwner" 
                @click="shareListing" 
                class="w-full bg-secondary hover:bg-dark text-white py-3 px-4 rounded-lg font-semibold transition-colors"
              >
                <i class="bi bi-share mr-2"></i>
                Share Listing
              </button>

              <button 
                v-if="!isOwner" 
                @click="reportListing" 
                class="w-full bg-red-100 hover:bg-red-200 text-red-600 py-3 px-4 rounded-lg font-semibold transition-colors"
              >
                <i class="bi bi-flag mr-2"></i>
                Report Listing
              </button>
            </div>

            <!-- Ad Space -->
            <div class="mt-6 pt-6 border-t border-muted">
              <AdUnit 
                ad-slot="listing-sidebar"
                ad-format="rectangle"
              />
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Chat Modal -->
    <ChatBox 
      v-if="showChat"
      :listing-id="listing.id"
      :recipient-id="listing.user_id"
      :recipient-name="'Seller'"
      :current-user-id="authStore.userId"
      @close="showChat = false"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useSupabase } from '~/composables/useSupabase'
import { useAuthStore } from '~/stores/auth'
import AdUnit from '~/components/ads/AdUnit.vue'

// Define page meta
definePageMeta({
  middleware: 'auth'
})

const route = useRoute()
const supabase = useSupabase()
const authStore = useAuthStore()

// Dynamic SEO Meta tags and structured data
useHead(() => {
  if (!listing.value) {
    return {
      title: 'Dog Listing - DogHealthy',
      meta: [
        { name: 'description', content: 'Browse this dog listing on DogHealthy classifieds.' }
      ]
    }
  }

  const title = `${listing.value.title} - ${listing.value.breed || 'Dog'} for Sale | DogHealthy`
  const description = `${listing.value.description?.substring(0, 150) || listing.value.title} - ${listing.value.breed || 'Dog'} for sale in ${listing.value.location || 'UK'}. £${listing.value.price_gbp || 'Contact for price'}.`

  return {
    title,
    meta: [
      { name: 'description', content: description },
      { name: 'keywords', content: `${listing.value.breed || 'dog'}, ${listing.value.breed || 'dog'} for sale, puppy, dog classifieds, ${listing.value.location || 'UK'} dogs` },
      { property: 'og:title', content: title },
      { property: 'og:description', content: description },
      { property: 'og:type', content: 'website' },
      { property: 'og:url', content: `https://doghealthy.netlify.app/classifieds/${listing.value.id}` },
      { name: 'twitter:card', content: 'summary_large_image' },
      { name: 'twitter:title', content: title },
      { name: 'twitter:description', content: description }
    ],
    script: [
      {
        type: 'application/ld+json',
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Product",
          "name": listing.value.title,
          "description": listing.value.description,
          "category": "Pet",
          "brand": {
            "@type": "Brand",
            "name": listing.value.breed || "Dog"
          },
          "offers": {
            "@type": "Offer",
            "price": listing.value.price_gbp || 0,
            "priceCurrency": "GBP",
            "availability": "https://schema.org/InStock",
            "seller": {
              "@type": "Organization",
              "name": "DogHealthy Classifieds"
            }
          },
          "additionalProperty": [
            {
              "@type": "PropertyValue",
              "name": "Breed",
              "value": listing.value.breed || "Mixed"
            },
            {
              "@type": "PropertyValue", 
              "name": "Age",
              "value": listing.value.age_weeks ? `${Math.floor(listing.value.age_weeks / 4)} months` : "Unknown"
            },
            {
              "@type": "PropertyValue",
              "name": "Gender", 
              "value": listing.value.gender || "Unknown"
            },
            {
              "@type": "PropertyValue",
              "name": "Location",
              "value": listing.value.location || "UK"
            }
          ]
        })
      }
    ]
  }
})

// State
const listing = ref<any>(null)
const loading = ref(true)
const showChat = ref(false)

// Computed
const isOwner = computed(() => {
  return listing.value && authStore.userId && listing.value.user_id === authStore.userId
})

// Methods
const getAgeText = (ageWeeks: number) => {
  if (ageWeeks < 4) return `${ageWeeks} week${ageWeeks !== 1 ? 's' : ''} old`
  if (ageWeeks < 52) return `${Math.floor(ageWeeks / 4)} month${Math.floor(ageWeeks / 4) !== 1 ? 's' : ''} old`
  return `${Math.floor(ageWeeks / 52)} year${Math.floor(ageWeeks / 52) !== 1 ? 's' : ''} old`
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-GB', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

const formatTime = (dateString: string) => {
  return new Date(dateString).toLocaleTimeString('en-GB', {
    hour: '2-digit',
    minute: '2-digit'
  })
}

const fetchListing = async () => {
  try {
    loading.value = true
    
    const { data, error } = await supabase
      .from('doghealthy_listings')
      .select('*')
      .eq('id', route.params.id)
      .eq('status', 'active')
      .single()

    if (error) throw error
    
    listing.value = data

    // Increment view count (only if not the owner)
    if (data && authStore.userId && data.user_id !== authStore.userId) {
      await supabase
        .from('doghealthy_listings')
        .update({ view_count: (data.view_count || 0) + 1 })
        .eq('id', data.id)
    }
  } catch (error) {
    console.error('Error fetching listing:', error)
  } finally {
    loading.value = false
  }
}

const openChat = async () => {
  if (isOwner.value) return
  
  showChat.value = true
}

const shareListing = async () => {
  if (navigator.share) {
    try {
      await navigator.share({
        title: listing.value.title,
        text: listing.value.description,
        url: window.location.href
      })
    } catch (error) {
      // User cancelled or error occurred
    }
  } else {
    // Fallback: copy to clipboard
    await navigator.clipboard.writeText(window.location.href)
    alert('Link copied to clipboard!')
  }
}

const reportListing = () => {
  // For now, just show an alert. In a real app, this would open a report form
  alert('Thank you for your concern. We will review this listing.')
}

// Lifecycle
onMounted(() => {
  fetchListing()
})
</script>
