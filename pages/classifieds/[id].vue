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
      <NuxtLink to="/classifieds" class="inline-flex items-center text-secondary hover:text-primary mb-6">
        <i class="bi bi-arrow-left mr-2"></i>
        Back to Classifieds
      </NuxtLink>

      <div v-if="listing.is_featured" class="bg-primary text-dark px-4 py-2 text-sm font-semibold text-center mb-6 rounded-lg">
        ⭐ Featured Listing
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div class="lg:col-span-2">
          <div class="mb-6">
            <div v-if="listing.images && listing.images.length > 0" class="bg-white rounded-lg shadow-sm border border-muted overflow-hidden">
              <div class="h-96 bg-cover bg-center" :style="{ backgroundImage: `url(${listing.images[0]})` }"></div>
            </div>
            <div v-else class="h-96 bg-muted rounded-lg flex items-center justify-center">
              <div class="text-6xl text-secondary">🐕</div>
            </div>
          </div>

          <div class="bg-white rounded-lg shadow-sm border border-muted p-6 mb-6">
            <h1 class="text-3xl font-bold text-dark mb-4">{{ listing.title }}</h1>
            <div class="prose text-secondary max-w-none">
              <p class="whitespace-pre-wrap">{{ listing.description }}</p>
            </div>
          </div>

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
          <div class="bg-white rounded-lg shadow-sm border border-muted p-6 mb-6 sticky top-6">
            <div class="text-center mb-6">
              <div class="text-4xl font-bold text-primary mb-2">
                £{{ listing.price_gbp?.toFixed(2) || 'Contact' }}
              </div>
              <div v-if="listing.is_premium" class="bg-accent text-white px-3 py-1 rounded-full text-sm font-semibold inline-block">
                Premium Listing
              </div>
            </div>

            <!-- Owner: manage listing -->
            <div v-if="isOwner" class="space-y-3 mb-4">
              <p class="text-center text-sm text-secondary py-2 bg-muted rounded-lg">
                This is your listing
              </p>
              <NuxtLink
                :to="`/classifieds/${listing.id}/edit`"
                class="block w-full text-center bg-secondary hover:bg-dark text-white py-3 px-4 rounded-lg font-semibold transition-colors"
              >
                <i class="bi bi-pencil mr-2"></i>
                Edit listing
              </NuxtLink>
              <button
                type="button"
                :disabled="deleting"
                class="w-full bg-red-100 hover:bg-red-200 text-red-700 py-3 px-4 rounded-lg font-semibold transition-colors disabled:opacity-60"
                @click="deleteListing"
              >
                <i class="bi bi-trash mr-2"></i>
                {{ deleting ? 'Deleting…' : 'Delete listing' }}
              </button>
              <NuxtLink
                to="/classifieds/my-listings"
                class="block w-full text-center text-sm text-primary hover:underline"
              >
                Manage all my listings
              </NuxtLink>
            </div>

            <!-- Logged-in buyer: in-app chat -->
            <div v-else-if="authStore.isAuthenticated" class="space-y-4">
              <button
                type="button"
                class="w-full bg-primary hover:bg-accent text-dark py-3 px-4 rounded-lg font-semibold transition-colors"
                @click="openChat"
              >
                <i class="bi bi-chat-dots mr-2"></i>
                Message Seller
              </button>
              <p class="text-xs text-secondary text-center">
                Chat stays in your DogHealthy account.
              </p>
            </div>

            <!-- Guest: message seller inbox -->
            <div v-else class="space-y-4">
              <h3 class="text-lg font-semibold text-dark">Contact the seller</h3>
              <p class="text-sm text-secondary">
                No account needed — your message goes to their DogHealthy inbox with your contact details so they can reply.
              </p>

              <form class="space-y-3" @submit.prevent="submitGuestContact">
                <!-- Honeypot -->
                <input v-model="guestForm.website" type="text" name="website" tabindex="-1" autocomplete="off" class="hidden" aria-hidden="true">

                <div>
                  <label class="block text-sm font-medium text-dark mb-1">Your name</label>
                  <input
                    v-model="guestForm.name"
                    type="text"
                    required
                    maxlength="120"
                    class="w-full border border-muted rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary focus:border-primary"
                    placeholder="Jane Smith"
                  >
                </div>
                <div>
                  <label class="block text-sm font-medium text-dark mb-1">Your email</label>
                  <input
                    v-model="guestForm.email"
                    type="email"
                    required
                    maxlength="200"
                    class="w-full border border-muted rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary focus:border-primary"
                    placeholder="you@example.com"
                  >
                </div>
                <div>
                  <label class="block text-sm font-medium text-dark mb-1">Phone <span class="text-secondary font-normal">(optional)</span></label>
                  <input
                    v-model="guestForm.phone"
                    type="tel"
                    maxlength="40"
                    class="w-full border border-muted rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary focus:border-primary"
                    placeholder="07…"
                  >
                </div>
                <div>
                  <label class="block text-sm font-medium text-dark mb-1">Message</label>
                  <textarea
                    v-model="guestForm.message"
                    required
                    rows="4"
                    maxlength="4000"
                    class="w-full border border-muted rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary focus:border-primary"
                    placeholder="Ask about the dog, collection, vaccinations…"
                  />
                </div>

                <p v-if="guestError" class="text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                  {{ guestError }}
                </p>
                <p v-if="guestSuccess" class="text-sm text-green-800 bg-green-50 border border-green-200 rounded-lg px-3 py-2">
                  {{ guestSuccess }}
                </p>

                <button
                  type="submit"
                  :disabled="guestSubmitting"
                  class="w-full bg-primary hover:bg-accent text-dark py-3 px-4 rounded-lg font-semibold transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  <i class="bi bi-chat-dots mr-2"></i>
                  {{ guestSubmitting ? 'Sending…' : 'Send message to seller' }}
                </button>
              </form>

              <p class="text-xs text-secondary text-center">
                Prefer in-app chat?
                <NuxtLink to="/auth/register" class="text-primary underline">Create a free account</NuxtLink>
                or
                <NuxtLink to="/auth/login" class="text-primary underline">log in</NuxtLink>.
              </p>
            </div>

            <div v-if="!isOwner" class="space-y-3 mt-4">
              <button
                type="button"
                class="w-full bg-secondary hover:bg-dark text-white py-3 px-4 rounded-lg font-semibold transition-colors"
                @click="shareListing"
              >
                <i class="bi bi-share mr-2"></i>
                Share Listing
              </button>

              <button
                type="button"
                class="w-full bg-red-100 hover:bg-red-200 text-red-600 py-3 px-4 rounded-lg font-semibold transition-colors"
                @click="reportListing"
              >
                <i class="bi bi-flag mr-2"></i>
                Report Listing
              </button>
            </div>

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

    <ChatBox
      v-if="showChat && listing && authStore.userId"
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

// Public listing page — guests can view and contact without an account
const route = useRoute()
const supabase = useSupabase()
const authStore = useAuthStore()

usePageSeo(() => {
  if (!listing.value) {
    return {
      title: 'Dog Listing',
      description: 'View this dog listing on DogHealthy UK classifieds — puppies and dogs for sale across the United Kingdom.',
      keywords: 'dog for sale UK, DogHealthy classifieds, puppy listing',
      path: route.path
    }
  }

  const breed = listing.value.breed || 'Dog'
  const location = listing.value.location || 'UK'
  const title = `${listing.value.title} — ${breed} for Sale`
  const description = `${(listing.value.description || listing.value.title).substring(0, 155)} — ${breed} for sale in ${location}. Listed on DogHealthy UK classifieds.`

  return {
    title,
    description,
    keywords: `${breed}, ${breed} for sale UK, puppy, dog classifieds ${location}, DogHealthy`,
    path: `/classifieds/${listing.value.id}`,
    type: 'product',
    jsonLd: {
      '@context': 'https://schema.org',
      '@type': 'Product',
      name: listing.value.title,
      description: listing.value.description,
      category: 'Pet',
      brand: {
        '@type': 'Brand',
        name: breed
      },
      offers: {
        '@type': 'Offer',
        price: listing.value.price_gbp || 0,
        priceCurrency: 'GBP',
        availability: 'https://schema.org/InStock',
        url: `https://doghealthy.co.uk/classifieds/${listing.value.id}`
      }
    }
  }
})

const listing = ref<any>(null)
const loading = ref(true)
const showChat = ref(false)
const deleting = ref(false)

const guestForm = reactive({
  name: '',
  email: '',
  phone: '',
  message: '',
  website: ''
})
const guestSubmitting = ref(false)
const guestError = ref('')
const guestSuccess = ref('')

const isOwner = computed(() => {
  return listing.value && authStore.userId && listing.value.user_id === authStore.userId
})

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

const fetchListing = async () => {
  try {
    loading.value = true
    const id = route.params.id as string

    // Active listings are public; owners can also open their own non-active listings
    let query = supabase.from('doghealthy_listings').select('*').eq('id', id)

    if (authStore.userId) {
      // Prefer owner's row even if not active
      const { data: owned } = await supabase
        .from('doghealthy_listings')
        .select('*')
        .eq('id', id)
        .eq('user_id', authStore.userId)
        .maybeSingle()

      if (owned) {
        listing.value = owned
        return
      }
    }

    const { data, error } = await query.eq('status', 'active').maybeSingle()
    if (error) throw error
    listing.value = data

    if (data && data.user_id !== authStore.userId) {
      await supabase
        .from('doghealthy_listings')
        .update({ view_count: (data.view_count || 0) + 1 })
        .eq('id', data.id)
    }
  } catch (error) {
    console.error('Error fetching listing:', error)
    listing.value = null
  } finally {
    loading.value = false
  }
}

const deleteListing = async () => {
  if (!listing.value || !isOwner.value || !authStore.userId) return
  if (!confirm('Delete this listing permanently? This cannot be undone.')) return

  deleting.value = true
  try {
    const { error } = await supabase
      .from('doghealthy_listings')
      .delete()
      .eq('id', listing.value.id)
      .eq('user_id', authStore.userId)

    if (error) throw error
    await navigateTo('/classifieds/my-listings')
  } catch (err: any) {
    console.error('Error deleting listing:', err)
    alert(err?.message || 'Could not delete listing. Please try again.')
  } finally {
    deleting.value = false
  }
}

const openChat = () => {
  if (isOwner.value || !authStore.isAuthenticated) return
  showChat.value = true
}

const submitGuestContact = async () => {
  if (!listing.value || isOwner.value) return
  guestError.value = ''
  guestSuccess.value = ''
  guestSubmitting.value = true

  try {
    const result = await $fetch<{ ok?: boolean; message?: string; error?: string }>(
      '/.netlify/functions/classifieds-contact',
      {
        method: 'POST',
        body: {
          listingId: listing.value.id,
          name: guestForm.name,
          email: guestForm.email,
          phone: guestForm.phone,
          message: guestForm.message,
          website: guestForm.website
        }
      }
    )

    guestSuccess.value =
      result.message ||
      'Your message has been emailed to the seller. They can reply directly to your email.'
    guestForm.name = ''
    guestForm.email = ''
    guestForm.phone = ''
    guestForm.message = ''
  } catch (err: any) {
    guestError.value =
      err?.data?.error ||
      err?.message ||
      'Could not send your message. Please try again.'
  } finally {
    guestSubmitting.value = false
  }
}

const shareListing = async () => {
  if (navigator.share) {
    try {
      await navigator.share({
        title: listing.value.title,
        text: listing.value.description,
        url: window.location.href
      })
    } catch {
      // cancelled
    }
  } else {
    await navigator.clipboard.writeText(window.location.href)
    alert('Link copied to clipboard!')
  }
}

const reportListing = () => {
  alert('Thank you for your concern. We will review this listing.')
}

onMounted(() => {
  fetchListing()
})
</script>
