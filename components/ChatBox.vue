<template>
  <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
    <div class="bg-white rounded-lg max-w-md w-full max-h-[80vh] flex flex-col">
      <div class="p-4 border-b border-muted flex items-center justify-between">
        <div>
          <h3 class="font-semibold text-dark">Chat with Seller</h3>
          <p class="text-sm text-secondary">{{ recipientName }}</p>
        </div>
        <button type="button" class="text-secondary hover:text-dark" @click="$emit('close')">
          <i class="bi bi-x-lg"></i>
        </button>
      </div>

      <div ref="messagesContainer" class="flex-1 p-4 overflow-y-auto space-y-4">
        <div
          v-for="message in visibleMessages"
          :key="message.id"
          class="flex"
          :class="message.sender_id === currentUserId ? 'justify-end' : 'justify-start'"
        >
          <div
            class="max-w-xs p-3 rounded-lg"
            :class="message.sender_id === currentUserId ? 'bg-primary text-dark' : 'bg-muted text-dark'"
          >
            <template v-if="editingId === message.id">
              <textarea v-model="editDraft" rows="3" class="w-full rounded border border-gray-300 px-2 py-1 text-sm" />
              <div class="flex gap-2 mt-2 text-xs">
                <button type="button" class="font-semibold underline" @click="saveEdit(message)">Save</button>
                <button type="button" class="underline opacity-70" @click="cancelEdit">Cancel</button>
              </div>
            </template>
            <template v-else>
              <p class="text-sm whitespace-pre-wrap">{{ message.content }}</p>
              <p class="text-xs mt-1 opacity-75">
                {{ formatTime(message.created_at) }}
                <span v-if="message.edited_at"> · edited</span>
              </p>
              <div class="flex gap-2 mt-1 text-xs opacity-80">
                <button
                  v-if="message.sender_id === currentUserId"
                  type="button"
                  class="underline"
                  @click="startEdit(message)"
                >
                  Edit
                </button>
                <button type="button" class="underline" @click="deleteMessage(message)">
                  Delete
                </button>
              </div>
            </template>
          </div>
        </div>

        <div v-if="visibleMessages.length === 0" class="text-center text-secondary py-8">
          <div class="text-4xl mb-2">💬</div>
          <p>No messages yet. Start the conversation!</p>
        </div>
      </div>

      <div class="p-4 border-t border-muted">
        <form class="flex gap-2" @submit.prevent="sendMessage">
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
interface Message {
  id: string
  content: string
  sender_id: string | null
  recipient_id: string
  created_at: string
  edited_at?: string | null
  is_read: boolean
  sender_deleted_at?: string | null
  recipient_deleted_at?: string | null
}

interface Props {
  listingId: string
  recipientId: string
  recipientName: string
  currentUserId: string
}

const props = defineProps<Props>()
defineEmits<{ close: [] }>()

const supabase = useSupabase()
const { refreshUnreadCount } = useInboxUnread()

const messages = ref<Message[]>([])
const newMessage = ref('')
const sending = ref(false)
const messagesContainer = ref<HTMLElement>()
const editingId = ref<string | null>(null)
const editDraft = ref('')
let subscription: any = null

const visibleMessages = computed(() =>
  messages.value.filter((m) => {
    if (m.sender_id === props.currentUserId) return !m.sender_deleted_at
    if (m.recipient_id === props.currentUserId) return !m.recipient_deleted_at
    return true
  })
)

const formatTime = (dateString: string) =>
  new Date(dateString).toLocaleTimeString('en-GB', {
    hour: '2-digit',
    minute: '2-digit'
  })

const scrollToBottom = () => {
  if (messagesContainer.value) {
    messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
  }
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

    const unreadIds = messages.value
      .filter((m) => m.recipient_id === props.currentUserId && !m.is_read && !m.recipient_deleted_at)
      .map((m) => m.id)
    if (unreadIds.length) {
      await supabase.from('doghealthy_messages').update({ is_read: true }).in('id', unreadIds)
      await refreshUnreadCount()
    }

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
    const { error } = await supabase.from('doghealthy_messages').insert({
      listing_id: props.listingId,
      sender_id: props.currentUserId,
      recipient_id: props.recipientId,
      content: newMessage.value.trim()
    })
    if (error) throw error

    newMessage.value = ''

    await supabase.from('doghealthy_notifications').insert({
      user_id: props.recipientId,
      type: 'message',
      reference_id: props.listingId,
      title: 'New Message',
      message: 'You have a new message about your listing.',
      is_read: false
    })
  } catch (error) {
    console.error('Error sending message:', error)
    alert('Error sending message. Please try again.')
  } finally {
    sending.value = false
  }
}

const startEdit = (message: Message) => {
  editingId.value = message.id
  editDraft.value = message.content
}

const cancelEdit = () => {
  editingId.value = null
  editDraft.value = ''
}

const saveEdit = async (message: Message) => {
  if (!editDraft.value.trim()) return
  const { error } = await supabase
    .from('doghealthy_messages')
    .update({
      content: editDraft.value.trim(),
      edited_at: new Date().toISOString()
    })
    .eq('id', message.id)
    .eq('sender_id', props.currentUserId)

  if (error) {
    alert('Could not edit message.')
    return
  }
  cancelEdit()
  await fetchMessages()
}

const deleteMessage = async (message: Message) => {
  if (message.sender_id === props.currentUserId) {
    if (!confirm('Delete this message? It will be removed for both people.')) return
    const { error } = await supabase
      .from('doghealthy_messages')
      .delete()
      .eq('id', message.id)
      .eq('sender_id', props.currentUserId)
    if (error) {
      alert('Could not delete message.')
      return
    }
  } else {
    if (!confirm('Remove this message from your chat?')) return
    const { error } = await supabase
      .from('doghealthy_messages')
      .update({ recipient_deleted_at: new Date().toISOString() })
      .eq('id', message.id)
      .eq('recipient_id', props.currentUserId)
    if (error) {
      alert('Could not delete message.')
      return
    }
  }
  await fetchMessages()
  await refreshUnreadCount()
}

const setupRealtimeSubscription = () => {
  subscription = supabase
    .channel(`messages-${props.listingId}-${props.currentUserId}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'doghealthy_messages',
        filter: `listing_id=eq.${props.listingId}`
      },
      async () => {
        await fetchMessages()
      }
    )
    .subscribe()
}

onMounted(async () => {
  await fetchMessages()
  setupRealtimeSubscription()
})

onUnmounted(() => {
  if (subscription) supabase.removeChannel(subscription)
})

watch(visibleMessages, () => {
  nextTick(() => scrollToBottom())
}, { deep: true })
</script>
