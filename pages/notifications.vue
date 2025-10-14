<template>
  <div class="container mx-auto px-4 py-8 max-w-4xl">
    <!-- Header -->
    <div class="mb-8">
      <h1 class="text-4xl font-bold text-dark mb-4">Notifications</h1>
      <p class="text-secondary text-lg">Stay updated with your dog's health and messages</p>
      
      <!-- Reminder Settings -->
      <div class="mt-6 bg-white rounded-lg shadow-sm border border-muted p-6">
        <h2 class="text-xl font-semibold text-dark mb-4">Reminder Settings</h2>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div class="flex items-center justify-between">
            <div>
              <h3 class="font-medium text-dark">Enable Reminders</h3>
              <p class="text-sm text-secondary">Get notifications for appointments, medications, and vaccinations</p>
            </div>
            <label class="relative inline-flex items-center cursor-pointer">
              <input 
                v-model="reminderSettings.enabled" 
                @change="updateReminderSettings"
                type="checkbox" 
                class="sr-only peer"
              >
              <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
            </label>
          </div>
          
          <div class="flex items-center justify-between">
            <div>
              <h3 class="font-medium text-dark">Browser Notifications</h3>
              <p class="text-sm text-secondary">Show desktop notifications when reminders are due</p>
            </div>
            <button 
              @click="handleRequestNotificationPermission"
              :class="notificationButtonClass"
              class="px-4 py-2 rounded-lg font-medium transition-colors"
            >
              {{ notificationButtonText }}
            </button>
          </div>
        </div>
        
        <div v-if="reminderSettings.lastCheck" class="mt-4 p-3 bg-gray-50 rounded-lg">
          <p class="text-sm text-secondary">
            Last reminder check: {{ formatReminderDate(reminderSettings.lastCheck) }}
          </p>
          <button 
            @click="checkRemindersNow"
            :disabled="checkingReminders"
            class="mt-2 text-sm text-primary hover:text-accent font-medium disabled:opacity-50"
          >
            {{ checkingReminders ? 'Checking...' : 'Check Reminders Now' }}
          </button>
        </div>
      </div>
    </div>

    <!-- Actions -->
    <div class="flex justify-between items-center mb-6">
      <div class="flex gap-4">
        <select v-model="typeFilter" @change="fetchNotifications" class="border border-muted rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary focus:border-primary">
          <option value="">All Types</option>
          <option value="appointment">Appointments</option>
          <option value="medication">Medications</option>
          <option value="message">Messages</option>
          <option value="upgrade">Upgrades</option>
        </select>
        
        <select v-model="statusFilter" @change="fetchNotifications" class="border border-muted rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary focus:border-primary">
          <option value="">All Status</option>
          <option value="unread">Unread</option>
          <option value="read">Read</option>
        </select>
      </div>
      
      <div class="flex gap-2">
        <button 
          v-if="unreadCount > 0"
          @click="markAllAsRead"
          class="bg-secondary hover:bg-dark text-white px-4 py-2 rounded-lg font-semibold transition-colors"
        >
          Mark All Read
        </button>
        <button 
          @click="deleteAllRead"
          class="bg-red-100 hover:bg-red-200 text-red-600 px-4 py-2 rounded-lg font-semibold transition-colors"
        >
          Delete Read
        </button>
      </div>
    </div>

    <!-- Stats -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
      <div class="bg-white rounded-lg shadow-sm border border-muted p-4">
        <div class="flex items-center">
          <div class="p-2 bg-primary rounded-lg">
            <i class="bi bi-bell text-dark"></i>
          </div>
          <div class="ml-3">
            <p class="text-2xl font-bold text-dark">{{ notifications.length }}</p>
            <p class="text-secondary text-sm">Total</p>
          </div>
        </div>
      </div>
      
      <div class="bg-white rounded-lg shadow-sm border border-muted p-4">
        <div class="flex items-center">
          <div class="p-2 bg-accent rounded-lg">
            <i class="bi bi-envelope"></i>
          </div>
          <div class="ml-3">
            <p class="text-2xl font-bold text-dark">{{ unreadCount }}</p>
            <p class="text-secondary text-sm">Unread</p>
          </div>
        </div>
      </div>
      
      <div class="bg-white rounded-lg shadow-sm border border-muted p-4">
        <div class="flex items-center">
          <div class="p-2 bg-secondary rounded-lg">
            <i class="bi bi-calendar2-event text-white"></i>
          </div>
          <div class="ml-3">
            <p class="text-2xl font-bold text-dark">{{ appointmentCount }}</p>
            <p class="text-secondary text-sm">Appointments</p>
          </div>
        </div>
      </div>
      
      <div class="bg-white rounded-lg shadow-sm border border-muted p-4">
        <div class="flex items-center">
          <div class="p-2 bg-dark rounded-lg">
            <i class="bi bi-chat-dots text-white"></i>
          </div>
          <div class="ml-3">
            <p class="text-2xl font-bold text-dark">{{ messageCount }}</p>
            <p class="text-secondary text-sm">Messages</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="text-center py-12">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
      <p class="text-secondary mt-4">Loading notifications...</p>
    </div>

    <!-- Empty State -->
    <div v-else-if="filteredNotifications.length === 0" class="text-center py-12">
      <div class="text-6xl mb-4">🔔</div>
      <h3 class="text-xl font-semibold text-dark mb-2">No notifications</h3>
      <p class="text-secondary">You're all caught up! Check back later for updates.</p>
    </div>

    <!-- Notifications List -->
    <div v-else class="space-y-4">
      <div 
        v-for="notification in filteredNotifications" 
        :key="notification.id"
        class="bg-white rounded-lg shadow-sm border border-muted p-6 hover:shadow-md transition-shadow cursor-pointer"
        :class="{ 'bg-primary bg-opacity-5 border-primary': !notification.is_read }"
        @click="handleNotificationClick(notification)"
      >
        <div class="flex items-start gap-4">
          <!-- Icon -->
          <div class="flex-shrink-0">
            <div 
              class="w-12 h-12 rounded-full flex items-center justify-center text-white"
              :class="getNotificationIconClass(notification.type)"
            >
              <i :class="getNotificationIcon(notification.type)" class="text-lg"></i>
            </div>
          </div>
          
          <!-- Content -->
          <div class="flex-1 min-w-0">
            <div class="flex items-start justify-between">
              <div>
                <h3 class="font-semibold text-dark mb-1">{{ notification.title }}</h3>
                <p class="text-secondary mb-2">{{ notification.message }}</p>
                <p class="text-sm text-secondary">{{ formatDate(notification.created_at) }}</p>
              </div>
              
              <div class="flex items-center gap-2">
                <!-- Unread indicator -->
                <div v-if="!notification.is_read" class="w-3 h-3 bg-primary rounded-full"></div>
                
                <!-- Delete button -->
                <button 
                  @click.stop="deleteNotification(notification.id)"
                  class="text-secondary hover:text-red-600 transition-colors"
                >
                  <i class="bi bi-trash"></i>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Pagination -->
    <div v-if="hasMore" class="mt-8 text-center">
      <button 
        @click="loadMore"
        :disabled="loadingMore"
        class="bg-primary hover:bg-accent text-dark px-6 py-3 rounded-lg font-semibold transition-colors disabled:bg-muted disabled:cursor-not-allowed"
      >
        <span v-if="loadingMore">Loading...</span>
        <span v-else>Load More</span>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useSupabase } from '~/composables/useSupabase'
import { useAuthStore } from '~/stores/auth'
import { useReminders } from '~/composables/useReminders'

// Define page meta
definePageMeta({
  middleware: 'auth'
})

const supabase = useSupabase()
const authStore = useAuthStore()
const { 
  getReminderSettings, 
  setRemindersEnabled, 
  requestNotificationPermission, 
  checkAllReminders 
} = useReminders()

// State
const notifications = ref<any[]>([])
const loading = ref(true)
const loadingMore = ref(false)
const typeFilter = ref('')
const statusFilter = ref('')
const page = ref(1)
const pageSize = 20
const hasMore = ref(true)
const reminderSettings = ref(getReminderSettings())
const checkingReminders = ref(false)

// Computed
const unreadCount = computed(() => {
  return notifications.value.filter(n => !n.is_read).length
})

const appointmentCount = computed(() => {
  return notifications.value.filter(n => n.type === 'appointment').length
})

const messageCount = computed(() => {
  return notifications.value.filter(n => n.type === 'message').length
})

const filteredNotifications = computed(() => {
  let filtered = notifications.value

  if (typeFilter.value) {
    filtered = filtered.filter(n => n.type === typeFilter.value)
  }

  if (statusFilter.value === 'unread') {
    filtered = filtered.filter(n => !n.is_read)
  } else if (statusFilter.value === 'read') {
    filtered = filtered.filter(n => n.is_read)
  }

  return filtered
})

const notificationButtonText = computed(() => {
  const permission = reminderSettings.value.notificationsPermission
  switch (permission) {
    case 'granted': return 'Enabled'
    case 'denied': return 'Blocked'
    case 'default': 
    default: return 'Request Permission'
  }
})

const notificationButtonClass = computed(() => {
  const permission = reminderSettings.value.notificationsPermission
  switch (permission) {
    case 'granted': return 'bg-green-100 text-green-700 hover:bg-green-200'
    case 'denied': return 'bg-red-100 text-red-700 hover:bg-red-200'
    case 'default': 
    default: return 'bg-primary text-dark hover:bg-accent'
  }
})

// Methods
const updateReminderSettings = () => {
  setRemindersEnabled(reminderSettings.value.enabled)
}

const handleRequestNotificationPermission = async () => {
  const granted = await requestNotificationPermission()
  if (granted) {
    reminderSettings.value.notificationsPermission = 'granted'
  } else {
    reminderSettings.value.notificationsPermission = 'denied'
  }
}

const checkRemindersNow = async () => {
  checkingReminders.value = true
  try {
    const result = await checkAllReminders()
    reminderSettings.value.lastCheck = new Date().toISOString()
    
    // Show success message
    if (result.appointments + result.medications + result.vaccinations > 0) {
      alert(`Found ${result.appointments + result.medications + result.vaccinations} reminders! Check your notifications.`)
    } else {
      alert('No new reminders found.')
    }
    
    // Refresh notifications
    await fetchNotifications()
  } catch (error) {
    console.error('Error checking reminders:', error)
    alert('Error checking reminders. Please try again.')
  } finally {
    checkingReminders.value = false
  }
}

const formatReminderDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-GB', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

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

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-GB', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const fetchNotifications = async (loadMore = false) => {
  if (!authStore.userId) return
  
  try {
    if (loadMore) {
      loadingMore.value = true
    } else {
      loading.value = true
      page.value = 1
    }
    
    const from = (page.value - 1) * pageSize
    const to = from + pageSize - 1

    const { data, error } = await supabase
      .from('doghealthy_notifications')
      .select('*')
      .eq('user_id', authStore.userId)
      .order('created_at', { ascending: false })
      .range(from, to)

    if (error) throw error
    
    if (loadMore) {
      notifications.value = [...notifications.value, ...(data || [])]
    } else {
      notifications.value = data || []
    }
    
    hasMore.value = (data || []).length === pageSize
  } catch (error) {
    console.error('Error fetching notifications:', error)
  } finally {
    loading.value = false
    loadingMore.value = false
  }
}

const loadMore = async () => {
  page.value++
  await fetchNotifications(true)
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

const deleteAllRead = async () => {
  if (!confirm('Are you sure you want to delete all read notifications?')) {
    return
  }
  
  if (!authStore.userId) return
  
  try {
    const { error } = await supabase
      .from('doghealthy_notifications')
      .delete()
      .eq('user_id', authStore.userId)
      .eq('is_read', true)

    if (error) throw error
    
    // Update local state
    notifications.value = notifications.value.filter(n => !n.is_read)
  } catch (error) {
    console.error('Error deleting read notifications:', error)
  }
}

const deleteNotification = async (notificationId: string) => {
  if (!confirm('Are you sure you want to delete this notification?')) {
    return
  }
  
  try {
    const { error } = await supabase
      .from('doghealthy_notifications')
      .delete()
      .eq('id', notificationId)

    if (error) throw error
    
    // Update local state
    notifications.value = notifications.value.filter(n => n.id !== notificationId)
  } catch (error) {
    console.error('Error deleting notification:', error)
  }
}

const handleNotificationClick = async (notification: any) => {
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
}

// Lifecycle
onMounted(() => {
  fetchNotifications()
})
</script>
