export default defineNuxtRouteMiddleware((to, from) => {
  const authStore = useAuthStore()
  
  // If not authenticated and trying to access protected route
  if (!authStore.isAuthenticated && to.path !== '/auth/login' && to.path !== '/auth/register') {
    return navigateTo('/auth/login')
  }
  
  // If authenticated and trying to access auth pages, redirect to home
  if (authStore.isAuthenticated && (to.path === '/auth/login' || to.path === '/auth/register')) {
    return navigateTo('/')
  }
})

