export default defineNuxtRouteMiddleware(async (to) => {
  const authStore = useAuthStore()
  const { requireAdmin } = useAdmin()

  if ((authStore as any).loading) {
    await new Promise<void>((resolve) => {
      const check = () => {
        if (!(authStore as any).loading) resolve()
        else setTimeout(check, 40)
      }
      check()
    })
  }

  if (!authStore.isAuthenticated) {
    return navigateTo({
      path: '/auth/login',
      query: { redirect: to.fullPath }
    })
  }

  const ok = await requireAdmin()
  if (!ok) {
    return navigateTo('/dogs')
  }
})
