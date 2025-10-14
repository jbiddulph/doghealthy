<template>
  <div class="container mx-auto px-4 py-8 max-w-4xl">
    <!-- Header -->
    <div class="mb-8">
      <NuxtLink to="/classifieds" class="inline-flex items-center text-secondary hover:text-primary mb-4">
        <i class="bi bi-arrow-left mr-2"></i>
        Back to Classifieds
      </NuxtLink>
      <h1 class="text-4xl font-bold text-dark mb-4">Create New Listing</h1>
      <p class="text-secondary text-lg">List your dog for sale to find the perfect home</p>
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

      <!-- Images -->
      <div class="bg-white rounded-lg shadow-sm border border-muted p-6">
        <h2 class="text-xl font-semibold text-dark mb-4">Images</h2>
        
        <div class="border-2 border-dashed border-muted rounded-lg p-8 text-center">
          <div class="text-4xl text-secondary mb-4">📷</div>
          <p class="text-secondary mb-4">Upload images of your dog (coming soon)</p>
          <p class="text-sm text-secondary">For now, you can add image URLs manually in the description</p>
        </div>
      </div>

      <!-- Premium Options -->
      <div class="bg-white rounded-lg shadow-sm border border-muted p-6">
        <h2 class="text-xl font-semibold text-dark mb-4">Listing Options</h2>
        
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div class="border border-muted rounded-lg p-4">
            <h3 class="font-semibold text-dark mb-2">Basic Listing - Free</h3>
            <ul class="text-sm text-secondary space-y-1 mb-4">
              <li>• Standard listing placement</li>
              <li>• Contact form</li>
              <li>• Basic search visibility</li>
            </ul>
            <div class="text-2xl font-bold text-primary">£0.00</div>
          </div>
          
          <div class="border border-primary rounded-lg p-4 bg-primary bg-opacity-5">
            <h3 class="font-semibold text-dark mb-2">Premium Listing - £9.99</h3>
            <ul class="text-sm text-secondary space-y-1 mb-4">
              <li>• Highlighted listing</li>
              <li>• Premium badge</li>
              <li>• Higher search ranking</li>
              <li>• More views</li>
            </ul>
            <div class="text-2xl font-bold text-primary">£9.99</div>
            <label class="flex items-center mt-2">
              <input v-model="form.is_premium" type="checkbox" class="mr-2">
              <span class="text-sm">Upgrade to Premium</span>
            </label>
          </div>
        </div>
        
        <div class="mt-6 p-4 bg-accent bg-opacity-10 border border-accent rounded-lg">
          <h3 class="font-semibold text-dark mb-2">Featured Listing - £19.99</h3>
          <ul class="text-sm text-secondary space-y-1 mb-4">
            <li>• Top placement in search results</li>
            <li>• Featured badge and highlighting</li>
            <li>• Maximum visibility</li>
            <li>• 30-day featured period</li>
          </ul>
          <div class="text-2xl font-bold text-accent">£19.99</div>
          <label class="flex items-center mt-2">
            <input v-model="form.is_featured" type="checkbox" class="mr-2">
            <span class="text-sm">Upgrade to Featured</span>
          </label>
        </div>
      </div>

      <!-- Submit -->
      <div class="flex justify-end gap-4">
        <NuxtLink to="/classifieds" class="bg-secondary hover:bg-dark text-white px-6 py-3 rounded-lg font-semibold transition-colors">
          Cancel
        </NuxtLink>
        <button 
          type="submit" 
          :disabled="saving"
          class="bg-primary hover:bg-accent text-dark px-6 py-3 rounded-lg font-semibold transition-colors disabled:bg-muted disabled:cursor-not-allowed"
        >
          <span v-if="saving">Creating Listing...</span>
          <span v-else>Create Listing</span>
        </button>
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useSupabase } from '~/composables/useSupabase'
import { useAuthStore } from '~/stores/auth'
import { useRouter } from 'vue-router'

// Define page meta
definePageMeta({
  middleware: 'auth'
})

const supabase = useSupabase()
const authStore = useAuthStore()
const router = useRouter()

// SEO Meta tags
useHead({
  title: 'Create Dog Listing - Sell Your Dog | DogHealthy Classifieds',
  meta: [
    { 
      name: 'description', 
      content: 'Create a professional dog listing to find the perfect home for your dog. Free to list, premium upgrades available. Secure messaging and verified buyers.' 
    },
    { name: 'keywords', content: 'create dog listing, sell my dog, dog for sale, puppy listing, dog classifieds, list my dog' },
    { property: 'og:title', content: 'Create Dog Listing - Sell Your Dog | DogHealthy' },
    { property: 'og:description', content: 'Create a professional dog listing to find the perfect home for your dog. Free to list, premium upgrades available.' },
    { property: 'og:type', content: 'website' },
    { name: 'robots', content: 'noindex, nofollow' } // Don't index create pages
  ]
})

// State
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
  is_premium: false,
  is_featured: false,
  images: []
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

// Methods
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

    // Prepare listing data
    const listingData = {
      user_id: authStore.userId,
      dog_id: form.value.dog_id || null,
      title: form.value.title,
      description: form.value.description,
      breed: form.value.breed,
      gender: form.value.gender || null,
      age_weeks: form.value.age_weeks || null,
      price_gbp: form.value.price_gbp,
      location: form.value.location,
      images: form.value.images,
      is_premium: form.value.is_premium,
      is_featured: form.value.is_featured,
      status: 'active',
      view_count: 0
    }

    // If featured, set featured_until date (30 days from now)
    if (form.value.is_featured) {
      const featuredUntil = new Date()
      featuredUntil.setDate(featuredUntil.getDate() + 30)
      listingData.featured_until = featuredUntil.toISOString()
    }

    const { data, error } = await supabase
      .from('doghealthy_listings')
      .insert(listingData)
      .select()
      .single()

    if (error) throw error

    // If premium or featured, redirect to payment
    if (form.value.is_premium || form.value.is_featured) {
      const upgradeType = form.value.is_featured ? 'featured' : 'premium'
      try {
        const { createCheckoutSession } = useStripe()
        await createCheckoutSession(data.id, upgradeType)
        return // Don't redirect, Stripe will handle it
      } catch (error) {
        console.error('Error creating checkout session:', error)
        alert('Listing created but payment failed. You can upgrade later.')
      }
    }

    // Redirect to the new listing
    router.push(`/classifieds/${data.id}`)
  } catch (error) {
    console.error('Error creating listing:', error)
    alert('Error creating listing. Please try again.')
  } finally {
    saving.value = false
  }
}

// Lifecycle
onMounted(() => {
  fetchUserDogs()
})
</script>
