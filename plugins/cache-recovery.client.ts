export default defineNuxtPlugin(() => {
  if (!import.meta.client) return

  const recoverOnce = async () => {
    try {
      if (sessionStorage.getItem('dh_cache_recovered')) return
      sessionStorage.setItem('dh_cache_recovered', '1')
    } catch {
      return
    }

    try {
      const regs = await navigator.serviceWorker?.getRegistrations?.()
      await Promise.all((regs || []).map((reg) => reg.unregister()))
    } catch {
      // ignore
    }

    try {
      if ('caches' in window) {
        const keys = await caches.keys()
        await Promise.all(keys.map((key) => caches.delete(key)))
      }
    } catch {
      // ignore
    }

    const url = new URL(window.location.href)
    url.searchParams.set('recovered', '1')
    window.location.replace(url.toString())
  }

  window.addEventListener('unhandledrejection', (event) => {
    const message = String((event.reason as Error)?.message || event.reason || '')
    if (/Loading chunk|dynamically imported module|Failed to fetch dynamically imported/i.test(message)) {
      void recoverOnce()
    }
  })
})
