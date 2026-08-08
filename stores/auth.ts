import { defineStore } from 'pinia'
import type { User } from '@supabase/supabase-js'

interface AuthState {
  user: User | null
  loading: boolean
}

export const useAuthStore = defineStore('auth', {
  state: (): AuthState => ({
    user: null,
    loading: true
  }),
  
  getters: {
    isAuthenticated: (state) => !!state.user,
    userId: (state) => state.user?.id || null
  },
  
  actions: {
    async initialize() {
      const supabase = useSupabase()

      const withTimeout = <T>(promise: Promise<T>, ms: number) =>
        Promise.race([
          promise,
          new Promise<T>((_, reject) => {
            setTimeout(() => reject(new Error('Auth init timed out')), ms)
          })
        ])

      try {
        // getSession reads local storage; getUser() can hang on a stale refresh token.
        const { data: { session } } = await withTimeout(supabase.auth.getSession(), 8000)
        this.user = session?.user ?? null
        if (this.user) {
          await this.ensureUserProfile(this.user)
        }
      } catch (error) {
        console.error('Auth initialize failed:', error)
        this.user = null
        try {
          await supabase.auth.signOut({ scope: 'local' })
        } catch {
          // ignore — local storage may already be unusable
        }
      } finally {
        this.loading = false
      }

      supabase.auth.onAuthStateChange((_event, session) => {
        this.user = session?.user || null
        if (session?.user) {
          void this.ensureUserProfile(session.user)
        }
      })
    },
    
    async ensureUserProfile(user: User) {
      const supabase = useSupabase()
      
      // Check if user profile exists
      const { data: existingProfile } = await supabase
        .from('doghealthy_users')
        .select('id')
        .eq('id', user.id)
        .single()
      
      // Create profile if it doesn't exist
      if (!existingProfile) {
        const { error: profileError } = await supabase
          .from('doghealthy_users')
          .insert({
            id: user.id,
            email: user.email,
            full_name: user.user_metadata?.full_name || null,
            phone: user.user_metadata?.phone || null,
            notify_found_sms: true
          })
        
        if (profileError) {
          console.error('Error creating user profile:', profileError)
        }
      }
    },
    
    async signUp(email: string, password: string, fullName?: string, phone?: string) {
      const supabase = useSupabase()
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            phone: phone || null
          }
        }
      })
      
      if (error) throw error
      
      // Create user profile in doghealthy_users table
      if (data.user) {
        const { error: profileError } = await supabase
          .from('doghealthy_users')
          .insert({
            id: data.user.id,
            email: data.user.email,
            full_name: fullName,
            phone: phone || null,
            notify_found_sms: true
          })
        
        if (profileError) {
          console.error('Error creating user profile:', profileError)
          // Profile may already exist from a trigger; try update
          if (phone) {
            await supabase
              .from('doghealthy_users')
              .update({ phone, full_name: fullName })
              .eq('id', data.user.id)
          }
        }
      }
      
      return data
    },
    
    async signIn(email: string, password: string) {
      const supabase = useSupabase()
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      })
      
      if (error) throw error
      
      this.user = data.user
      return data
    },
    
    async signOut() {
      const supabase = useSupabase()
      
      const { error } = await supabase.auth.signOut()
      
      if (error) throw error
      
      this.user = null
      if (typeof window !== 'undefined') {
        localStorage.removeItem('doghealthy_has_subscription')
      }
    },
    
    async updateProfile(updates: { fullName?: string; phone?: string; avatarUrl?: string }) {
      const supabase = useSupabase()
      
      if (!this.user) throw new Error('Not authenticated')

      const payload: Record<string, string | null> = {}
      if (updates.fullName !== undefined) payload.full_name = updates.fullName
      if (updates.phone !== undefined) payload.phone = updates.phone
      if (updates.avatarUrl !== undefined) payload.avatar_url = updates.avatarUrl
      
      const { error } = await supabase
        .from('doghealthy_users')
        .update(payload)
        .eq('id', this.user.id)
      
      if (error) throw error
    }
  }
})

