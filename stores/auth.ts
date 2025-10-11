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
      
      // Get current session
      const { data: { user } } = await supabase.auth.getUser()
      this.user = user
      this.loading = false
      
      // Ensure user profile exists in doghealthy_users
      if (user) {
        await this.ensureUserProfile(user)
      }
      
      // Listen for auth changes
      supabase.auth.onAuthStateChange(async (_event, session) => {
        this.user = session?.user || null
        if (session?.user) {
          await this.ensureUserProfile(session.user)
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
            full_name: user.user_metadata?.full_name || null
          })
        
        if (profileError) {
          console.error('Error creating user profile:', profileError)
        }
      }
    },
    
    async signUp(email: string, password: string, fullName?: string) {
      const supabase = useSupabase()
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName
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
            full_name: fullName
          })
        
        if (profileError) {
          console.error('Error creating user profile:', profileError)
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
    },
    
    async updateProfile(updates: { fullName?: string; phone?: string; avatarUrl?: string }) {
      const supabase = useSupabase()
      
      if (!this.user) throw new Error('Not authenticated')
      
      const { error } = await supabase
        .from('doghealthy_users')
        .update({
          full_name: updates.fullName,
          phone: updates.phone,
          avatar_url: updates.avatarUrl
        })
        .eq('id', this.user.id)
      
      if (error) throw error
    }
  }
})

