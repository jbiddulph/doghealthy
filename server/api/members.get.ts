import { createClient } from '@supabase/supabase-js'

export default defineEventHandler(async (event) => {
  try {
    const query = getQuery(event)
    const page = parseInt(query.page as string) || 1
    const pageSize = parseInt(query.pageSize as string) || 12
    
    const supabase = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // Calculate offset
    const from = (page - 1) * pageSize
    const to = from + pageSize - 1

    // Get total count of users
    const { count: totalCount, error: countError } = await supabase
      .from('doghealthy_users')
      .select('*', { count: 'exact', head: true })

    if (countError) {
      throw createError({
        statusCode: 500,
        statusMessage: 'Failed to fetch member count'
      })
    }

    // Fetch paginated users
    const { data: users, error: usersError } = await supabase
      .from('doghealthy_users')
      .select('id, email, full_name, avatar_url, created_at')
      .order('created_at', { ascending: false })
      .range(from, to)

    if (usersError) {
      throw createError({
        statusCode: 500,
        statusMessage: 'Failed to fetch members'
      })
    }

    // Fetch dogs for each user
    const userIds = users?.map(u => u.id) || []
    
    const { data: dogs, error: dogsError } = await supabase
      .from('doghealthy_dogs')
      .select('id, user_id, name, breed, gender, birth_date, photo_url, is_active')
      .in('user_id', userIds)
      .eq('is_active', true)

    if (dogsError) {
      throw createError({
        statusCode: 500,
        statusMessage: 'Failed to fetch dogs'
      })
    }

    // Group dogs by user_id
    const dogsByUserId = (dogs || []).reduce((acc: any, dog: any) => {
      if (!acc[dog.user_id]) {
        acc[dog.user_id] = []
      }
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

    // Combine users with their dogs
    const members = (users || []).map(user => ({
      id: user.id,
      email: user.email,
      fullName: user.full_name,
      avatarUrl: user.avatar_url,
      createdAt: user.created_at,
      dogs: dogsByUserId[user.id] || []
    }))

    // Calculate pagination metadata
    const totalPages = Math.ceil((totalCount || 0) / pageSize)

    return {
      members,
      pagination: {
        page,
        pageSize,
        totalCount: totalCount || 0,
        totalPages,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1
      }
    }

  } catch (error: any) {
    console.error('Error fetching members:', error)
    
    if (error.statusCode) {
      throw error
    }

    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to fetch members'
    })
  }
})

