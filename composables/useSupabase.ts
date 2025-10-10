import { createClient } from '@supabase/supabase-js'

let supabaseClient: ReturnType<typeof createClient> | null = null

export const useSupabase = () => {
  if (!supabaseClient) {
    const config = useRuntimeConfig()
    
    supabaseClient = createClient(
      config.public.supabaseUrl,
      config.public.supabaseKey
    )
  }
  
  return supabaseClient
}

