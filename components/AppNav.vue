<template>
  <nav class="bg-white shadow-sm border-b border-muted/40 relative">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex justify-between items-center h-16">
        <div class="flex items-center">
          <NuxtLink to="/" class="flex items-center gap-2 text-xl font-bold text-gray-900">
            <NuxtImg
              src="/logo-96.png"
              alt="DogHealthy logo"
              width="48"
              height="54"
              class="h-12 w-auto"
              format="webp"
              loading="eager"
              densities="1x 2x"
            />
            <span>DogHealthy</span>
          </NuxtLink>
        </div>
        
        <!-- Desktop links -->
        <div class="hidden max-[485px]:hidden md:flex items-center gap-4">
          <NuxtLink
            to="/food-finder"
            class="text-secondary hover:text-dark font-medium"
          >
            Food Finder
          </NuxtLink>
          <NuxtLink
            to="/classifieds"
            class="text-secondary hover:text-dark font-medium"
          >
            Classifieds
          </NuxtLink>
          <NuxtLink
            to="/members"
            class="text-secondary hover:text-dark font-medium"
          >
            Members
          </NuxtLink>
          <template v-if="authStore.isAuthenticated">
            <NuxtLink
              to="/inbox"
              class="relative text-secondary hover:text-dark font-medium"
            >
              Inbox
              <span
                v-if="inboxUnread > 0"
                class="absolute -top-2 -right-3 inline-flex items-center justify-center min-w-[1.15rem] h-[1.15rem] px-1 rounded-full bg-red-600 text-white text-[10px] font-bold"
              >
                {{ inboxUnread > 99 ? '99+' : inboxUnread }}
              </span>
            </NuxtLink>
            <NuxtLink
              to="/dogs"
              class="text-secondary hover:text-dark font-medium"
            >
              My Dogs
            </NuxtLink>
            <NuxtLink
              to="/profile"
              class="text-secondary hover:text-dark font-medium"
            >
              Profile
            </NuxtLink>
            <NotificationBell />
            <button
              @click="handleLogout"
              class="bg-accent hover:brightness-95 text-white px-4 py-2 rounded-lg transition-colors"
            >
              Logout
            </button>
          </template>
          <template v-else-if="!authStore.loading">
            <NuxtLink
              to="/auth/login"
              class="text-secondary hover:text-dark font-medium"
            >
              Login
            </NuxtLink>
            <NuxtLink
              to="/auth/register"
              class="bg-primary hover:brightness-95 text-dark px-4 py-2 rounded-lg transition-colors"
            >
              Register
            </NuxtLink>
          </template>
          <template v-else>
            <div class="animate-pulse text-secondary">Loading...</div>
          </template>
        </div>

        <!-- Mobile hamburger -->
        <button
          class="md:hidden max-[485px]:block p-2 rounded-lg border border-muted text-secondary hover:text-dark hover:bg-gray-50"
          @click="mobileOpen = !mobileOpen"
          aria-label="Toggle navigation menu"
        >
          <svg v-if="!mobileOpen" xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
          <svg v-else xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>

    <!-- Mobile menu panel -->
    <div
      v-show="mobileOpen"
      class="md:hidden max-[485px]:block absolute left-0 right-0 top-16 bg-white border-t border-muted shadow-lg z-40"
    >
      <div class="px-4 py-3 space-y-2">
        <NuxtLink @click="mobileOpen=false" to="/food-finder" class="block w-full text-left px-3 py-2 rounded-md text-secondary hover:text-dark hover:bg-gray-50">Food Finder</NuxtLink>
        <NuxtLink @click="mobileOpen=false" to="/classifieds" class="block w-full text-left px-3 py-2 rounded-md text-secondary hover:text-dark hover:bg-gray-50">Classifieds</NuxtLink>
        <NuxtLink @click="mobileOpen=false" to="/members" class="block w-full text-left px-3 py-2 rounded-md text-secondary hover:text-dark hover:bg-gray-50">Members</NuxtLink>
        <template v-if="authStore.isAuthenticated">
          <NuxtLink @click="mobileOpen=false" to="/inbox" class="block w-full text-left px-3 py-2 rounded-md text-secondary hover:text-dark hover:bg-gray-50">
            Inbox
            <span v-if="inboxUnread > 0" class="ml-2 inline-flex items-center justify-center min-w-[1.15rem] h-[1.15rem] px-1 rounded-full bg-red-600 text-white text-[10px] font-bold">
              {{ inboxUnread > 99 ? '99+' : inboxUnread }}
            </span>
          </NuxtLink>
          <NuxtLink @click="mobileOpen=false" to="/dogs" class="block w-full text-left px-3 py-2 rounded-md text-secondary hover:text-dark hover:bg-gray-50">My Dogs</NuxtLink>
          <NuxtLink @click="mobileOpen=false" to="/profile" class="block w-full text-left px-3 py-2 rounded-md text-secondary hover:text-dark hover:bg-gray-50">Profile</NuxtLink>
          <div class="px-3 py-2">
            <NotificationBell />
          </div>
          <button @click="() => { mobileOpen=false; handleLogout(); }" class="block w-full text-left px-3 py-2 rounded-md bg-accent text-white">Logout</button>
        </template>
        <template v-else-if="!authStore.loading">
          <NuxtLink @click="mobileOpen=false" to="/auth/login" class="block w-full text-left px-3 py-2 rounded-md text-secondary hover:text-dark hover:bg-gray-50">Login</NuxtLink>
          <NuxtLink @click="mobileOpen=false" to="/auth/register" class="block w-full text-left px-3 py-2 rounded-md bg-primary text-dark">Register</NuxtLink>
        </template>
        <template v-else>
          <div class="px-3 py-2 text-secondary animate-pulse">Loading...</div>
        </template>
      </div>
    </div>
  </nav>
</template>

<script setup lang="ts">
const authStore = useAuthStore()
const router = useRouter()
const mobileOpen = ref(false)
const { unreadCount: inboxUnread, refreshUnreadCount } = useInboxUnread()

onMounted(async () => {
  if (!authStore.user && !authStore.loading) {
    await authStore.initialize()
  }
  if ((authStore as any).loading) {
    await new Promise<void>((resolve) => {
      const check = () => {
        if (!(authStore as any).loading) resolve()
        else setTimeout(check, 40)
      }
      check()
    })
  }
  if (authStore.isAuthenticated) {
    await refreshUnreadCount()
  }
})

watch(
  () => authStore.isAuthenticated,
  async (ok) => {
    if (ok) await refreshUnreadCount()
    else inboxUnread.value = 0
  }
)

const handleLogout = async () => {
  try {
    await authStore.signOut()
    inboxUnread.value = 0
    router.push('/')
  } catch (error) {
    console.error('Logout error:', error)
  }
}
</script>

