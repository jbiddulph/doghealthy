<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Hero Section -->
    <div v-if="heroImage" class="relative h-64 bg-cover bg-center" :style="{ backgroundImage: `url(${heroImage})` }">
      <div class="absolute inset-0 bg-black opacity-30"></div>
      <div class="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center">
        <div>
          <h1 class="text-4xl font-bold text-white mb-2">Community Members</h1>
          <p class="text-xl text-white">Discover other dog owners and their furry friends</p>
        </div>
      </div>
    </div>
    
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Header (if no hero image) -->
      <div v-if="!heroImage" class="mb-8">
        <h1 class="text-3xl font-bold text-gray-900 mb-2">Community Members</h1>
        <p class="text-gray-600">Discover other dog owners and their furry friends. Connect with fellow dog lovers and share experiences about caring for your pets.</p>
      </div>
      
      <!-- Info Section -->
      <div v-if="infoImage" class="bg-white rounded-lg shadow-md p-8 mb-8">
        <div class="grid md:grid-cols-2 gap-8 items-center">
          <div v-if="infoImage" class="rounded-lg overflow-hidden">
            <img :src="infoImage.url" :alt="infoImage.description || 'Dog community'" class="w-full h-auto object-cover" />
          </div>
          <div>
            <h2 class="text-2xl font-bold text-gray-900 mb-4">Join Our Dog Lovers Community</h2>
            <p class="text-gray-600 mb-4">
              Our community is made up of thousands of dog owners who are passionate about their pets' health and wellbeing. Browse member profiles to see how others are caring for their dogs, discover new breeds, and get inspired by their stories.
            </p>
            <p class="text-gray-600">
              Whether you're a first-time dog owner or have years of experience, connecting with other members can provide valuable insights, tips, and support for your dog care journey.
            </p>
          </div>
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="text-center py-12">
        <div class="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <p class="mt-4 text-gray-600">Loading members...</p>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
        {{ error }}
      </div>

      <!-- Members List -->
      <div v-else-if="members && members.length > 0">
        <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <div
            v-for="member in members"
            :key="member.id"
            class="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
          >
            <!-- Member Header -->
            <div class="p-6 border-b border-gray-200">
              <div class="flex items-center gap-4">
                <div class="flex-shrink-0">
                  <img
                    v-if="member.avatarUrl"
                    :src="member.avatarUrl"
                    :alt="member.fullName || 'Member'"
                    class="h-16 w-16 rounded-full object-cover"
                  />
                  <div
                    v-else
                    class="h-16 w-16 rounded-full bg-blue-100 flex items-center justify-center text-2xl font-bold text-blue-600"
                  >
                    {{ getInitials(member.fullName) }}
                  </div>
                </div>
                <div class="flex-1 min-w-0">
                  <h3 class="text-lg font-semibold text-gray-900 truncate">
                    {{ member.fullName || 'Anonymous Member' }}
                  </h3>
                  <p class="text-sm text-gray-400 mt-1">
                    {{ formatDate(member.createdAt) }}
                  </p>
                </div>
              </div>
            </div>

            <!-- Member's Dogs -->
            <div class="p-6">
              <h4 class="text-sm font-semibold text-gray-700 mb-3">
                Dogs ({{ member.dogs.length }})
              </h4>
              <div v-if="member.dogs.length > 0" class="space-y-3">
                <div
                  v-for="dog in member.dogs"
                  :key="dog.id"
                  class="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div class="flex-shrink-0">
                    <img
                      v-if="dog.photoUrl"
                      :src="dog.photoUrl"
                      :alt="dog.name"
                      class="h-12 w-12 rounded-full object-cover"
                    />
                    <div
                      v-else
                      class="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center text-xl"
                    >
                      🐕
                    </div>
                  </div>
                  <div class="flex-1 min-w-0">
                    <p class="font-medium text-gray-900 truncate">{{ dog.name }}</p>
                    <p class="text-sm text-gray-600 truncate">
                      <span v-if="dog.breed">{{ dog.breed }}</span>
                      <span v-if="dog.breed && dog.gender"> • </span>
                      <span v-if="dog.gender">{{ dog.gender }}</span>
                      <span v-if="dog.birthDate"> • {{ formatAge(dog.birthDate) }}</span>
                    </p>
                  </div>
                </div>
              </div>
              <div v-else class="text-center py-4 text-gray-500 text-sm">
                No dogs registered yet
              </div>
            </div>
          </div>
        </div>

        <!-- Pagination -->
        <div class="flex items-center justify-between border-t border-gray-200 pt-6">
          <div class="flex-1 flex justify-between sm:hidden">
            <button
              @click="goToPage(currentPage - 1)"
              :disabled="!pagination.hasPreviousPage"
              class="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <button
              @click="goToPage(currentPage + 1)"
              :disabled="!pagination.hasNextPage"
              class="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
          <div class="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div>
              <p class="text-sm text-gray-700">
                Showing
                <span class="font-medium">{{ (currentPage - 1) * pageSize + 1 }}</span>
                to
                <span class="font-medium">{{ Math.min(currentPage * pageSize, pagination.totalCount) }}</span>
                of
                <span class="font-medium">{{ pagination.totalCount }}</span>
                members
              </p>
            </div>
            <div>
              <nav class="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                <button
                  @click="goToPage(currentPage - 1)"
                  :disabled="!pagination.hasPreviousPage"
                  class="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 text-sm font-medium text-gray-500 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span class="sr-only">Previous</span>
                  <svg class="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fill-rule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clip-rule="evenodd" />
                  </svg>
                </button>
                <template v-for="pageNum in visiblePages" :key="pageNum">
                  <button
                    v-if="pageNum !== -1"
                    @click="goToPage(pageNum)"
                    :class="[
                      'relative inline-flex items-center px-4 py-2 border text-sm font-medium',
                      pageNum === currentPage
                        ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                        : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                    ]"
                  >
                    {{ pageNum }}
                  </button>
                  <span
                    v-else
                    class="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700"
                  >
                    ...
                  </span>
                </template>
                <button
                  @click="goToPage(currentPage + 1)"
                  :disabled="!pagination.hasNextPage"
                  class="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 text-sm font-medium text-gray-500 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span class="sr-only">Next</span>
                  <svg class="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd" />
                  </svg>
                </button>
              </nav>
            </div>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div v-else class="text-center py-12">
        <div class="text-6xl mb-4">👥</div>
        <h2 class="text-2xl font-semibold text-gray-900 mb-2">No members found</h2>
        <p class="text-gray-600">There are no members to display at this time.</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Dog {
  id: string
  name: string
  breed?: string
  gender?: string
  birthDate?: string
  photoUrl?: string
}

interface Member {
  id: string
  fullName?: string
  avatarUrl?: string
  createdAt: string
  dogs: Dog[]
}

interface Pagination {
  page: number
  pageSize: number
  totalCount: number
  totalPages: number
  hasNextPage: boolean
  hasPreviousPage: boolean
}

// SEO Meta tags
usePageSeo({
  title: 'DogHealthy Community — Meet UK Dog Owners',
  description:
    'Explore the DogHealthy community of UK dog owners. See member profiles, discover breeds, and get inspired by how others care for their dogs’ health and wellbeing.',
  keywords:
    'dog owner community UK, DogHealthy members, dog lovers UK, pet owner profiles, dog breeds community',
  path: '/members'
})

const route = useRoute()
const router = useRouter()
const { fetchImageWithFallback } = useUnsplash()

// Images
const heroImage = ref('')
const infoImage = ref<{ url: string; description?: string } | null>(null)

onMounted(async () => {
  // Load images
  try {
    const image = await fetchImageWithFallback('dog community group', { orientation: 'landscape', width: 1920, height: 600 })
    if (image) {
      heroImage.value = image.url
    }
  } catch (error) {
    // Silently fail
  }

  try {
    const img = await fetchImageWithFallback('dogs playing together', { orientation: 'landscape', width: 800, height: 600 })
    if (img) {
      infoImage.value = img
    }
  } catch (error) {
    // Silently fail
  }

  // Load members
  const page = parseInt(route.query.page as string) || 1
  fetchMembers(page)
})

const members = ref<Member[]>([])
const pagination = ref<Pagination>({
  page: 1,
  pageSize: 12,
  totalCount: 0,
  totalPages: 0,
  hasNextPage: false,
  hasPreviousPage: false
})
const loading = ref(true)
const error = ref('')

const currentPage = computed(() => pagination.value.page)
const pageSize = computed(() => pagination.value.pageSize)

const visiblePages = computed(() => {
  const total = pagination.value.totalPages
  const current = currentPage.value
  const pages: number[] = []
  
  if (total <= 7) {
    // Show all pages if 7 or fewer
    for (let i = 1; i <= total; i++) {
      pages.push(i)
    }
  } else {
    // Show first, last, current, and pages around current
    if (current <= 4) {
      // Near the start
      for (let i = 1; i <= 5; i++) pages.push(i)
      pages.push(-1) // Ellipsis
      pages.push(total)
    } else if (current >= total - 3) {
      // Near the end
      pages.push(1)
      pages.push(-1) // Ellipsis
      for (let i = total - 4; i <= total; i++) pages.push(i)
    } else {
      // In the middle
      pages.push(1)
      pages.push(-1) // Ellipsis
      for (let i = current - 1; i <= current + 1; i++) pages.push(i)
      pages.push(-1) // Ellipsis
      pages.push(total)
    }
  }
  
  return pages
})

const fetchMembers = async (page: number = 1) => {
  try {
    loading.value = true
    error.value = ''
    
    const response = await $fetch('/api/members', {
      query: {
        page,
        pageSize: pageSize.value
      }
    })
    
    members.value = response.members
    pagination.value = response.pagination
    
    // Update URL without navigation
    router.replace({ query: { page: page.toString() } })
  } catch (err: any) {
    console.error('Error fetching members:', err)
    error.value = err.message || 'Failed to load members'
    members.value = []
  } finally {
    loading.value = false
  }
}

const goToPage = (page: number) => {
  if (page < 1 || page > pagination.value.totalPages) return
  fetchMembers(page)
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-GB', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

const formatAge = (birthDate: string) => {
  const birth = new Date(birthDate)
  const now = new Date()
  const years = now.getFullYear() - birth.getFullYear()
  const months = now.getMonth() - birth.getMonth()
  
  if (years > 0) {
    return months < 0 ? `${years - 1} years old` : `${years} years old`
  } else {
    return months > 0 ? `${months} months old` : 'Less than a month old'
  }
}

const getInitials = (name?: string) => {
  if (!name) return '?'
  return name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}
</script>

