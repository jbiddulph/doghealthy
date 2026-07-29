export type PageSeoOptions = {
  title: string
  description: string
  keywords?: string
  path?: string
  image?: string
  /** Default true for marketing pages; set false for account/private pages */
  index?: boolean
  type?: 'website' | 'article' | 'product'
  jsonLd?: Record<string, unknown> | Record<string, unknown>[]
}

const SITE_NAME = 'DogHealthy'
const DEFAULT_BASE = 'https://doghealthy.co.uk'

/**
 * Consistent titles, descriptions, keywords, Open Graph, Twitter, and canonical URL.
 */
export const usePageSeo = (options: PageSeoOptions | (() => PageSeoOptions)) => {
  const config = useRuntimeConfig()
  const route = useRoute()

  const resolve = () => {
    const opts = typeof options === 'function' ? options() : options
    const base = String(config.public.baseUrl || DEFAULT_BASE).replace(/\/$/, '')
    const path = opts.path ?? route.path
    const url = `${base}${path.startsWith('/') ? path : `/${path}`}`
    const image = opts.image || `${base}/favicon.svg`
    const fullTitle = opts.title.includes(SITE_NAME) ? opts.title : `${opts.title} | ${SITE_NAME}`
    const index = opts.index !== false

    return { opts, base, url, image, fullTitle, index }
  }

  useHead(() => {
    const { opts, url, image, fullTitle, index } = resolve()

    const meta: Record<string, string>[] = [
      { name: 'description', content: opts.description },
      { name: 'robots', content: index ? 'index, follow' : 'noindex, nofollow' },
      { property: 'og:title', content: fullTitle },
      { property: 'og:description', content: opts.description },
      { property: 'og:type', content: opts.type || 'website' },
      { property: 'og:url', content: url },
      { property: 'og:image', content: image },
      { property: 'og:site_name', content: SITE_NAME },
      { property: 'og:locale', content: 'en_GB' },
      { name: 'twitter:card', content: 'summary_large_image' },
      { name: 'twitter:title', content: fullTitle },
      { name: 'twitter:description', content: opts.description },
      { name: 'twitter:image', content: image }
    ]

    if (opts.keywords) {
      meta.splice(1, 0, { name: 'keywords', content: opts.keywords })
    }

    const head: {
      title: string
      meta: Record<string, string>[]
      link: { rel: string; href: string }[]
      script?: { type: string; children: string }[]
    } = {
      title: fullTitle,
      meta,
      link: [{ rel: 'canonical', href: url }]
    }

    if (opts.jsonLd) {
      head.script = [
        {
          type: 'application/ld+json',
          children: JSON.stringify(opts.jsonLd)
        }
      ]
    }

    return head
  })
}
