export type UnsplashImage = {
  url: string
  thumb: string
  small: string
  author: string
  authorUrl: string
  description: string | null
}

/** Build a sized Unsplash CDN URL without Nuxt Image / IPX. */
export const unsplashSizedUrl = (
  url: string,
  width: number,
  height?: number,
  quality = 80
) => {
  try {
    const u = new URL(url)
    u.searchParams.set('auto', 'format')
    u.searchParams.set('fit', 'crop')
    u.searchParams.set('w', String(width))
    if (height) u.searchParams.set('h', String(height))
    u.searchParams.set('q', String(quality))
    return u.toString()
  } catch {
    return url
  }
}

/**
 * Curated dog photos on images.unsplash.com — always work without the API.
 * Used when the API key is missing, rate-limited, or returns 403.
 */
const CURATED: Record<string, { id: string; author: string; description: string }> = {
  hero: {
    id: 'photo-1552053831-71594a27632d',
    author: 'Jamie Street',
    description: 'Happy golden retriever'
  },
  health: {
    id: 'photo-1587300003388-59208cc962cb',
    author: 'Victor Grabarczyk',
    description: 'Healthy dog outdoors'
  },
  vaccination: {
    id: 'photo-1601758228041-f3b2795255f1',
    author: 'Hannah Lim',
    description: 'Dog with caring hands'
  },
  medication: {
    id: 'photo-1548199973-03cce0bbc87b',
    author: 'Gilberto Reyes',
    description: 'Dogs together'
  },
  appointment: {
    id: 'photo-1477884213360-7e9d7dcc1e48',
    author: 'Cristian Castillo',
    description: 'Dog portrait'
  },
  vet: {
    id: 'photo-1450778869180-41d0601e046e',
    author: 'Jamie Street',
    description: 'Dog with owner'
  },
  food: {
    id: 'photo-1587300003388-59208cc962cb',
    author: 'Victor Grabarczyk',
    description: 'Dog outdoors'
  },
  weight: {
    id: 'photo-1530281700549-e82e7bf110d6',
    author: 'Richard Brutyo',
    description: 'Dog running and exercising'
  },
  community: {
    id: 'photo-1544568100-847a948585b9',
    author: 'Alvan Nee',
    description: 'Dogs in a park'
  },
  puppy: {
    id: 'photo-1561037404-61cd46aa615b',
    author: 'Jamie Street',
    description: 'Cute puppy'
  },
  default: {
    id: 'photo-1518717758536-85ae29035b6d',
    author: 'Sarah Brown',
    description: 'Friendly dog'
  }
}

const pickCuratedKey = (query: string): keyof typeof CURATED => {
  const q = query.toLowerCase()
  if (q.includes('happy') || q.includes('hero')) return 'hero'
  if (q.includes('vaccin') || q.includes('immun')) return 'vaccination'
  if (q.includes('medic') || q.includes('pill')) return 'medication'
  if (q.includes('appoint') || q.includes('clinic')) return 'appointment'
  if (q.includes('vet') || q.includes('veterinar')) return 'vet'
  if (q.includes('food') || q.includes('nutrition') || q.includes('bowl') || q.includes('eat')) return 'food'
  if (q.includes('weight') || q.includes('exercise') || q.includes('run')) return 'weight'
  if (q.includes('community') || q.includes('group') || q.includes('playing')) return 'community'
  if (q.includes('puppy') || q.includes('cute') || q.includes('breeder')) return 'puppy'
  if (q.includes('health') || q.includes('checkup')) return 'health'
  if (q.includes('owner')) return 'vet'
  return 'default'
}

export const curatedUnsplashImage = (
  query: string,
  width = 1200,
  height = 800
): UnsplashImage => {
  const key = pickCuratedKey(query)
  const photo = CURATED[key]
  const base = `https://images.unsplash.com/${photo.id}`
  return {
    url: unsplashSizedUrl(base, width, height),
    thumb: unsplashSizedUrl(base, 200, 200),
    small: unsplashSizedUrl(base, 400, 300),
    author: photo.author,
    authorUrl: `https://unsplash.com/photos/${photo.id.replace('photo-', '')}`,
    description: photo.description
  }
}

const mapPhoto = (photo: any, width?: number, height?: number): UnsplashImage => {
  const regular = photo.urls?.regular || photo.urls?.full || ''
  return {
    url: width ? unsplashSizedUrl(regular, width, height) : unsplashSizedUrl(regular, 1200, 800),
    thumb: photo.urls?.thumb || unsplashSizedUrl(regular, 200, 200),
    small: photo.urls?.small || unsplashSizedUrl(regular, 400, 300),
    author: photo.user?.name || 'Unsplash',
    authorUrl: photo.user?.links?.html || 'https://unsplash.com',
    description: photo.description || photo.alt_description || null
  }
}

const cacheKey = (query: string, width?: number, height?: number) =>
  `dh_unsplash:${query}:${width || 0}x${height || 0}`

const readCache = (key: string): UnsplashImage | null => {
  if (typeof window === 'undefined') return null
  try {
    const raw = sessionStorage.getItem(key)
    if (!raw) return null
    return JSON.parse(raw) as UnsplashImage
  } catch {
    return null
  }
}

const writeCache = (key: string, image: UnsplashImage) => {
  if (typeof window === 'undefined') return
  try {
    sessionStorage.setItem(key, JSON.stringify(image))
  } catch {
    // ignore quota errors
  }
}

export const useUnsplash = () => {
  const config = useRuntimeConfig()
  const accessKey =
    (config.public.unsplashAccessKey as string | undefined) ||
    ''

  const fetchFromNetlify = async (
    query: string,
    options: { orientation?: string; width?: number; height?: number }
  ): Promise<UnsplashImage | null> => {
    try {
      const params = new URLSearchParams({
        query,
        orientation: options.orientation || 'landscape'
      })
      if (options.width) params.set('w', String(options.width))
      if (options.height) params.set('h', String(options.height))

      const result = await $fetch<{
        url?: string
        author?: string
        authorUrl?: string
        description?: string | null
        fallback?: boolean
      }>(`/.netlify/functions/unsplash-image?${params.toString()}`)

      if (!result?.url) return null

      const base = result.url
      return {
        url: unsplashSizedUrl(base, options.width || 1200, options.height),
        thumb: unsplashSizedUrl(base, 200, 200),
        small: unsplashSizedUrl(base, 400, 300),
        author: result.author || 'Unsplash',
        authorUrl: result.authorUrl || 'https://unsplash.com',
        description: result.description || null
      }
    } catch {
      return null
    }
  }

  const fetchFromApi = async (
    query: string,
    options: { orientation?: string; width?: number; height?: number }
  ): Promise<UnsplashImage | null> => {
    if (!accessKey) return null

    const params = new URLSearchParams({
      query,
      orientation: options.orientation || 'landscape'
    })

    const response = await fetch(
      `https://api.unsplash.com/photos/random?${params.toString()}`,
      {
        headers: {
          Authorization: `Client-ID ${accessKey}`,
          'Accept-Version': 'v1'
        }
      }
    )

    if (!response.ok) {
      const errorText = await response.text().catch(() => 'Unknown error')
      console.warn(`Unsplash API ${response.status}:`, errorText.slice(0, 200))
      return null
    }

    const data = await response.json()
    return mapPhoto(data, options.width, options.height)
  }

  /**
   * Always returns an image: tries Netlify proxy → client API → curated CDN fallback.
   */
  const fetchImageWithFallback = async (
    query: string,
    options: {
      orientation?: 'landscape' | 'portrait' | 'squarish'
      width?: number
      height?: number
    } = {}
  ): Promise<UnsplashImage> => {
    const width = options.width || 1200
    const height = options.height || 800
    const key = cacheKey(query, width, height)

    const cached = readCache(key)
    if (cached) return cached

    // Prefer server proxy (keeps Access Key off the client / uses Netlify env)
    let image = await fetchFromNetlify(query, { ...options, width, height })

    // Dev / local without function: try browser API if key is baked into public config
    if (!image) {
      try {
        image = await fetchFromApi(query, { ...options, width, height })
      } catch (err) {
        console.warn('Unsplash client fetch failed:', err)
      }
    }

    if (!image) {
      image = curatedUnsplashImage(query, width, height)
    }

    writeCache(key, image)
    return image
  }

  /** Sync curated image for immediate paint (no network). */
  const getCuratedImage = (
    query: string,
    width = 1200,
    height = 800
  ): UnsplashImage => curatedUnsplashImage(query, width, height)

  return {
    fetchImageWithFallback,
    getCuratedImage,
    curatedUnsplashImage
  }
}
