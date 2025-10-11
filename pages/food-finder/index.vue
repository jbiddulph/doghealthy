<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Hero Section -->
    <div class="bg-gradient-to-r from-blue-600 to-blue-700 text-white py-16">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h1 class="text-4xl md:text-5xl font-bold mb-4">🍖 Dog Food Finder</h1>
        <p class="text-xl md:text-2xl text-blue-100 mb-8">
          Find the perfect food for your furry friend
        </p>
        
        <!-- Search Bar -->
        <div class="max-w-2xl mx-auto">
          <div class="relative">
            <input
              v-model="searchQuery"
              type="text"
              placeholder="Search by brand, ingredient, or food type..."
              class="w-full px-6 py-4 rounded-lg text-gray-900 text-lg focus:outline-none focus:ring-4 focus:ring-blue-300"
              @input="handleSearch"
            />
            <svg class="absolute right-4 top-4 w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>
      </div>
    </div>

    <!-- Filters Section -->
    <div class="bg-white border-b border-gray-200 py-6">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex flex-wrap gap-4">
          <!-- Food Type Filter -->
          <select
            v-model="filters.foodType"
            @change="handleSearch"
            class="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Food Types</option>
            <option value="dry">Dry Food</option>
            <option value="wet">Wet Food</option>
            <option value="raw">Raw Food</option>
            <option value="freeze-dried">Freeze-Dried</option>
          </select>

          <!-- Breed Size Filter -->
          <select
            v-model="filters.breedSize"
            @change="handleSearch"
            class="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Breed Sizes</option>
            <option value="small">Small Breeds</option>
            <option value="medium">Medium Breeds</option>
            <option value="large">Large Breeds</option>
            <option value="all">All Breeds</option>
          </select>

          <!-- Life Stage Filter -->
          <select
            v-model="filters.lifeStage"
            @change="handleSearch"
            class="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Life Stages</option>
            <option value="puppy">Puppy</option>
            <option value="adult">Adult</option>
            <option value="senior">Senior</option>
          </select>

          <!-- Price Range Filter -->
          <select
            v-model="filters.priceRange"
            @change="handleSearch"
            class="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Prices</option>
            <option value="0-30">Under £30</option>
            <option value="30-50">£30 - £50</option>
            <option value="50-100">£50 - £100</option>
            <option value="100+">£100+</option>
          </select>

          <!-- Special Diet Filter -->
          <select
            v-model="filters.specialDiet"
            @change="handleSearch"
            class="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Special Diets</option>
            <option value="grain-free">Grain Free</option>
            <option value="hypoallergenic">Hypoallergenic</option>
            <option value="weight-management">Weight Management</option>
            <option value="sensitive-stomach">Sensitive Stomach</option>
          </select>

          <!-- Sort By -->
          <select
            v-model="sortBy"
            @change="handleSearch"
            class="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="rating">Highest Rated</option>
            <option value="price-low">Price: Low to High</option>
            <option value="price-high">Price: High to Low</option>
            <option value="name">Name A-Z</option>
          </select>

          <!-- Clear Filters -->
          <button
            v-if="hasActiveFilters"
            @click="clearFilters"
            class="px-4 py-2 text-blue-600 hover:text-blue-700 font-medium"
          >
            Clear All Filters
          </button>
        </div>
      </div>
    </div>

    <!-- Results Section -->
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Loading State -->
      <div v-if="loading" class="text-center py-12">
        <div class="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <p class="mt-4 text-gray-600">Loading products...</p>
      </div>

      <!-- Results -->
      <div v-else>
        <!-- Results Header -->
        <div class="flex justify-between items-center mb-6">
          <h2 class="text-2xl font-bold text-gray-900">
            {{ filteredProducts.length }} Product{{ filteredProducts.length !== 1 ? 's' : '' }} Found
          </h2>
          <NuxtLink
            to="/food-finder/quiz"
            class="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg transition-colors"
          >
            🎯 Take Food Quiz
          </NuxtLink>
        </div>

        <!-- No Results -->
        <div v-if="filteredProducts.length === 0" class="text-center py-12 bg-white rounded-lg">
          <svg class="mx-auto h-16 w-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p class="mt-4 text-xl text-gray-600">No products match your filters</p>
          <button
            @click="clearFilters"
            class="mt-4 text-blue-600 hover:text-blue-700 font-medium"
          >
            Clear filters to see all products
          </button>
        </div>

        <!-- Product Grid -->
        <div v-else class="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div
            v-for="product in filteredProducts"
            :key="product.id"
            class="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
          >
            <!-- Product Image -->
            <div class="relative">
              <img
                v-if="product.image_url"
                :src="product.image_url"
                :alt="product.name"
                class="w-full h-48 object-cover"
              />
              <div v-else class="w-full h-48 bg-gray-200 flex items-center justify-center">
                <span class="text-6xl">🍖</span>
              </div>
              
              <!-- Badges -->
              <div class="absolute top-2 left-2 flex flex-col gap-1">
                <span v-if="product.is_editors_choice" class="bg-yellow-500 text-white text-xs font-semibold px-2 py-1 rounded">
                  ⭐ Editor's Choice
                </span>
                <span v-if="product.is_best_value" class="bg-green-600 text-white text-xs font-semibold px-2 py-1 rounded">
                  💰 Best Value
                </span>
                <span v-if="product.is_grain_free" class="bg-purple-600 text-white text-xs font-semibold px-2 py-1 rounded">
                  🌾 Grain Free
                </span>
              </div>
            </div>

            <!-- Product Info -->
            <div class="p-4">
              <div class="flex justify-between items-start mb-2">
                <div>
                  <p class="text-sm text-gray-500">{{ product.brand }}</p>
                  <h3 class="text-lg font-semibold text-gray-900">{{ product.name }}</h3>
                </div>
                <div class="text-right">
                  <div v-if="product.avg_rating > 0" class="flex items-center text-yellow-500">
                    <span class="mr-1">★</span>
                    <span class="text-sm text-gray-700">{{ product.avg_rating.toFixed(1) }}</span>
                  </div>
                </div>
              </div>

              <p class="text-sm text-gray-600 mb-3 line-clamp-2">{{ product.description }}</p>

              <!-- Nutrition Summary -->
              <div class="grid grid-cols-3 gap-2 mb-3 text-xs text-gray-600">
                <div class="text-center p-2 bg-gray-50 rounded">
                  <div class="font-semibold text-gray-900">{{ product.protein_percent }}%</div>
                  <div>Protein</div>
                </div>
                <div class="text-center p-2 bg-gray-50 rounded">
                  <div class="font-semibold text-gray-900">{{ product.fat_percent }}%</div>
                  <div>Fat</div>
                </div>
                <div class="text-center p-2 bg-gray-50 rounded">
                  <div class="font-semibold text-gray-900">{{ product.package_size_kg }}kg</div>
                  <div>Size</div>
                </div>
              </div>

              <!-- Price & CTA -->
              <div class="flex justify-between items-center pt-3 border-t border-gray-200">
                <div>
                  <div class="text-2xl font-bold text-gray-900">£{{ product.price_gbp.toFixed(2) }}</div>
                  <div class="text-xs text-gray-500">£{{ product.price_per_kg.toFixed(2)}} /kg</div>
                  <div class="text-xs text-gray-400 italic">Price may vary</div>
                </div>
                <a
                  :href="product.affiliate_link"
                  @click="trackClick(product)"
                  target="_blank"
                  rel="noopener sponsored"
                  class="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors font-semibold"
                >
                  Buy Now
                </a>
              </div>

              <!-- Retailer -->
              <div class="mt-2 text-xs text-gray-500 text-center">
                via {{ product.retailer }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Info Callout -->
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
      <div class="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <div class="flex items-start">
          <svg class="w-6 h-6 text-blue-600 mr-3 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div>
            <h3 class="font-semibold text-blue-900 mb-1">Affiliate Disclosure</h3>
            <p class="text-sm text-blue-800">
              DogHealthy earns a commission from qualifying purchases through our affiliate links at no extra cost to you. 
              This helps us maintain the service and provide free health tracking for your dogs. Thank you for your support! 🐕
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const supabase = useSupabase()

interface DogFoodProduct {
  id: string
  name: string
  brand: string
  description: string | null
  image_url: string | null
  food_type: string | null
  breed_size: string | null
  life_stage: string | null
  special_diet: string | null
  protein_percent: number | null
  fat_percent: number | null
  price_gbp: number
  price_per_kg: number
  package_size_kg: number
  affiliate_link: string
  retailer: string
  avg_rating: number
  is_editors_choice: boolean
  is_best_value: boolean
  is_grain_free: boolean
  slug: string
}

const products = ref<DogFoodProduct[]>([])
const filteredProducts = ref<DogFoodProduct[]>([])
const loading = ref(true)
const searchQuery = ref('')

const filters = ref({
  foodType: '',
  breedSize: '',
  lifeStage: '',
  priceRange: '',
  specialDiet: ''
})

const sortBy = ref('rating')

const hasActiveFilters = computed(() => {
  return searchQuery.value !== '' || 
         filters.value.foodType !== '' ||
         filters.value.breedSize !== '' ||
         filters.value.lifeStage !== '' ||
         filters.value.priceRange !== '' ||
         filters.value.specialDiet !== ''
})

const fetchProducts = async () => {
  try {
    loading.value = true
    
    const { data, error } = await supabase
      .from('doghealthy_dog_food_products')
      .select('*')
      .eq('is_active', true)
      .order('avg_rating', { ascending: false })
    
    if (error) {
      console.error('Error fetching products:', error)
      return
    }
    
    products.value = data || []
    applyFiltersAndSort()
  } catch (err) {
    console.error('Error:', err)
  } finally {
    loading.value = false
  }
}

const applyFiltersAndSort = () => {
  let result = [...products.value]
  
  // Apply search query
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    result = result.filter(p => 
      p.name.toLowerCase().includes(query) ||
      p.brand.toLowerCase().includes(query) ||
      p.description?.toLowerCase().includes(query) ||
      p.food_type?.toLowerCase().includes(query)
    )
  }
  
  // Apply filters
  if (filters.value.foodType) {
    result = result.filter(p => p.food_type === filters.value.foodType)
  }
  
  if (filters.value.breedSize) {
    result = result.filter(p => p.breed_size === filters.value.breedSize || p.breed_size === 'all')
  }
  
  if (filters.value.lifeStage) {
    result = result.filter(p => p.life_stage === filters.value.lifeStage || p.life_stage === 'all')
  }
  
  if (filters.value.priceRange) {
    const [min, max] = filters.value.priceRange.split('-').map(v => v === '+' ? Infinity : parseFloat(v))
    result = result.filter(p => {
      if (max === Infinity) return p.price_gbp >= min
      return p.price_gbp >= min && p.price_gbp <= max
    })
  }
  
  if (filters.value.specialDiet) {
    result = result.filter(p => p.special_diet === filters.value.specialDiet)
  }
  
  // Apply sorting
  switch (sortBy.value) {
    case 'rating':
      result.sort((a, b) => (b.avg_rating || 0) - (a.avg_rating || 0))
      break
    case 'price-low':
      result.sort((a, b) => a.price_gbp - b.price_gbp)
      break
    case 'price-high':
      result.sort((a, b) => b.price_gbp - a.price_gbp)
      break
    case 'name':
      result.sort((a, b) => a.name.localeCompare(b.name))
      break
  }
  
  // Prioritize editor's choice and best value
  result.sort((a, b) => {
    if (a.is_editors_choice && !b.is_editors_choice) return -1
    if (!a.is_editors_choice && b.is_editors_choice) return 1
    if (a.is_best_value && !b.is_best_value) return -1
    if (!a.is_best_value && b.is_best_value) return 1
    return 0
  })
  
  filteredProducts.value = result
}

const handleSearch = () => {
  applyFiltersAndSort()
}

const clearFilters = () => {
  searchQuery.value = ''
  filters.value = {
    foodType: '',
    breedSize: '',
    lifeStage: '',
    priceRange: '',
    specialDiet: ''
  }
  sortBy.value = 'rating'
  applyFiltersAndSort()
}

const trackClick = async (product: DogFoodProduct) => {
  try {
    const authStore = useAuthStore()
    
    await supabase
      .from('doghealthy_affiliate_clicks')
      .insert({
        product_id: product.id,
        user_id: authStore.userId || null,
        retailer: product.retailer,
        utm_source: 'doghealthy',
        utm_medium: 'food-finder',
        utm_campaign: 'comparison'
      })
  } catch (err) {
    console.error('Error tracking click:', err)
    // Don't block the navigation even if tracking fails
  }
}

onMounted(() => {
  fetchProducts()
})

// Set page meta
useHead({
  title: 'Dog Food Finder - Compare & Find the Best Dog Food | DogHealthy',
  meta: [
    { name: 'description', content: 'Find and compare the best dog food for your pet. Filter by breed size, food type, price, and special dietary needs. Expert recommendations and affiliate-backed reviews.' }
  ]
})
</script>

