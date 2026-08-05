export const useAdmin = () => {
  const supabase = useSupabase()
  const authStore = useAuthStore()

  const isAdmin = ref(false)
  const checked = ref(false)
  const loading = ref(false)

  const refreshAdmin = async () => {
    loading.value = true
    try {
      if (!authStore.userId) {
        isAdmin.value = false
        return false
      }
      const { data, error } = await supabase
        .from('doghealthy_users')
        .select('is_admin')
        .eq('id', authStore.userId)
        .maybeSingle()
      if (error) throw error
      isAdmin.value = !!data?.is_admin
      return isAdmin.value
    } catch {
      isAdmin.value = false
      return false
    } finally {
      checked.value = true
      loading.value = false
    }
  }

  const requireAdmin = async () => {
    if ((authStore as any).loading) {
      await new Promise<void>((resolve) => {
        const check = () => {
          if (!(authStore as any).loading) resolve()
          else setTimeout(check, 40)
        }
        check()
      })
    }
    if (!authStore.isAuthenticated) return false
    return refreshAdmin()
  }

  return {
    isAdmin,
    checked,
    loading,
    refreshAdmin,
    requireAdmin
  }
}
