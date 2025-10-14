<template>
  <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
    <div class="bg-white rounded-lg max-w-md w-full max-h-[80vh] flex flex-col">
      <!-- Header -->
      <div class="p-4 border-b border-muted flex items-center justify-between">
        <div>
          <h3 class="font-semibold text-dark">Chat with Seller</h3>
          <p class="text-sm text-secondary">{{ recipientName }}</p>
        </div>
        <button @click="$emit('close')" class="text-secondary hover:text-dark">
          <i class="bi bi-x-lg"></i>
        </button>
      </div>

      <!-- Messages -->
      <div ref="messagesContainer" class="flex-1 p-4 overflow-y-auto space-y-4">
        <div v-for="message in messages" :key="message.id" class="flex" :class="message.sender_id === currentUserId ? 'justify-end' : 'justify-start'">
          <div class="max-w-xs p-3 rounded-lg" :class="message.sender_id === currentUserId ? 'bg-primary text-dark' : 'bg-muted text-dark'">
            <p class="text-sm">{{ message.content }}</p>
            <p class="text-xs mt-1 opacity-75">{{ formatTime(message.created_at) }}</p>
          </div>
        </div>
        
        <div v-if="messages.length === 0" class="text-center text-secondary py-8">
          <div class="text-4xl mb-2">💬</div>
          <p>No messages yet. Start the conversation!</p>
        </div>
      </div>

      <!-- Input -->
      <div class="p-4 border-t border-muted">
        <form @submit.prevent="sendMessage" class="flex gap-2">
          <input 
            v-model="newMessage" 
            type="text" 
            placeholder="Type your message..." 
            class="flex-1 border border-muted rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary focus:border-primary"
            :disabled="sending"
            required
          >
          <button 
            type="submit" 
            :disabled="sending || !newMessage.trim()"
            class="bg-primary hover:bg-accent text-dark px-4 py-2 rounded-lg font-semibold transition-colors disabled:bg-muted disabled:cursor-not-allowed"
          >
            <span v-if="sending">...</span>
            <span v-else>Send</span>
          </button>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, nextTick, watch } from 'vue'
import { useSupabase } from '~/composables/useSupabase'

interface Message {
  id: string
  content: string
  sender_id: string
  recipient_id: string
  created_at: string
  is_read: boolean
}

interface Props {
  listingId: string
  recipientId: string
  recipientName: string
  currentUserId: string
}

const props = defineProps<Props>()
const emit = defineEmits<{
  close: []
}>()

const supabase = useSupabase()

// State
const messages = ref<Message[]>([])
const newMessage = ref('')
const sending = ref(false)
const messagesContainer = ref<HTMLElement>()

// Realtime subscription
let subscription: any = null

// Methods
const formatTime = (dateString: string) => {
  return new Date(dateString).toLocaleTimeString('en-GB', {
    hour: '2-digit',
    minute: '2-digit'
  })
}

const fetchMessages = async () => {
  try {
    const { data, error } = await supabase
      .from('doghealthy_messages')
      .select('*')
      .eq('listing_id', props.listingId)
      .or(`sender_id.eq.${props.currentUserId},recipient_id.eq.${props.currentUserId}`)
      .order('created_at', { ascending: true })

    if (error) throw error
    
    messages.value = data || []
    
    // Scroll to bottom
    await nextTick()
    scrollToBottom()
  } catch (error) {
    console.error('Error fetching messages:', error)
  }
}

const sendMessage = async () => {
  if (!newMessage.value.trim() || sending.value) return
  
  try {
    sending.value = true
    
    const { error } = await supabase
      .from('doghealthy_messages')
      .insert({
        listing_id: props.listingId,
        sender_id: props.currentUserId,
        recipient_id: props.recipientId,
        content: newMessage.value.trim()
      })

    if (error) throw error
    
    newMessage.value = ''
    
    // Create notification for recipient
    await supabase
      .from('doghealthy_notifications')
      .insert({
        user_id: props.recipientId,
        type: 'message',
        reference_id: props.listingId,
        title: 'New Message',
        message: `You have a new message about your listing.`,
        is_read: false
      })
    
  } catch (error) {
    console.error('Error sending message:', error)
    alert('Error sending message. Please try again.')
  } finally {
    sending.value = false
  }
}

const scrollToBottom = () => {
  if (messagesContainer.value) {
    messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
  }
}

const setupRealtimeSubscription = () => {
  subscription = supabase
    .channel(`messages-${props.listingId}`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'doghealthy_messages',
        filter: `listing_id=eq.${props.listingId}`
      },
      async (payload) => {
        // Add new message to the list
        messages.value.push(payload.new as Message)
        
        // Scroll to bottom
        await nextTick()
        scrollToBottom()
      }
    )
    .subscribe()
}

// Lifecycle
onMounted(async () => {
  await fetchMessages()
  setupRealtimeSubscription()
})

onUnmounted(() => {
  if (subscription) {
    supabase.removeChannel(subscription)
  }
})

// Watch for changes in messages to auto-scroll
watch(messages, () => {
  nextTick(() => {
    scrollToBottom()
  })
}, { deep: true })
</script>
