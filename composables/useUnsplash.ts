export const useUnsplash = () => {
  const config = useRuntimeConfig()
  const accessKey = config.public.unsplashAccessKey

  const fetchRandomImage = async (query: string, options: {
    orientation?: 'landscape' | 'portrait' | 'squarish'
    width?: number
    height?: number
    count?: number
  } = {}) => {
    if (!accessKey) {
      console.warn('Unsplash access key not configured. Check that UNSPLASH_ACCESS_KEY is set in your environment variables.')
      return null
    }

    // Log if we're making too many requests (for debugging)
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
        ...(options.width && { w: options.width.toString() }),
        ...(options.height && { h: options.height.toString() }),
        ...(options.count && { count: options.count.toString() })
      })

      const response = await fetch(
        `https://api.unsplash.com/photos/random?${params.toString()}`,
        {
          headers: {
            'Authorization': `Client-ID ${accessKey}`,
            'Accept-Version': 'v1'
          }
        }
      )

      if (!response.ok) {
        const errorText = await response.text().catch(() => 'Unknown error')
        console.error(`Unsplash API error (${response.status}):`, errorText)
        
        if (response.status === 403) {
          console.warn('Unsplash API returned 403 Forbidden. This could mean:')
          console.warn('1. Rate limit exceeded (50 requests/hour for demo apps)')
          console.warn('2. Invalid or expired API key')
          console.warn('3. API key not properly configured in production')
        }
        
        throw new Error(`Unsplash API error: ${response.status}`)
      }

      const data = await response.json()
      
      // Handle both single photo and array of photos
      if (Array.isArray(data)) {
        return data.map((photo: any) => ({
          url: photo.urls.regular,
          thumb: photo.urls.thumb,
          small: photo.urls.small,
          author: photo.user.name,
          authorUrl: photo.user.links.html,
          description: photo.description || photo.alt_description
        }))
      } else {
        return {
          url: data.urls.regular,
          thumb: data.urls.thumb,
          small: data.urls.small,
          author: data.user.name,
          authorUrl: data.user.links.html,
          description: data.description || data.alt_description
        }
      }
    } catch (error) {
      console.error('Error fetching Unsplash image:', error)
      return null
    }
  }

  const fetchImageWithFallback = async (query: string, options: {
    orientation?: 'landscape' | 'portrait' | 'squarish'
    width?: number
    height?: number
  } = {}) => {
    const result = await fetchRandomImage(query, options)
    if (result && !Array.isArray(result)) {
      // Test if image loads
      return new Promise((resolve) => {
        const img = new Image()
        img.onload = () => resolve(result)
        img.onerror = () => resolve(null)
        img.src = result.url
      })
    }
    return result
  }

  return {
    fetchRandomImage,
    fetchImageWithFallback
  }
}

