/**
 * Search Unsplash for news article images.
 * GET /.netlify/functions/unsplash-search?query=dog+nutrition&per_page=12
 */
const CURATED = [
  {
    url: 'https://images.unsplash.com/photo-1552053831-71594a27632d',
    thumb: 'https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&w=400&h=300&q=80',
    author: 'Jamie Street',
    authorUrl: 'https://unsplash.com/@jamie452',
    description: 'Happy golden retriever'
  },
  {
    url: 'https://images.unsplash.com/photo-1587300003388-59208cc962cb',
    thumb: 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?auto=format&fit=crop&w=400&h=300&q=80',
    author: 'Victor Grabarczyk',
    authorUrl: 'https://unsplash.com/@victor_g',
    description: 'Healthy dog outdoors'
  },
  {
    url: 'https://images.unsplash.com/photo-1601758228041-f3b2795255f1',
    thumb: 'https://images.unsplash.com/photo-1601758228041-f3b2795255f1?auto=format&fit=crop&w=400&h=300&q=80',
    author: 'Hannah Lim',
    authorUrl: 'https://unsplash.com',
    description: 'Dog with caring hands'
  },
  {
    url: 'https://images.unsplash.com/photo-1548199973-03cce0bbc87b',
    thumb: 'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?auto=format&fit=crop&w=400&h=300&q=80',
    author: 'Gilberto Reyes',
    authorUrl: 'https://unsplash.com',
    description: 'Dogs together'
  },
  {
    url: 'https://images.unsplash.com/photo-1561037404-61cd46aa615b',
    thumb: 'https://images.unsplash.com/photo-1561037404-61cd46aa615b?auto=format&fit=crop&w=400&h=300&q=80',
    author: 'Jamie Street',
    authorUrl: 'https://unsplash.com/@jamie452',
    description: 'Cute puppy'
  },
  {
    url: 'https://images.unsplash.com/photo-1518717758536-85ae29035b6d',
    thumb: 'https://images.unsplash.com/photo-1518717758536-85ae29035b6d?auto=format&fit=crop&w=400&h=300&q=80',
    author: 'Sarah Brown',
    authorUrl: 'https://unsplash.com',
    description: 'Friendly dog'
  }
]

const json = (statusCode, body) => ({
  statusCode,
  headers: {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Cache-Control': 'public, max-age=300'
  },
  body: JSON.stringify(body)
})

const sized = (url, w, h) => {
  try {
    const u = new URL(url)
    u.searchParams.set('auto', 'format')
    u.searchParams.set('fit', 'crop')
    u.searchParams.set('w', String(w))
    u.searchParams.set('h', String(h))
    u.searchParams.set('q', '80')
    return u.toString()
  } catch {
    return url
  }
}

export async function handler(event) {
  if (event.httpMethod === 'OPTIONS') return json(204, {})
  if (event.httpMethod !== 'GET') return json(405, { error: 'Method not allowed' })

  const params = event.queryStringParameters || {}
  const query = String(params.query || '').trim()
  const perPage = Math.min(24, Math.max(1, Number(params.per_page || 12) || 12))
  if (!query) return json(400, { error: 'query is required' })

  const accessKey = process.env.UNSPLASH_ACCESS_KEY || process.env.NUXT_PUBLIC_UNSPLASH_ACCESS_KEY
  if (accessKey) {
    try {
      const url = new URL('https://api.unsplash.com/search/photos')
      url.searchParams.set('query', query)
      url.searchParams.set('per_page', String(perPage))
      url.searchParams.set('orientation', 'landscape')

      const response = await fetch(url.toString(), {
        headers: {
          Authorization: `Client-ID ${accessKey}`,
          'Accept-Version': 'v1'
        }
      })
      if (response.ok) {
        const data = await response.json()
        const results = (data.results || []).map((photo) => ({
          id: photo.id,
          url: photo.urls?.regular || photo.urls?.full,
          thumb: photo.urls?.small || photo.urls?.thumb,
          author: photo.user?.name || 'Unsplash',
          authorUrl: photo.user?.links?.html || 'https://unsplash.com',
          description: photo.alt_description || photo.description || query
        }))
        if (results.length) {
          return json(200, { results, fallback: false })
        }
      } else {
        console.warn('unsplash-search status', response.status, await response.text().catch(() => ''))
      }
    } catch (err) {
      console.error('unsplash-search error', err)
    }
  }

  const q = query.toLowerCase()
  const results = CURATED.filter(
    (item) =>
      item.description.toLowerCase().includes(q) ||
      q.split(/\s+/).some((word) => word.length > 2 && item.description.toLowerCase().includes(word))
  )
  const picked = (results.length ? results : CURATED).slice(0, perPage).map((item, index) => ({
    id: `curated-${index}`,
    url: sized(item.url, 1200, 800),
    thumb: item.thumb,
    author: item.author,
    authorUrl: item.authorUrl,
    description: item.description
  }))

  return json(200, { results: picked, fallback: true })
}
