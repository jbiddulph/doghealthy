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

  // Stripe/PayPal return pages must run without a browser session
  const isStripeReturn =
    to.path === '/billing/success' ||
    (to.path === '/billing/subscribe' &&
      typeof to.query.session_id === 'string' &&
      String(to.query.session_id).startsWith('cs_'))

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
    const stored =
      typeof sessionStorage !== 'undefined'
        ? sessionStorage.getItem('doghealthy_post_login_redirect') || ''
        : ''
    if (typeof sessionStorage !== 'undefined') {
      sessionStorage.removeItem('doghealthy_post_login_redirect')
    }
    const target =
      (redirect.startsWith('/') && !redirect.startsWith('//') ? redirect : '') ||
      (stored.startsWith('/') && !stored.startsWith('//') ? stored : '')
    if (target) {
      return navigateTo(target)
    }
    return navigateTo('/')
  }
})
