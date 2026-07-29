import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = process.env.SUPABASE_URL
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

const json = (statusCode, body) => ({
  statusCode,
  headers: {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Cache-Control': 'public, max-age=60'
  },
  body: JSON.stringify(body)
})

/**
 * Public community members list (service role — users/dogs are not publicly readable via RLS).
 * GET /.netlify/functions/members?page=1&pageSize=20
 */
export async function handler(event) {
  if (event.httpMethod === 'OPTIONS') return json(204, {})
  if (event.httpMethod !== 'GET') return json(405, { error: 'Method not allowed' })

  try {
    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      return json(503, { error: 'Server is not configured' })
    }

    const params = event.queryStringParameters || {}
    const page = Math.max(1, parseInt(params.page || '1', 10) || 1)
    const pageSize = Math.min(50, Math.max(1, parseInt(params.pageSize || '20', 10) || 20))
    const from = (page - 1) * pageSize
    const to = from + pageSize - 1

    const admin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

    const { count: totalCount, error: countError } = await admin
      .from('doghealthy_users')
      .select('*', { count: 'exact', head: true })

    if (countError) {
      console.error('members count:', countError)
      return json(500, { error: 'Failed to fetch member count' })
    }

    const { data: users, error: usersError } = await admin
      .from('doghealthy_users')
      .select('id, full_name, avatar_url, created_at')
      .order('created_at', { ascending: false })
      .range(from, to)

    if (usersError) {
      console.error('members users:', usersError)
      return json(500, { error: 'Failed to fetch members' })
    }

    const userIds = (users || []).map((u) => u.id)
    let dogs = []

    if (userIds.length) {
      const { data: dogRows, error: dogsError } = await admin
        .from('doghealthy_dogs')
        .select('id, user_id, name, breed, gender, birth_date, photo_url, is_active')
        .in('user_id', userIds)
        .eq('is_active', true)

      if (dogsError) {
        console.error('members dogs:', dogsError)
        return json(500, { error: 'Failed to fetch dogs' })
      }
      dogs = dogRows || []
    }

    const dogsByUserId = dogs.reduce((acc, dog) => {
      if (!acc[dog.user_id]) acc[dog.user_id] = []
      acc[dog.user_id].push({
        id: dog.id,
        name: dog.name,
        breed: dog.breed,
        gender: dog.gender,
        birthDate: dog.birth_date,
        photoUrl: dog.photo_url
      })
      return acc
    }, {})

    const members = (users || []).map((user) => ({
      id: user.id,
      fullName: user.full_name,
      avatarUrl: user.avatar_url,
      createdAt: user.created_at,
      dogs: dogsByUserId[user.id] || []
    }))

    const total = totalCount || 0
    const totalPages = Math.max(1, Math.ceil(total / pageSize))

    return json(200, {
      members,
      pagination: {
        page,
        pageSize,
        totalCount: total,
        totalPages: total === 0 ? 0 : totalPages,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1
      }
    })
  } catch (error) {
    console.error('members error:', error)
    return json(500, { error: error?.message || 'Failed to fetch members' })
  }
}
