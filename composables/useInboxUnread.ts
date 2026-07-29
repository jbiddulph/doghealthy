/**
 * Live unread inbox count for the logged-in user.
 */
export const useInboxUnread = () => {
  const supabase = useSupabase()
  const authStore = useAuthStore()
  const unreadCount = useState<number>('inbox-unread-count', () => 0)

  const refreshUnreadCount = async () => {
    const userId = authStore.userId
    if (!userId) {
      unreadCount.value = 0
      return 0
    }

    try {
      const { count, error } = await supabase
        .from('doghealthy_messages')
        .select('id', { count: 'exact', head: true })
        .eq('recipient_id', userId)
        .eq('is_read', false)
        .is('recipient_deleted_at', null)

      if (error) throw error
      unreadCount.value = count || 0
      return unreadCount.value
    } catch (err) {
      console.error('refreshUnreadCount', err)
      return unreadCount.value
    }
  }

  return {
    unreadCount,
    refreshUnreadCount
  }
}
