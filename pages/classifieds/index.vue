<template>
  <div class="container mx-auto px-4 py-8">
    <!-- Header -->
    <div class="mb-8">
      <div class="flex justify-between items-start mb-4">
        <div>
          <h1 class="text-4xl font-bold text-dark mb-2">Dog Classifieds</h1>
          <p class="text-secondary text-lg">Find your perfect companion from trusted breeders</p>
        </div>
        <div v-if="authStore.isAuthenticated">
          <NuxtLink 
            to="/classifieds/new" 
            class="bg-primary hover:bg-accent text-dark px-6 py-3 rounded-lg font-semibold transition-colors flex items-center gap-2"
          >
            <i class="bi bi-plus-lg"></i>
            Add Listing
          </NuxtLink>
        </div>
        <div v-else-if="!authStore.loading">
          <NuxtLink 
            to="/auth/login" 
            class="bg-secondary hover:bg-dark text-white px-6 py-3 rounded-lg font-semibold transition-colors flex items-center gap-2"
          >
            <i class="bi bi-person-plus"></i>
            Login to Add Listing
          </NuxtLink>
        </div>
        <div v-else class="bg-muted px-6 py-3 rounded-lg">
          <div class="animate-pulse text-secondary">Loading...</div>
        </div>
      </div>
    </div>

    <!-- Filters -->
    <div class="bg-white rounded-lg shadow-sm border border-muted p-6 mb-8">
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div>
          <label class="block text-sm font-medium text-dark mb-2">Breed</label>
          <select v-model="filters.breed" @change="applyFilters" class="w-full border border-muted rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary focus:border-primary">
            <option value="">All Breeds</option>
            <option v-for="breed in dogBreeds" :key="breed" :value="breed">{{ breed }}</option>
          </select>
        </div>
        <div>
          <label class="block text-sm font-medium text-dark mb-2">Location</label>
          <input v-model="filters.location" @input="debounceFilters" type="text" placeholder="Enter location" class="w-full border border-muted rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary focus:border-primary">
        </div>
        <div>
          <label class="block text-sm font-medium text-dark mb-2">Max Price (£)</label>
          <input v-model="filters.maxPrice" @input="debounceFilters" type="number" placeholder="Any price" class="w-full border border-muted rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary focus:border-primary">
        </div>
        <div>
          <label class="block text-sm font-medium text-dark mb-2">Sort By</label>
          <select v-model="filters.sortBy" @change="applyFilters" class="w-full border border-muted rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary focus:border-primary">
            <option value="created_at">Newest First</option>
            <option value="price_asc">Price: Low to High</option>
            <option value="price_desc">Price: High to Low</option>
            <option value="featured">Featured First</option>
          </select>
        </div>
      </div>
    </div>

    <!-- Listings Grid -->
    <div v-if="loading" class="text-center py-12">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
      <p class="text-secondary mt-4">Loading listings...</p>
    </div>

    <div v-else-if="listings.length === 0" class="text-center py-12">
      <div class="text-6xl mb-4">🐕</div>
      <h3 class="text-xl font-semibold text-dark mb-2">No listings found</h3>
      <p class="text-secondary">Try adjusting your filters or check back later for new listings.</p>
    </div>

    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div v-for="(listing, index) in listings" :key="listing.id" class="bg-white rounded-lg shadow-sm border border-muted overflow-hidden hover:shadow-md transition-shadow">
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
            <div v-if="listing.age_weeks" class="flex items-center">
              <i class="bi bi-calendar mr-2"></i>
              {{ getAgeText(listing.age_weeks) }}
            </div>
            <div v-if="listing.location" class="flex items-center">
              <i class="bi bi-geo-alt mr-2"></i>
              {{ listing.location }}
            </div>
          </div>
          
          <div class="flex items-center justify-between">
            <div class="text-2xl font-bold text-primary">
              £{{ listing.price_gbp?.toFixed(2) || 'Contact' }}
            </div>
            <NuxtLink :to="`/classifieds/${listing.id}`" class="bg-primary hover:bg-accent text-dark px-4 py-2 rounded-lg font-semibold transition-colors">
              View Details
            </NuxtLink>
          </div>
        </div>
      </div>
      
      <!-- Ad unit every 5th item -->
      <div v-if="(index + 1) % 5 === 0" class="col-span-1 md:col-span-2 lg:col-span-3">
        <AdUnit 
          ad-slot="classifieds-listings"
          ad-format="horizontal"
          class-name="my-4"
        />
      </div>
    </div>

  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue'
import { useSupabase } from '~/composables/useSupabase'
import { useAuthStore } from '~/stores/auth'
import AdUnit from '~/components/ads/AdUnit.vue'

const supabase = useSupabase()
const authStore = useAuthStore()

// SEO Meta tags
useHead({
  title: 'Dog Classifieds - Find Your Perfect Puppy | DogHealthy',
  meta: [
    { 
      name: 'description', 
      content: 'Browse thousands of dog classifieds from trusted breeders. Find puppies for sale, adult dogs, and rescue dogs near you. Free to browse, secure messaging, and verified sellers.' 
    },
    { name: 'keywords', content: 'dog classifieds, puppies for sale, dogs for sale, dog breeders, puppy listings, dog adoption, pet classifieds' },
    { property: 'og:title', content: 'Dog Classifieds - Find Your Perfect Puppy | DogHealthy' },
    { property: 'og:description', content: 'Browse thousands of dog classifieds from trusted breeders. Find puppies for sale, adult dogs, and rescue dogs near you.' },
    { property: 'og:type', content: 'website' },
    { property: 'og:url', content: 'https://doghealthy.netlify.app/classifieds' },
    { name: 'twitter:card', content: 'summary_large_image' },
    { name: 'twitter:title', content: 'Dog Classifieds - Find Your Perfect Puppy' },
    { name: 'twitter:description', content: 'Browse thousands of dog classifieds from trusted breeders. Find puppies for sale, adult dogs, and rescue dogs near you.' }
  ]
})

// Define page meta - no auth required to browse listings
// definePageMeta({
//   middleware: 'auth'
// })

// State
const listings = ref<any[]>([])
const loading = ref(true)

// Filters
const filters = ref({
  breed: '',
  location: '',
  maxPrice: null as number | null,
  sortBy: 'created_at'
})

// Dog breeds list (same as in new dog form)
const dogBreeds = [
  'Affenpinscher', 'Afghan Hound', 'Airedale Terrier', 'Akbash', 'Akita', 'Alaskan Malamute',
  'American Bulldog', 'American Bully', 'American Eskimo Dog', 'American Foxhound', 'American Pit Bull Terrier',
  'American Staffordshire Terrier', 'American Water Spaniel', 'Anatolian Shepherd Dog', 'Australian Cattle Dog',
  'Australian Kelpie', 'Australian Shepherd', 'Australian Terrier', 'Basenji', 'Basset Hound', 'Beagle',
  'Bearded Collie', 'Beauceron', 'Bedlington Terrier', 'Belgian Malinois', 'Belgian Sheepdog', 'Belgian Tervuren',
  'Bernese Mountain Dog', 'Bichon Frise', 'Black and Tan Coonhound', 'Black Russian Terrier', 'Bloodhound',
  'Bluetick Coonhound', 'Boerboel', 'Border Collie', 'Border Terrier', 'Borzoi', 'Boston Terrier',
  'Bouvier des Flandres', 'Boxer', 'Boykin Spaniel', 'Briard', 'Brittany', 'Brussels Griffon',
  'Bull Terrier', 'Bulldog', 'Bullmastiff', 'Cairn Terrier', 'Canaan Dog', 'Cane Corso',
  'Cardigan Welsh Corgi', 'Catahoula Leopard Dog', 'Caucasian Shepherd Dog', 'Cavalier King Charles Spaniel',
  'Chesapeake Bay Retriever', 'Chihuahua', 'Chinese Crested', 'Chinese Shar-Pei', 'Chinook', 'Chow Chow',
  'Clumber Spaniel', 'Cocker Spaniel', 'Collie', 'Curly-Coated Retriever', 'Dachshund', 'Dalmatian',
  'Dandie Dinmont Terrier', 'Doberman Pinscher', 'Dogue de Bordeaux', 'English Cocker Spaniel',
  'English Setter', 'English Springer Spaniel', 'English Toy Spaniel', 'English Toy Terrier',
  'Eurasier', 'Field Spaniel', 'Finnish Lapphund', 'Finnish Spitz', 'Flat-Coated Retriever',
  'French Bulldog', 'German Pinscher', 'German Shepherd Dog', 'German Shorthaired Pointer',
  'German Spitz', 'German Wirehaired Pointer', 'Giant Schnauzer', 'Glen of Imaal Terrier',
  'Golden Retriever', 'Gordon Setter', 'Great Dane', 'Great Pyrenees', 'Greater Swiss Mountain Dog',
  'Greyhound', 'Harrier', 'Havanese', 'Ibizan Hound', 'Icelandic Sheepdog', 'Irish Red and White Setter',
  'Irish Setter', 'Irish Terrier', 'Irish Water Spaniel', 'Irish Wolfhound', 'Italian Greyhound',
  'Jack Russell Terrier', 'Japanese Akita', 'Japanese Chin', 'Japanese Spitz', 'Keeshond', 'Kerry Blue Terrier',
  'Komondor', 'Kuvasz', 'Labrador Retriever', 'Lagotto Romagnolo', 'Lakeland Terrier', 'Leonberger',
  'Lhasa Apso', 'Lowchen', 'Maltese', 'Manchester Terrier', 'Mastiff', 'Miniature Bull Terrier',
  'Miniature Pinscher', 'Miniature Schnauzer', 'Neapolitan Mastiff', 'Newfoundland', 'Norfolk Terrier',
  'Norwegian Buhund', 'Norwegian Elkhound', 'Norwegian Lundehund', 'Norwich Terrier', 'Nova Scotia Duck Tolling Retriever',
  'Old English Sheepdog', 'Otterhound', 'Papillon', 'Parson Russell Terrier', 'Pekingese', 'Pembroke Welsh Corgi',
  'Petit Basset Griffon Vendeen', 'Pharaoh Hound', 'Plott', 'Pointer', 'Polish Lowland Sheepdog', 'Pomeranian',
  'Poodle (Miniature)', 'Poodle (Standard)', 'Poodle (Toy)', 'Portuguese Water Dog', 'Pug', 'Puli', 'Pumi',
  'Pyrenean Shepherd', 'Rhodesian Ridgeback', 'Rottweiler', 'Russell Terrier', 'Saint Bernard', 'Saluki',
  'Samoyed', 'Schipperke', 'Scottish Deerhound', 'Scottish Terrier', 'Sealyham Terrier', 'Shetland Sheepdog',
  'Shiba Inu', 'Shih Tzu', 'Siberian Husky', 'Silky Terrier', 'Skye Terrier', 'Sloughi', 'Smooth Fox Terrier',
  'Soft Coated Wheaten Terrier', 'Spinone Italiano', 'Staffordshire Bull Terrier', 'Standard Schnauzer',
  'Sussex Spaniel', 'Swedish Vallhund', 'Tibetan Mastiff', 'Tibetan Spaniel', 'Tibetan Terrier', 'Toy Fox Terrier',
  'Treeing Walker Coonhound', 'Vizsla', 'Weimaraner', 'Welsh Springer Spaniel', 'Welsh Terrier', 'West Highland White Terrier',
  'Whippet', 'Wire Fox Terrier', 'Wirehaired Pointing Griffon', 'Xoloitzcuintli', 'Yorkshire Terrier', 'Other'
]

// Computed
const filteredListings = computed(() => {
  let filtered = listings.value

  if (filters.value.breed) {
    filtered = filtered.filter(listing => 
      listing.breed?.toLowerCase().includes(filters.value.breed.toLowerCase())
    )
  }

  if (filters.value.location) {
    filtered = filtered.filter(listing => 
      listing.location?.toLowerCase().includes(filters.value.location.toLowerCase())
    )
  }

  if (filters.value.maxPrice) {
    filtered = filtered.filter(listing => 
      listing.price_gbp && listing.price_gbp <= filters.value.maxPrice!
    )
  }

  // Sort
  switch (filters.value.sortBy) {
    case 'price_asc':
      filtered.sort((a, b) => (a.price_gbp || 0) - (b.price_gbp || 0))
      break
    case 'price_desc':
      filtered.sort((a, b) => (b.price_gbp || 0) - (a.price_gbp || 0))
      break
    case 'featured':
      filtered.sort((a, b) => {
        if (a.is_featured && !b.is_featured) return -1
        if (!a.is_featured && b.is_featured) return 1
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      })
      break
    default:
      filtered.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
  }

  return filtered
})

// Methods
const getAgeText = (ageWeeks: number) => {
  if (ageWeeks < 4) return `${ageWeeks} week${ageWeeks !== 1 ? 's' : ''} old`
  if (ageWeeks < 52) return `${Math.floor(ageWeeks / 4)} month${Math.floor(ageWeeks / 4) !== 1 ? 's' : ''} old`
  return `${Math.floor(ageWeeks / 52)} year${Math.floor(ageWeeks / 52) !== 1 ? 's' : ''} old`
}

const fetchListings = async () => {
  try {
    loading.value = true
    
    const { data, error } = await supabase
      .from('doghealthy_listings')
      .select('*')
      .eq('status', 'active')
      .order('is_featured', { ascending: false })
      .order('created_at', { ascending: false })

    if (error) throw error
    
    listings.value = data || []
  } catch (error) {
    console.error('Error fetching listings:', error)
  } finally {
    loading.value = false
  }
}

const applyFilters = () => {
  // Filters are applied via computed property
}

let filterTimeout: NodeJS.Timeout
const debounceFilters = () => {
  clearTimeout(filterTimeout)
  filterTimeout = setTimeout(applyFilters, 500)
}

// Lifecycle
onMounted(async () => {
  // Initialize auth store first
  await authStore.initialize()
  await fetchListings()
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
