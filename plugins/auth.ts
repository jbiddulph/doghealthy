export default defineNuxtPlugin(async () => {
  const authStore = useAuthStore()
  
  try {
    await authStore.initialize()
  } catch (error) {
    console.error('Auth initialization error:', error)
    // Continue loading the app even if auth fails
  }
})

