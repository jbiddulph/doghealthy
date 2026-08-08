export default defineNuxtPlugin(() => {
  const authStore = useAuthStore()

  // Never block app mount on auth — a stuck refresh/lock freezes login in normal Chrome.
  void authStore
    .initialize()
    .then(() => {
      if (!authStore.isAuthenticated) return
      setTimeout(async () => {
        try {
          const { checkAllReminders } = useReminders()
          await checkAllReminders()
        } catch (error) {
          console.error('Error checking reminders:', error)
        }
      }, 2000)
    })
    .catch((error) => {
      console.error('Auth initialization error:', error)
    })
})
