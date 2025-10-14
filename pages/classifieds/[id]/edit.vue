<template>
  <div class="container mx-auto px-4 py-8 max-w-4xl">
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
      <NuxtLink to="/classifieds/my-listings" class="bg-primary hover:bg-accent text-dark px-6 py-3 rounded-lg font-semibold transition-colors">
        Back to My Listings
      </NuxtLink>
    </div>

    <!-- Not Authorized -->
    <div v-else-if="!isOwner" class="text-center py-12">
      <div class="text-6xl mb-4">🔒</div>
      <h3 class="text-xl font-semibold text-dark mb-2">Access Denied</h3>
      <p class="text-secondary mb-6">You can only edit your own listings.</p>
      <NuxtLink to="/classifieds" class="bg-primary hover:bg-accent text-dark px-6 py-3 rounded-lg font-semibold transition-colors">
        Browse Listings
      </NuxtLink>
    </div>

    <!-- Edit Form -->
    <div v-else>
      <!-- Header -->
      <div class="mb-8">
        <NuxtLink to="/classifieds/my-listings" class="inline-flex items-center text-secondary hover:text-primary mb-4">
          <i class="bi bi-arrow-left mr-2"></i>
          Back to My Listings
        </NuxtLink>
        <h1 class="text-4xl font-bold text-dark mb-4">Edit Listing</h1>
        <p class="text-secondary text-lg">Update your dog breeding listing</p>
      </div>

      <form @submit.prevent="handleSubmit" class="space-y-8">
        <!-- Basic Information -->
        <div class="bg-white rounded-lg shadow-sm border border-muted p-6">
          <h2 class="text-xl font-semibold text-dark mb-4">Basic Information</h2>
          
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label class="block text-sm font-medium text-dark mb-2">Title *</label>
              <input 
                v-model="form.title" 
                type="text" 
                placeholder="e.g., Beautiful Golden Retriever Puppies"
                class="w-full border border-muted rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary focus:border-primary"
                required
              >
            </div>
            
            <div>
              <label class="block text-sm font-medium text-dark mb-2">Price (£) *</label>
              <input 
                v-model="form.price_gbp" 
                type="number" 
                step="0.01" 
                min="0"
                placeholder="e.g., 800.00"
                class="w-full border border-muted rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary focus:border-primary"
                required
              >
            </div>
          </div>

          <div class="mt-6">
            <label class="block text-sm font-medium text-dark mb-2">Description *</label>
            <textarea 
              v-model="form.description" 
              rows="4" 
              placeholder="Tell potential buyers about your dog, their temperament, health, and any other important details..."
              class="w-full border border-muted rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary focus:border-primary"
              required
            ></textarea>
          </div>

          <div class="mt-6">
            <label class="block text-sm font-medium text-dark mb-2">Status</label>
            <select 
              v-model="form.status" 
              class="w-full border border-muted rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary focus:border-primary"
            >
              <option value="active">Active</option>
              <option value="pending">Pending</option>
              <option value="sold">Sold</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div>

        <!-- Dog Details -->
        <div class="bg-white rounded-lg shadow-sm border border-muted p-6">
          <h2 class="text-xl font-semibold text-dark mb-4">Dog Details</h2>
          
          <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label class="block text-sm font-medium text-dark mb-2">Breed *</label>
              <select 
                v-model="form.breed" 
                class="w-full border border-muted rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary focus:border-primary"
                required
              >
                <option value="">Select Breed</option>
                <option v-for="breed in dogBreeds" :key="breed" :value="breed">{{ breed }}</option>
              </select>
            </div>
            
            <div>
              <label class="block text-sm font-medium text-dark mb-2">Gender</label>
              <select 
                v-model="form.gender" 
                class="w-full border border-muted rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary focus:border-primary"
              >
                <option value="">Select Gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
              </select>
            </div>
            
            <div>
              <label class="block text-sm font-medium text-dark mb-2">Age (weeks)</label>
              <input 
                v-model="form.age_weeks" 
                type="number" 
                min="0"
                placeholder="e.g., 8"
                class="w-full border border-muted rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary focus:border-primary"
              >
            </div>
          </div>

          <div class="mt-6">
            <label class="block text-sm font-medium text-dark mb-2">Link to Existing Dog (Optional)</label>
            <select 
              v-model="form.dog_id" 
              class="w-full border border-muted rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary focus:border-primary"
            >
              <option value="">No existing dog profile</option>
              <option v-for="dog in userDogs" :key="dog.id" :value="dog.id">{{ dog.name }} ({{ dog.breed }})</option>
            </select>
            <p class="text-sm text-secondary mt-1">Link this listing to an existing dog in your profile for easier management</p>
          </div>
        </div>

        <!-- Location -->
        <div class="bg-white rounded-lg shadow-sm border border-muted p-6">
          <h2 class="text-xl font-semibold text-dark mb-4">Location</h2>
          
          <div>
            <label class="block text-sm font-medium text-dark mb-2">Location *</label>
            <input 
              v-model="form.location" 
              type="text" 
              placeholder="e.g., London, UK or Worthing, West Sussex"
              class="w-full border border-muted rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary focus:border-primary"
              required
            >
          </div>
        </div>

        <!-- Current Premium Status -->
        <div class="bg-white rounded-lg shadow-sm border border-muted p-6">
          <h2 class="text-xl font-semibold text-dark mb-4">Current Status</h2>
          
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div class="p-4 border border-muted rounded-lg">
              <h3 class="font-semibold text-dark mb-2">Premium Status</h3>
              <div class="flex items-center justify-between">
                <span class="text-sm text-secondary">Premium Listing</span>
                <span class="px-3 py-1 rounded-full text-sm font-semibold" :class="listing.is_premium ? 'bg-accent text-white' : 'bg-muted text-secondary'">
                  {{ listing.is_premium ? 'Active' : 'Inactive' }}
                </span>
              </div>
            </div>
            
            <div class="p-4 border border-muted rounded-lg">
              <h3 class="font-semibold text-dark mb-2">Featured Status</h3>
              <div class="flex items-center justify-between">
                <span class="text-sm text-secondary">Featured Listing</span>
                <span class="px-3 py-1 rounded-full text-sm font-semibold" :class="listing.is_featured ? 'bg-primary text-dark' : 'bg-muted text-secondary'">
                  {{ listing.is_featured ? 'Active' : 'Inactive' }}
                </span>
              </div>
              <div v-if="listing.featured_until" class="mt-2 text-xs text-secondary">
                Expires: {{ formatDate(listing.featured_until) }}
              </div>
            </div>
          </div>

          <!-- View Count -->
          <div class="mt-6 p-4 bg-muted rounded-lg">
            <div class="flex items-center justify-between">
              <span class="text-sm text-secondary">Total Views</span>
              <span class="text-lg font-bold text-dark">{{ listing.view_count || 0 }}</span>
            </div>
          </div>
        </div>

        <!-- Upgrade Options -->
        <div v-if="!listing.is_premium || !listing.is_featured" class="bg-white rounded-lg shadow-sm border border-muted p-6">
          <h2 class="text-xl font-semibold text-dark mb-4">Upgrade Options</h2>
          
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div v-if="!listing.is_premium" class="border border-primary rounded-lg p-4 bg-primary bg-opacity-5">
              <h3 class="font-semibold text-dark mb-2">Premium Listing - £9.99</h3>
              <ul class="text-sm text-secondary space-y-1 mb-4">
                <li>• Highlighted listing</li>
                <li>• Premium badge</li>
                <li>• Higher search ranking</li>
                <li>• More views</li>
              </ul>
              <div class="text-2xl font-bold text-primary">£9.99</div>
              <button @click="upgradeListing('premium')" class="w-full mt-4 bg-primary hover:bg-accent text-dark py-2 px-4 rounded-lg font-semibold transition-colors">
                Upgrade to Premium
              </button>
            </div>
            
            <div v-if="!listing.is_featured" class="border border-accent rounded-lg p-4 bg-accent bg-opacity-10">
              <h3 class="font-semibold text-dark mb-2">Featured Listing - £19.99</h3>
              <ul class="text-sm text-secondary space-y-1 mb-4">
                <li>• Top placement in search results</li>
                <li>• Featured badge and highlighting</li>
                <li>• Maximum visibility</li>
                <li>• 30-day featured period</li>
              </ul>
              <div class="text-2xl font-bold text-accent">£19.99</div>
              <button @click="upgradeListing('featured')" class="w-full mt-4 bg-accent hover:bg-primary text-dark py-2 px-4 rounded-lg font-semibold transition-colors">
                Upgrade to Featured
              </button>
            </div>
          </div>
        </div>

        <!-- Submit -->
        <div class="flex justify-end gap-4">
          <NuxtLink to="/classifieds/my-listings" class="bg-secondary hover:bg-dark text-white px-6 py-3 rounded-lg font-semibold transition-colors">
            Cancel
          </NuxtLink>
          <button 
            type="submit" 
            :disabled="saving"
            class="bg-primary hover:bg-accent text-dark px-6 py-3 rounded-lg font-semibold transition-colors disabled:bg-muted disabled:cursor-not-allowed"
          >
            <span v-if="saving">Updating Listing...</span>
            <span v-else>Update Listing</span>
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useSupabase } from '~/composables/useSupabase'
import { useAuthStore } from '~/stores/auth'
import { useRouter, useRoute } from 'vue-router'

// Define page meta
definePageMeta({
  middleware: 'auth'
})

const supabase = useSupabase()
const authStore = useAuthStore()
const router = useRouter()
const route = useRoute()

// State
const listing = ref<any>(null)
const loading = ref(true)
const saving = ref(false)
const userDogs = ref<any[]>([])

// Form data
const form = ref({
  title: '',
  description: '',
  breed: '',
  gender: '',
  age_weeks: null as number | null,
  price_gbp: null as number | null,
  location: '',
  dog_id: '',
  status: 'active'
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
const isOwner = computed(() => {
  return listing.value && authStore.userId && listing.value.user_id === authStore.userId
})

// Methods
const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-GB', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

const fetchListing = async () => {
  try {
    loading.value = true
    
    const { data, error } = await supabase
      .from('doghealthy_listings')
      .select('*')
      .eq('id', route.params.id)
      .single()

    if (error) throw error
    
    listing.value = data

    // Populate form with existing data
    form.value = {
      title: data.title,
      description: data.description,
      breed: data.breed,
      gender: data.gender,
      age_weeks: data.age_weeks,
      price_gbp: data.price_gbp,
      location: data.location,
      dog_id: data.dog_id || '',
      status: data.status
    }
  } catch (error) {
    console.error('Error fetching listing:', error)
  } finally {
    loading.value = false
  }
}

const fetchUserDogs = async () => {
  try {
    const { data, error } = await supabase
      .from('doghealthy_dogs')
      .select('id, name, breed')
      .eq('user_id', authStore.userId)
      .order('name')

    if (error) throw error
    
    userDogs.value = data || []
  } catch (error) {
    console.error('Error fetching user dogs:', error)
  }
}

const handleSubmit = async () => {
  try {
    saving.value = true

    // Prepare update data
    const updateData = {
      title: form.value.title,
      description: form.value.description,
      breed: form.value.breed,
      gender: form.value.gender || null,
      age_weeks: form.value.age_weeks || null,
      price_gbp: form.value.price_gbp,
      location: form.value.location,
      dog_id: form.value.dog_id || null,
      status: form.value.status
    }

    const { error } = await supabase
      .from('doghealthy_listings')
      .update(updateData)
      .eq('id', route.params.id)

    if (error) throw error

    // Redirect to the listing
    router.push(`/classifieds/${route.params.id}`)
  } catch (error) {
    console.error('Error updating listing:', error)
    alert('Error updating listing. Please try again.')
  } finally {
    saving.value = false
  }
}

const upgradeListing = async (upgradeType: 'premium' | 'featured') => {
  try {
    const { createCheckoutSession } = useStripe()
    await createCheckoutSession(listing.value.id, upgradeType)
  } catch (error) {
    console.error('Error upgrading listing:', error)
    alert('Error processing payment. Please try again.')
  }
}

// Lifecycle
onMounted(async () => {
  await Promise.all([
    fetchListing(),
    fetchUserDogs()
  ])
})
</script>
