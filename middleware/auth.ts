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

  // Allow Stripe return to finish confirming payment even if the browser session was dropped
  // (common after PayPal). The subscribe page activates the account via session_id.
  const isStripeReturn =
    to.path === '/billing/subscribe' &&
    typeof to.query.session_id === 'string' &&
    String(to.query.session_id).startsWith('cs_')

  // If not authenticated and trying to access protected route
  if (
    !authStore.isAuthenticated &&
    to.path !== '/auth/login' &&
    to.path !== '/auth/register' &&
    !isStripeReturn
  ) {
    return navigateTo({
      path: '/auth/login',
      query: { redirect: to.fullPath }
    })
  }

  // If authenticated and trying to access auth pages, redirect to intended destination
  if (authStore.isAuthenticated && (to.path === '/auth/login' || to.path === '/auth/register')) {
    const redirect = typeof to.query.redirect === 'string' ? to.query.redirect : ''
    if (redirect.startsWith('/') && !redirect.startsWith('//')) {
      return navigateTo(redirect)
    }
    return navigateTo('/')
  }
})
