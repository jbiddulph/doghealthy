const GA_MEASUREMENT_ID = 'G-EMYKQNQ3FJ'

declare global {
  interface Window {
    dataLayer: unknown[]
    gtag: (...args: unknown[]) => void
  }
}

/**
 * Loads Google Analytics (gtag) and tracks SPA route changes.
 */
export default defineNuxtPlugin(() => {
  if (import.meta.server) return

  window.dataLayer = window.dataLayer || []
  window.gtag = function gtag() {
    // eslint-disable-next-line prefer-rest-params
    window.dataLayer.push(arguments)
  }

  const script = document.createElement('script')
  script.async = true
  script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`
  document.head.appendChild(script)

  window.gtag('js', new Date())
  window.gtag('config', GA_MEASUREMENT_ID, {
    anonymize_ip: true,
    send_page_view: true
  })

  const router = useRouter()
  let isInitial = true
  router.afterEach((to) => {
    if (isInitial) {
      isInitial = false
      return
    }
    if (typeof window.gtag !== 'function') return
    window.gtag('config', GA_MEASUREMENT_ID, {
      page_path: to.fullPath,
      page_title: typeof document !== 'undefined' ? document.title : to.fullPath
    })
  })
})
