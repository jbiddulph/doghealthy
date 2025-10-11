<template>
  <div class="min-h-screen bg-gray-50 py-8">
    <div class="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
      <!-- Header -->
      <div class="text-center mb-8">
        <h1 class="text-4xl font-bold text-gray-900 mb-2">🎯 Dog Food Finder Quiz</h1>
        <p class="text-xl text-gray-600">Answer a few questions to find the perfect food for your dog</p>
      </div>

      <!-- Quiz Progress -->
      <div class="mb-8">
        <div class="flex justify-between items-center mb-2">
          <span class="text-sm font-medium text-gray-700">Question {{ currentQuestion + 1 }} of {{ questions.length }}</span>
          <span class="text-sm text-gray-500">{{ Math.round(((currentQuestion + 1) / questions.length) * 100) }}% Complete</span>
        </div>
        <div class="w-full bg-gray-200 rounded-full h-2">
          <div
            class="bg-blue-600 h-2 rounded-full transition-all duration-300"
            :style="{ width: `${((currentQuestion + 1) / questions.length) * 100}%` }"
          ></div>
        </div>
      </div>

      <!-- Question Card -->
      <div v-if="!showResults" class="bg-white rounded-lg shadow-md p-8">
        <h2 class="text-2xl font-semibold text-gray-900 mb-6">
          {{ questions[currentQuestion].question }}
        </h2>

        <div class="space-y-3">
          <button
            v-for="option in questions[currentQuestion].options"
            :key="option.value"
            @click="selectAnswer(option.value)"
            class="w-full text-left p-4 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all"
          >
            <div class="flex items-center">
              <span class="text-2xl mr-3">{{ option.emoji }}</span>
              <span class="text-lg">{{ option.label }}</span>
            </div>
          </button>
        </div>

        <!-- Navigation -->
        <div class="flex justify-between mt-6">
          <button
            v-if="currentQuestion > 0"
            @click="previousQuestion"
            class="px-6 py-2 text-gray-700 hover:text-gray-900"
          >
            ← Previous
          </button>
          <div v-else></div>
          
          <NuxtLink
            to="/food-finder"
            class="text-gray-500 hover:text-gray-700"
          >
            Skip Quiz
          </NuxtLink>
        </div>
      </div>

      <!-- Results -->
      <div v-else class="space-y-6">
        <div class="bg-white rounded-lg shadow-md p-8 text-center">
          <div class="text-6xl mb-4">🎉</div>
          <h2 class="text-3xl font-bold text-gray-900 mb-2">Your Perfect Match!</h2>
          <p class="text-gray-600 mb-6">Based on your answers, here are the best foods for your dog:</p>
          
          <!-- Email Capture -->
          <div v-if="!emailCaptured" class="max-w-md mx-auto mb-8">
            <div class="bg-gradient-to-r from-green-50 to-blue-50 border-2 border-green-300 rounded-lg p-6">
              <h3 class="text-lg font-semibold text-gray-900 mb-2">
                📧 Get Your Free PDF Guide
              </h3>
              <p class="text-sm text-gray-600 mb-4">
                Receive "Complete Dog Nutrition Guide" plus personalized food recommendations
              </p>
              <form @submit.prevent="captureEmail" class="flex gap-2">
                <input
                  v-model="email"
                  type="email"
                  required
                  placeholder="your@email.com"
                  class="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                />
                <button
                  type="submit"
                  :disabled="submittingEmail"
                  class="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg transition-colors disabled:opacity-50"
                >
                  {{ submittingEmail ? 'Sending...' : 'Get Guide' }}
                </button>
              </form>
              <p class="text-xs text-gray-500 mt-2">We respect your privacy. Unsubscribe anytime.</p>
            </div>
          </div>

          <div v-else class="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
            <p class="text-green-800">✅ Check your email for your free nutrition guide!</p>
          </div>
        </div>

        <!-- Recommended Products -->
        <div class="grid md:grid-cols-2 gap-6">
          <div
            v-for="(product, index) in recommendedProducts"
            :key="product.id"
            class="bg-white rounded-lg shadow-md overflow-hidden"
          >
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
              
              <div v-if="index === 0" class="absolute top-2 left-2">
                <span class="bg-yellow-500 text-white text-sm font-semibold px-3 py-1 rounded">
                  🏆 #1 Recommended
                </span>
              </div>
            </div>

            <div class="p-4">
              <p class="text-sm text-gray-500">{{ product.brand }}</p>
              <h3 class="text-xl font-semibold text-gray-900 mb-2">{{ product.name }}</h3>
              <p class="text-sm text-gray-600 mb-4">{{ product.description }}</p>

              <div class="flex justify-between items-center">
                <div class="text-2xl font-bold text-gray-900">£{{ product.price_gbp.toFixed(2) }}</div>
                <a
                  :href="product.affiliate_link"
                  @click="trackClick(product)"
                  target="_blank"
                  rel="noopener sponsored"
                  class="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors font-semibold"
                >
                  Buy Now
                </a>
              </div>
            </div>
          </div>
        </div>

        <!-- Actions -->
        <div class="flex justify-center gap-4 mt-8">
          <button
            @click="restartQuiz"
            class="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Retake Quiz
          </button>
          <NuxtLink
            to="/food-finder"
            class="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            View All Products
          </NuxtLink>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const supabase = useSupabase()
const authStore = useAuthStore()

const currentQuestion = ref(0)
const showResults = ref(false)
const answers = ref<Record<string, string>>({})
const recommendedProducts = ref<any[]>([])
const email = ref('')
const emailCaptured = ref(false)
const submittingEmail = ref(false)

const questions = [
  {
    id: 'breed_size',
    question: 'What size is your dog?',
    options: [
      { label: 'Small (under 10kg)', value: 'small', emoji: '🐕' },
      { label: 'Medium (10-25kg)', value: 'medium', emoji: '🐶' },
      { label: 'Large (over 25kg)', value: 'large', emoji: '🦮' }
    ]
  },
  {
    id: 'life_stage',
    question: 'How old is your dog?',
    options: [
      { label: 'Puppy (under 1 year)', value: 'puppy', emoji: '🐾' },
      { label: 'Adult (1-7 years)', value: 'adult', emoji: '🦴' },
      { label: 'Senior (7+ years)', value: 'senior', emoji: '👴' }
    ]
  },
  {
    id: 'food_type',
    question: 'What type of food do you prefer?',
    options: [
      { label: 'Dry Food (Kibble)', value: 'dry', emoji: '🥘' },
      { label: 'Wet Food (Cans/Pouches)', value: 'wet', emoji: '🥫' },
      { label: 'Raw Food', value: 'raw', emoji: '🥩' },
      { label: 'No Preference', value: '', emoji: '🤷' }
    ]
  },
  {
    id: 'special_needs',
    question: 'Does your dog have any special dietary needs?',
    options: [
      { label: 'Grain Free', value: 'grain-free', emoji: '🌾' },
      { label: 'Hypoallergenic', value: 'hypoallergenic', emoji: '💊' },
      { label: 'Weight Management', value: 'weight-management', emoji: '⚖️' },
      { label: 'Sensitive Stomach', value: 'sensitive-stomach', emoji: '🩺' },
      { label: 'No Special Needs', value: '', emoji: '✅' }
    ]
  },
  {
    id: 'budget',
    question: 'What\'s your monthly budget for dog food?',
    options: [
      { label: 'Budget Friendly (Under £30)', value: '0-30', emoji: '💷' },
      { label: 'Mid-Range (£30-£60)', value: '30-60', emoji: '💰' },
      { label: 'Premium (£60+)', value: '60+', emoji: '💎' },
      { label: 'Any Budget', value: '', emoji: '🤷' }
    ]
  }
]

const selectAnswer = async (value: string) => {
  answers.value[questions[currentQuestion.value].id] = value
  
  if (currentQuestion.value < questions.length - 1) {
    currentQuestion.value++
  } else {
    await showRecommendations()
  }
}

const previousQuestion = () => {
  if (currentQuestion.value > 0) {
    currentQuestion.value--
  }
}

const showRecommendations = async () => {
  try {
    // Build query based on answers
    let query = supabase
      .from('doghealthy_dog_food_products')
      .select('*')
      .eq('is_active', true)
    
    // Apply filters from quiz answers
    if (answers.value.breed_size) {
      query = query.or(`breed_size.eq.${answers.value.breed_size},breed_size.eq.all`)
    }
    
    if (answers.value.life_stage) {
      query = query.or(`life_stage.eq.${answers.value.life_stage},life_stage.eq.all`)
    }
    
    if (answers.value.food_type) {
      query = query.eq('food_type', answers.value.food_type)
    }
    
    if (answers.value.special_needs) {
      query = query.eq('special_diet', answers.value.special_needs)
    }
    
    if (answers.value.budget) {
      const [min, max] = answers.value.budget.split('-').map(v => v === '+' ? 999999 : parseFloat(v))
      if (max < 999999) {
        query = query.gte('price_gbp', min).lte('price_gbp', max)
      } else {
        query = query.gte('price_gbp', min)
      }
    }
    
    const { data, error } = await query.order('avg_rating', { ascending: false }).limit(4)
    
    if (error) {
      console.error('Error fetching recommendations:', error)
      return
    }
    
    recommendedProducts.value = data || []
    showResults.value = true
  } catch (err) {
    console.error('Error:', err)
  }
}

const trackClick = async (product: any) => {
  try {
    await supabase
      .from('doghealthy_affiliate_clicks')
      .insert({
        product_id: product.id,
        user_id: authStore.userId || null,
        retailer: product.retailer,
        utm_source: 'doghealthy',
        utm_medium: 'quiz',
        utm_campaign: 'recommendation'
      })
  } catch (err) {
    console.error('Error tracking click:', err)
  }
}

const captureEmail = async () => {
  try {
    submittingEmail.value = true
    
    // TODO: Integrate with your email service provider
    // For now, just log it (you can add Mailchimp, ConvertKit, etc. later)
    console.log('Email captured:', email.value)
    console.log('Quiz answers:', answers.value)
    console.log('Recommended products:', recommendedProducts.value.map(p => p.name))
    
    // You can store leads in Supabase for now
    await supabase
      .from('doghealthy_email_leads')
      .insert({
        email: email.value,
        source: 'food-quiz',
        quiz_answers: answers.value,
        recommended_products: recommendedProducts.value.map(p => p.id)
      })
      .then(() => {
        emailCaptured.value = true
      })
      .catch((err) => {
        console.error('Error saving email:', err)
        // Still show success even if DB insert fails
        emailCaptured.value = true
      })
    
  } catch (err) {
    console.error('Error capturing email:', err)
  } finally {
    submittingEmail.value = false
  }
}

const restartQuiz = () => {
  currentQuestion.value = 0
  showResults.value = false
  answers.value = {}
  emailCaptured.value = false
  email.value = ''
}

// Set page meta
useHead({
  title: 'Dog Food Quiz - Find Your Perfect Match | DogHealthy',
  meta: [
    { name: 'description', content: 'Take our quick quiz to find the best dog food for your pet based on breed, age, dietary needs, and budget.' }
  ]
})
</script>

