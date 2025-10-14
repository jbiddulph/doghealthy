<template>
  <div class="relative">
    <!-- Bell Icon -->
    <button 
      @click="toggleNotifications"
      class="relative p-2 text-secondary hover:text-dark transition-colors"
    >
      <i class="bi bi-bell text-xl"></i>
      
      <!-- Unread Count Badge -->
      <span 
        v-if="unreadCount > 0"
        class="absolute -top-1 -right-1 bg-accent text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-semibold"
      >
        {{ unreadCount > 99 ? '99+' : unreadCount }}
      </span>
    </button>

    <!-- Notifications Dropdown -->
    <div 
      v-if="showNotifications" 
      class="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-muted z-50 max-h-96 overflow-hidden"
    >
      <!-- Header -->
      <div class="p-4 border-b border-muted flex items-center justify-between">
        <h3 class="font-semibold text-dark">Notifications</h3>
        <div class="flex gap-2">
          <button 
            v-if="unreadCount > 0"
            @click="markAllAsRead"
            class="text-xs text-primary hover:text-accent"
          >
            Mark all read
          </button>
          <NuxtLink 
            to="/notifications" 
            @click="showNotifications = false"
            class="text-xs text-primary hover:text-accent"
          >
            View all
          </NuxtLink>
        </div>
      </div>

      <!-- Notifications List -->
      <div class="max-h-64 overflow-y-auto">
        <div v-if="loading" class="p-4 text-center">
          <div class="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto"></div>
        </div>
        
        <div v-else-if="notifications.length === 0" class="p-4 text-center text-secondary">
          <div class="text-2xl mb-2">🔔</div>
          <p class="text-sm">No notifications</p>
        </div>
        
        <div v-else class="divide-y divide-muted">
          <div 
            v-for="notification in notifications" 
            :key="notification.id"
            class="p-4 hover:bg-gray-50 cursor-pointer"
            :class="{ 'bg-primary bg-opacity-5': !notification.is_read }"
            @click="handleNotificationClick(notification)"
          >
            <div class="flex items-start gap-3">
              <!-- Icon -->
              <div class="flex-shrink-0 mt-1">
                <div 
                  class="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm"
                  :class="getNotificationIconClass(notification.type)"
                >
                  <i :class="getNotificationIcon(notification.type)"></i>
                </div>
              </div>
              
              <!-- Content -->
              <div class="flex-1 min-w-0">
                <p class="text-sm font-medium text-dark">{{ notification.title }}</p>
                <p class="text-xs text-secondary mt-1 line-clamp-2">{{ notification.message }}</p>
                <p class="text-xs text-secondary mt-1">{{ formatTime(notification.created_at) }}</p>
              </div>
              
              <!-- Unread indicator -->
              <div v-if="!notification.is_read" class="flex-shrink-0">
                <div class="w-2 h-2 bg-primary rounded-full"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Click outside to close -->
    <div 
      v-if="showNotifications" 
      class="fixed inset-0 z-40" 
      @click="showNotifications = false"
    ></div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { useSupabase } from '~/composables/useSupabase'
import { useAuthStore } from '~/stores/auth'

interface Notification {
  id: string
  type: string
  title: string
  message: string
  is_read: boolean
  created_at: string
  reference_id: string
}

const supabase = useSupabase()
const authStore = useAuthStore()

// State
const notifications = ref<Notification[]>([])
const showNotifications = ref(false)
const loading = ref(false)

// Realtime subscription
let subscription: any = null

// Computed
const unreadCount = computed(() => {
  return notifications.value.filter(n => !n.is_read).length
})

// Methods
const getNotificationIcon = (type: string) => {
  switch (type) {
    case 'appointment': return 'bi-calendar2-event'
    case 'medication': return 'bi-capsule'
    case 'message': return 'bi-chat-dots'
    case 'upgrade': return 'bi-star'
    default: return 'bi-bell'
  }
}

const getNotificationIconClass = (type: string) => {
  switch (type) {
    case 'appointment': return 'bg-primary'
    case 'medication': return 'bg-accent'
    case 'message': return 'bg-secondary'
    case 'upgrade': return 'bg-primary'
    default: return 'bg-muted'
  }
}

const formatTime = (dateString: string) => {
  const date = new Date(dateString)
  const now = new Date()
  const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))
  
  if (diffInHours < 1) return 'Just now'
  if (diffInHours < 24) return `${diffInHours}h ago`
  if (diffInHours < 168) return `${Math.floor(diffInHours / 24)}d ago`
  return date.toLocaleDateString('en-GB', { month: 'short', day: 'numeric' })
}

const fetchNotifications = async () => {
  if (!authStore.userId) return
  
  try {
    loading.value = true
    
    const { data, error } = await supabase
      .from('doghealthy_notifications')
      .select('*')
      .eq('user_id', authStore.userId)
      .order('created_at', { ascending: false })
      .limit(10)

    if (error) throw error
    
    notifications.value = data || []
  } catch (error) {
    console.error('Error fetching notifications:', error)
  } finally {
    loading.value = false
  }
}

const toggleNotifications = () => {
  showNotifications.value = !showNotifications.value
  if (showNotifications.value) {
    fetchNotifications()
  }
}

const markAllAsRead = async () => {
  if (!authStore.userId) return
  
  try {
    const { error } = await supabase
      .from('doghealthy_notifications')
      .update({ is_read: true })
      .eq('user_id', authStore.userId)
      .eq('is_read', false)

    if (error) throw error
    
    // Update local state
    notifications.value.forEach(n => n.is_read = true)
  } catch (error) {
    console.error('Error marking notifications as read:', error)
  }
}

const handleNotificationClick = async (notification: Notification) => {
  // Mark as read
  if (!notification.is_read) {
    try {
      await supabase
        .from('doghealthy_notifications')
        .update({ is_read: true })
        .eq('id', notification.id)
      
      notification.is_read = true
    } catch (error) {
      console.error('Error marking notification as read:', error)
    }
  }
  
  // Navigate based on type
  switch (notification.type) {
    case 'appointment':
      // Navigate to appointments page
      await navigateTo(`/dogs/${notification.reference_id}/appointments`)
      break
    case 'medication':
      // Navigate to medications page
      await navigateTo(`/dogs/${notification.reference_id}/medications`)
      break
    case 'message':
      // Navigate to classifieds listing
      await navigateTo(`/classifieds/${notification.reference_id}`)
      break
    case 'upgrade':
      // Navigate to my listings
      await navigateTo('/classifieds/my-listings')
      break
  }
  
  showNotifications.value = false
}

const setupRealtimeSubscription = () => {
  if (!authStore.userId) return
  
  subscription = supabase
    .channel(`notifications-${authStore.userId}`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'doghealthy_notifications',
        filter: `user_id=eq.${authStore.userId}`
      },
      (payload) => {
        // Add new notification to the top of the list
        notifications.value.unshift(payload.new as Notification)
        
        // Keep only the latest 10 notifications
        if (notifications.value.length > 10) {
          notifications.value = notifications.value.slice(0, 10)
        }
      }
    )
    .subscribe()
}

// Lifecycle
onMounted(() => {
  if (authStore.userId) {
    fetchNotifications()
    setupRealtimeSubscription()
  }
})

onUnmounted(() => {
  if (subscription) {
    supabase.removeChannel(subscription)
  }
})
</script>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
