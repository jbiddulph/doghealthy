export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const accessKey = config.unsplashAccessKey

  if (!accessKey) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Unsplash access key not configured'
    })
  }

  try {
    // Fetch a random dog photo from Unsplash
    const response = await fetch(
      'https://api.unsplash.com/photos/random?query=dog&orientation=landscape',
      {
        headers: {
          'Authorization': `Client-ID ${accessKey}`
        }
      }
    )

    if (!response.ok) {
      throw new Error(`Unsplash API error: ${response.statusText}`)
    }

    const data = await response.json()

    return {
      url: data.urls.regular,
      author: data.user.name,
      authorUrl: data.user.links.html,
      downloadUrl: data.links.download_location
    }
  } catch (error: any) {
    console.error('Error fetching Unsplash image:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to fetch dog image from Unsplash'
    })
  }
})

