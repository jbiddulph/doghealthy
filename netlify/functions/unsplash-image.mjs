/**
 * Proxy Unsplash random photos so the Access Key stays server-side.
 * Falls back to curated CDN URLs if the API fails (403 / rate limit / missing key).
 *
 * GET /.netlify/functions/unsplash-image?query=happy+dog&orientation=landscape&w=1600&h=900
 */
const CURATED = {
  hero: 'https://images.unsplash.com/photo-1552053831-71594a27632d',
  health: 'https://images.unsplash.com/photo-1587300003388-59208cc962cb',
  vaccination: 'https://images.unsplash.com/photo-1601758228041-f3b2795255f1',
  medication: 'https://images.unsplash.com/photo-1548199973-03cce0bbc87b',
  appointment: 'https://images.unsplash.com/photo-1477884213360-7e9d7dcc1e48',
  vet: 'https://images.unsplash.com/photo-1450778869180-41d0601e046e',
  food: 'https://images.unsplash.com/photo-1587300003388-59208cc962cb',
  weight: 'https://images.unsplash.com/photo-1530281700549-e82e7bf110d6',
  community: 'https://images.unsplash.com/photo-1544568100-847a948585b9',
  puppy: 'https://images.unsplash.com/photo-1561037404-61cd46aa615b',
  default: 'https://images.unsplash.com/photo-1518717758536-85ae29035b6d'
}

const pickCurated = (query = '') => {
  const q = query.toLowerCase()
  if (q.includes('happy') || q.includes('hero')) return CURATED.hero
  if (q.includes('vaccin') || q.includes('immun')) return CURATED.vaccination
  if (q.includes('medic') || q.includes('pill')) return CURATED.medication
  if (q.includes('appoint') || q.includes('clinic')) return CURATED.appointment
  if (q.includes('vet') || q.includes('veterinar')) return CURATED.vet
  if (q.includes('food') || q.includes('nutrition') || q.includes('bowl') || q.includes('eat')) {
    return CURATED.food
  }
  if (q.includes('weight') || q.includes('exercise') || q.includes('run')) return CURATED.weight
  if (q.includes('community') || q.includes('group') || q.includes('playing')) return CURATED.community
  if (q.includes('puppy') || q.includes('cute') || q.includes('breeder')) return CURATED.puppy
  if (q.includes('health') || q.includes('checkup')) return CURATED.health
  return CURATED.default
}

const json = (statusCode, body) => ({
  statusCode,
  headers: {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Cache-Control': 'public, max-age=3600'
  },
  body: JSON.stringify(body)
})

export async function handler(event) {
  if (event.httpMethod === 'OPTIONS') return json(204, {})
  if (event.httpMethod !== 'GET') return json(405, { error: 'Method not allowed' })

  const params = event.queryStringParameters || {}
  const query = (params.query || 'happy dog').trim()
  const orientation = params.orientation || 'landscape'
  const accessKey = process.env.UNSPLASH_ACCESS_KEY || process.env.NUXT_PUBLIC_UNSPLASH_ACCESS_KEY

  if (accessKey) {
    try {
      const url = new URL('https://api.unsplash.com/photos/random')
      url.searchParams.set('query', query)
      url.searchParams.set('orientation', orientation)

      const response = await fetch(url.toString(), {
        headers: {
          Authorization: `Client-ID ${accessKey}`,
          'Accept-Version': 'v1'
        }
      })

      if (response.ok) {
        const photo = await response.json()
        return json(200, {
          url: photo.urls?.regular || photo.urls?.full,
          author: photo.user?.name || 'Unsplash',
          authorUrl: photo.user?.links?.html || 'https://unsplash.com',
          description: photo.description || photo.alt_description || null,
          fallback: false
        })
      }

      console.warn('unsplash-image API status', response.status, await response.text().catch(() => ''))
    } catch (err) {
      console.error('unsplash-image fetch error', err)
    }
  }

  return json(200, {
    url: pickCurated(query),
    author: 'Unsplash',
    authorUrl: 'https://unsplash.com',
    description: query,
    fallback: true
  })
}
