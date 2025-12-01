export default defineNuxtRouteMiddleware(async (to, from) => {
  const authStore = useAuthStore()

  // Wait for auth initialization to complete before making decisions.
  if ((authStore as any).loading) {
    await new Promise<void>((resolve) => {
      const check = () => {
        if (!(authStore as any).loading) resolve()
        else setTimeout(check, 50)
      }
      check()
    })
  }
  
  // If not authenticated and trying to access protected route
  if (!authStore.isAuthenticated && to.path !== '/auth/login' && to.path !== '/auth/register') {
    return navigateTo('/auth/login')
  }
  
  // If authenticated and trying to access auth pages, redirect to home
  if (authStore.isAuthenticated && (to.path === '/auth/login' || to.path === '/auth/register')) {
    return navigateTo('/')
  }
})

