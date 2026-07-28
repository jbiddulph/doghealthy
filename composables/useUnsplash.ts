export type UnsplashImage = {
  url: string
  thumb: string
  small: string
  author: string
  authorUrl: string
  description: string | null
}

/** Build a sized Unsplash CDN URL (webp-friendly) without waiting on Nuxt Image. */
export const unsplashSizedUrl = (
  url: string,
  width: number,
  height?: number,
  quality = 75
) => {
  try {
    const u = new URL(url)
    u.searchParams.set('auto', 'format')
    u.searchParams.set('fit', 'crop')
    u.searchParams.set('w', String(width))
    if (height) u.searchParams.set('h', String(height))
    u.searchParams.set('q', String(quality))
    u.searchParams.set('fm', 'webp')
    return u.toString()
  } catch {
    return url
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

export const useUnsplash = () => {
  const config = useRuntimeConfig()
  const accessKey = config.public.unsplashAccessKey

  const fetchRandomImage = async (
    query: string,
    options: {
      orientation?: 'landscape' | 'portrait' | 'squarish'
      width?: number
      height?: number
      count?: number
    } = {}
  ): Promise<UnsplashImage | UnsplashImage[] | null> => {
    if (!accessKey) {
      console.warn(
        'Unsplash access key not configured. Check that UNSPLASH_ACCESS_KEY is set in your environment variables.'
      )
      return null
    }

    if (typeof window !== 'undefined') {
      const requestCount = parseInt(sessionStorage.getItem('unsplash_request_count') || '0')
      if (requestCount > 40) {
        console.warn('High number of Unsplash requests detected. You may be approaching rate limits.')
      }
      sessionStorage.setItem('unsplash_request_count', (requestCount + 1).toString())
    }

    try {
      const params = new URLSearchParams({
        query,
        orientation: options.orientation || 'landscape',
        ...(options.count && { count: options.count.toString() })
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
        console.error(`Unsplash API error (${response.status}):`, errorText)
        throw new Error(`Unsplash API error: ${response.status}`)
      }

      const data = await response.json()

      if (Array.isArray(data)) {
        return data.map((photo: any) => mapPhoto(photo, options.width, options.height))
      }
      return mapPhoto(data, options.width, options.height)
    } catch (error) {
      console.error('Error fetching Unsplash image:', error)
      return null
    }
  }

  const fetchImageWithFallback = async (
    query: string,
    options: {
      orientation?: 'landscape' | 'portrait' | 'squarish'
      width?: number
      height?: number
    } = {}
  ): Promise<UnsplashImage | null> => {
    const result = await fetchRandomImage(query, options)
    if (result && !Array.isArray(result)) return result
    return null
  }

  return {
    fetchRandomImage,
    fetchImageWithFallback
  }
}
