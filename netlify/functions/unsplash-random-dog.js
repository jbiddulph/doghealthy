exports.handler = async (event, context) => {
  // Only allow GET requests
  if (event.httpMethod !== 'GET') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' })
    }
  }

  const accessKey = process.env.UNSPLASH_ACCESS_KEY || process.env.UNSPLASH_APPLICATION_ID

  if (!accessKey) {
    return {
      statusCode: 503,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'GET'
      },
      body: JSON.stringify({ 
        error: 'Unsplash access key not configured',
        fallback: true
      })
    }
  }

  try {
    // Fetch a random dog photo from Unsplash
    const response = await fetch(
      'https://api.unsplash.com/photos/random?query=dog&orientation=landscape&w=1920&h=1080',
      {
        headers: {
          'Authorization': `Client-ID ${accessKey}`,
          'Accept-Version': 'v1'
        }
      }
    )

    if (!response.ok) {
      throw new Error(`Unsplash API error: ${response.statusText}`)
    }

    const data = await response.json()

    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'GET',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        url: data.urls.regular,
        author: data.user.name,
        authorUrl: data.user.links.html,
        downloadUrl: data.links.download_location
      })
    }
  } catch (error) {
    console.error('Error fetching Unsplash image:', error)
    return {
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'GET'
      },
      body: JSON.stringify({ 
        error: 'Failed to fetch dog image from Unsplash',
        fallback: true
      })
    }
  }
}
