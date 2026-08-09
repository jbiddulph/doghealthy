import { createClient } from '@supabase/supabase-js'

let supabaseClient: ReturnType<typeof createClient> | null = null

export const useSupabase = () => {
  if (!supabaseClient) {
    const config = useRuntimeConfig()
    
    supabaseClient = createClient(
      config.public.supabaseUrl,
      config.public.supabaseKey,
      {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
          detectSessionInUrl: true,
          // New key drops corrupt Chrome localStorage from older builds.
          storageKey: 'doghealthy-auth-v2',
          // navigator.locks can hang forever if another tab never releases.
          lock: async (_name, _timeout, fn) => fn()
        }
      }
    )
  }
  
  return supabaseClient
}

