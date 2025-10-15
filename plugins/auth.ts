export default defineNuxtPlugin(async () => {
  const authStore = useAuthStore()
  
  try {
    await authStore.initialize()
    
    // Check reminders after auth initialization (client-side only)
    if (process.client && authStore.isAuthenticated) {
      // Use setTimeout to avoid blocking the initial page load
      setTimeout(async () => {
        try {
          const { checkAllReminders } = useReminders()
          await checkAllReminders()
        } catch (error) {
          console.error('Error checking reminders:', error)
          // Don't block app loading if reminders fail
        }
      }, 2000) // Wait 2 seconds after page load
    }
  } catch (error) {
    console.error('Auth initialization error:', error)
    // Continue loading the app even if auth fails
  }
})

