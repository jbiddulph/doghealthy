<template>
  <div class="container mx-auto px-4 py-8">
    <!-- Header -->
    <div class="mb-8">
      <h1 class="text-4xl font-bold text-dark mb-4">My Listings</h1>
      <p class="text-secondary text-lg">Manage your dog breeding listings</p>
    </div>

    <!-- Stats Cards -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
      <div class="bg-white rounded-lg shadow-sm border border-muted p-6">
        <div class="flex items-center">
          <div class="p-3 bg-primary rounded-lg">
            <i class="bi bi-list-ul text-dark text-xl"></i>
          </div>
          <div class="ml-4">
            <p class="text-2xl font-bold text-dark">{{ stats.total }}</p>
            <p class="text-secondary">Total Listings</p>
          </div>
        </div>
      </div>
      <div class="bg-white rounded-lg shadow-sm border border-muted p-6">
        <div class="flex items-center">
          <div class="p-3 bg-secondary rounded-lg">
            <i class="bi bi-eye text-white text-xl"></i>
          </div>
          <div class="ml-4">
            <p class="text-2xl font-bold text-dark">{{ stats.totalViews }}</p>
            <p class="text-secondary">Total Views</p>
          </div>
        </div>
      </div>
      <div class="bg-white rounded-lg shadow-sm border border-muted p-6">
        <div class="flex items-center">
          <div class="p-3 bg-accent rounded-lg">
            <i class="bi bi-star text-white text-xl"></i>
          </div>
          <div class="ml-4">
            <p class="text-2xl font-bold text-dark">{{ stats.featured }}</p>
            <p class="text-secondary">Featured</p>
          </div>
        </div>
      </div>
      <div class="bg-white rounded-lg shadow-sm border border-muted p-6">
        <div class="flex items-center">
          <div class="p-3 bg-dark rounded-lg">
            <i class="bi bi-chat-dots text-white text-xl"></i>
          </div>
          <div class="ml-4">
            <p class="text-2xl font-bold text-dark">{{ stats.messages }}</p>
            <p class="text-secondary">Messages</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Create New Button -->
    <div class="flex justify-between items-center mb-6">
      <div class="flex gap-4">
        <select v-model="statusFilter" @change="fetchListings" class="border border-muted rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary focus:border-primary">
          <option value="">All Status</option>
          <option value="active">Active</option>
          <option value="pending">Pending</option>
          <option value="sold">Sold</option>
          <option value="inactive">Inactive</option>
        </select>
      </div>
      <NuxtLink to="/classifieds/new" class="bg-primary hover:bg-accent text-dark px-6 py-3 rounded-lg font-semibold transition-colors">
        <i class="bi bi-plus-lg mr-2"></i>
        Create New Listing
      </NuxtLink>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="text-center py-12">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
      <p class="text-secondary mt-4">Loading your listings...</p>
    </div>

    <!-- Empty State -->
    <div v-else-if="listings.length === 0" class="text-center py-12">
      <div class="text-6xl mb-4">📝</div>
      <h3 class="text-xl font-semibold text-dark mb-2">No listings yet</h3>
      <p class="text-secondary mb-6">Create your first listing to start selling your dogs.</p>
      <NuxtLink to="/classifieds/new" class="bg-primary hover:bg-accent text-dark px-6 py-3 rounded-lg font-semibold transition-colors">
        Create Your First Listing
      </NuxtLink>
    </div>

    <!-- Listings Grid -->
    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div v-for="listing in listings" :key="listing.id" class="bg-white rounded-lg shadow-sm border border-muted overflow-hidden hover:shadow-md transition-shadow">
        <!-- Status Badge -->
        <div class="px-4 py-2 text-sm font-semibold text-center" :class="getStatusClass(listing.status)">
          {{ getStatusText(listing.status) }}
        </div>
        
        <!-- Featured Badge -->
        <div v-if="listing.is_featured" class="bg-primary text-dark px-3 py-1 text-sm font-semibold text-center">
          ⭐ Featured
        </div>
        
        <!-- Image -->
        <div class="h-48 bg-muted flex items-center justify-center">
          <div v-if="listing.images && listing.images.length > 0" class="w-full h-full bg-cover bg-center" :style="{ backgroundImage: `url(${listing.images[0]})` }"></div>
          <div v-else class="text-4xl text-secondary">🐕</div>
        </div>
        
        <!-- Content -->
        <div class="p-4">
          <div class="flex items-start justify-between mb-2">
            <h3 class="font-semibold text-dark text-lg line-clamp-2">{{ listing.title }}</h3>
            <span v-if="listing.is_premium" class="bg-accent text-white px-2 py-1 rounded text-xs font-semibold ml-2">Premium</span>
          </div>
          
          <p class="text-secondary text-sm mb-3 line-clamp-2">{{ listing.description }}</p>
          
          <div class="space-y-1 text-sm text-secondary mb-3">
            <div v-if="listing.breed" class="flex items-center">
              <i class="bi bi-tag mr-2"></i>
              {{ listing.breed }}
            </div>
            <div v-if="listing.location" class="flex items-center">
              <i class="bi bi-geo-alt mr-2"></i>
              {{ listing.location }}
            </div>
            <div class="flex items-center">
              <i class="bi bi-eye mr-2"></i>
              {{ listing.view_count || 0 }} views
            </div>
          </div>
          
          <div class="flex items-center justify-between mb-4">
            <div class="text-2xl font-bold text-primary">
              £{{ listing.price_gbp?.toFixed(2) || 'Contact' }}
            </div>
            <div class="text-sm text-secondary">
              {{ formatDate(listing.created_at) }}
            </div>
          </div>
          
          <!-- Actions -->
          <div class="flex gap-2">
            <NuxtLink :to="`/classifieds/${listing.id}`" class="flex-1 bg-primary hover:bg-accent text-dark px-3 py-2 rounded text-center text-sm font-semibold transition-colors">
              View
            </NuxtLink>
            <NuxtLink :to="`/classifieds/${listing.id}/edit`" class="flex-1 bg-secondary hover:bg-dark text-white px-3 py-2 rounded text-center text-sm font-semibold transition-colors">
              Edit
            </NuxtLink>
            <button @click="deleteListing(listing.id)" class="flex-1 bg-red-100 hover:bg-red-200 text-red-600 px-3 py-2 rounded text-sm font-semibold transition-colors">
              Delete
            </button>
          </div>

          <!-- Upgrade Options -->
          <div v-if="listing.status === 'active' && !listing.is_premium" class="mt-4 pt-4 border-t border-muted">
            <div class="flex gap-2">
              <button @click="upgradeListing(listing.id, 'premium')" class="flex-1 bg-accent hover:bg-primary text-dark px-3 py-2 rounded text-sm font-semibold transition-colors">
                Premium (£9.99)
              </button>
              <button @click="upgradeListing(listing.id, 'featured')" class="flex-1 bg-primary hover:bg-accent text-dark px-3 py-2 rounded text-sm font-semibold transition-colors">
                Featured (£19.99)
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useSupabase } from '~/composables/useSupabase'
import { useAuthStore } from '~/stores/auth'

// Define page meta
definePageMeta({
  middleware: 'auth'
})

const supabase = useSupabase()
const authStore = useAuthStore()

// State
const listings = ref<any[]>([])
const loading = ref(true)
const statusFilter = ref('')

// Computed
const stats = computed(() => {
  const total = listings.value.length
  const totalViews = listings.value.reduce((sum, listing) => sum + (listing.view_count || 0), 0)
  const featured = listings.value.filter(listing => listing.is_featured).length
  const messages = 0 // This would need to be fetched separately
  
  return { total, totalViews, featured, messages }
})

// Methods
const getStatusClass = (status: string) => {
  switch (status) {
    case 'active': return 'bg-green-100 text-green-800'
    case 'pending': return 'bg-yellow-100 text-yellow-800'
    case 'sold': return 'bg-blue-100 text-blue-800'
    case 'inactive': return 'bg-gray-100 text-gray-800'
    default: return 'bg-gray-100 text-gray-800'
  }
}

const getStatusText = (status: string) => {
  switch (status) {
    case 'active': return 'Active'
    case 'pending': return 'Pending'
    case 'sold': return 'Sold'
    case 'inactive': return 'Inactive'
    default: return 'Unknown'
  }
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-GB', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

const fetchListings = async () => {
  try {
    loading.value = true
    
    let query = supabase
      .from('doghealthy_listings')
      .select('*')
      .eq('user_id', authStore.userId)
      .order('created_at', { ascending: false })

    if (statusFilter.value) {
      query = query.eq('status', statusFilter.value)
    }

    const { data, error } = await query

    if (error) throw error
    
    listings.value = data || []
  } catch (error) {
    console.error('Error fetching listings:', error)
  } finally {
    loading.value = false
  }
}

const deleteListing = async (listingId: string) => {
  if (!confirm('Are you sure you want to delete this listing? This action cannot be undone.')) {
    return
  }

  try {
    const { error } = await supabase
      .from('doghealthy_listings')
      .delete()
      .eq('id', listingId)

    if (error) throw error
    
    await fetchListings()
  } catch (error) {
    console.error('Error deleting listing:', error)
    alert('Error deleting listing. Please try again.')
  }
}

const upgradeListing = async (listingId: string, upgradeType: 'premium' | 'featured') => {
  try {
    const { createCheckoutSession } = useStripe()
    await createCheckoutSession(listingId, upgradeType)
  } catch (error) {
    console.error('Error upgrading listing:', error)
    alert('Error processing payment. Please try again.')
  }
}

// Lifecycle
onMounted(() => {
  fetchListings()
})
</script>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
