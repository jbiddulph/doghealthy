<template>
  <div class="min-h-screen bg-gray-50">
    <div class="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-gray-900">Inbox</h1>
        <p class="text-gray-600 mt-1">
          Messages about your classifieds listings — including enquiries from guests who aren’t registered.
        </p>
      </div>

      <div v-if="loading" class="text-center py-16 text-gray-500">Loading messages…</div>

      <div v-else-if="threads.length === 0" class="bg-white rounded-xl border border-gray-200 p-12 text-center">
        <div class="text-5xl mb-4">📭</div>
        <h2 class="text-xl font-semibold text-gray-900 mb-2">No messages yet</h2>
        <p class="text-gray-600 mb-6">When someone contacts you about a listing, it will show up here.</p>
        <NuxtLink to="/classifieds" class="text-blue-600 font-medium hover:underline">Browse classifieds</NuxtLink>
      </div>

      <div v-else class="grid lg:grid-cols-5 gap-6">
        <!-- Thread list -->
        <div class="lg:col-span-2 bg-white rounded-xl border border-gray-200 overflow-hidden">
          <button
            v-for="thread in threads"
            :key="thread.key"
            type="button"
            class="w-full text-left px-4 py-3 border-b border-gray-100 hover:bg-gray-50 transition-colors"
            :class="selectedKey === thread.key ? 'bg-blue-50 border-l-4 border-l-blue-600' : ''"
            @click="selectThread(thread)"
          >
            <div class="flex items-start justify-between gap-2">
              <div class="min-w-0">
                <p class="font-semibold text-gray-900 truncate">{{ thread.counterpartName }}</p>
                <p class="text-xs text-gray-500 truncate">{{ thread.listingTitle }}</p>
              </div>
              <span
                v-if="thread.unreadCount > 0"
                class="shrink-0 inline-flex items-center justify-center min-w-[1.25rem] h-5 px-1.5 rounded-full bg-blue-600 text-white text-xs font-bold"
              >
                {{ thread.unreadCount }}
              </span>
            </div>
            <p class="text-sm text-gray-600 mt-1 line-clamp-2">{{ thread.preview }}</p>
            <p class="text-xs text-gray-400 mt-1">{{ formatWhen(thread.lastAt) }}</p>
            <span
              v-if="thread.isGuest"
              class="inline-block mt-1 text-[11px] font-semibold uppercase tracking-wide text-amber-800 bg-amber-50 border border-amber-200 rounded px-1.5 py-0.5"
            >
              Guest enquiry
            </span>
          </button>
        </div>

        <!-- Thread detail -->
        <div class="lg:col-span-3 bg-white rounded-xl border border-gray-200 flex flex-col min-h-[28rem]">
          <div v-if="!selected" class="flex-1 flex items-center justify-center text-gray-500 p-8">
            Select a conversation
          </div>

          <template v-else>
            <div class="p-4 border-b border-gray-100">
              <h2 class="font-semibold text-gray-900">{{ selected.counterpartName }}</h2>
              <p class="text-sm text-gray-500">
                Re:
                <NuxtLink :to="`/classifieds/${selected.listingId}`" class="text-blue-600 hover:underline">
                  {{ selected.listingTitle }}
                </NuxtLink>
              </p>
              <div v-if="selected.isGuest" class="mt-3 text-sm bg-amber-50 border border-amber-200 rounded-lg p-3 text-amber-950">
                <p class="font-medium mb-1">Guest contact details</p>
                <p v-if="selected.guestEmail">
                  Email:
                  <a :href="`mailto:${selected.guestEmail}`" class="underline">{{ selected.guestEmail }}</a>
                </p>
                <p v-if="selected.guestPhone">
                  Phone:
                  <a :href="`tel:${selected.guestPhone}`" class="underline">{{ selected.guestPhone }}</a>
                </p>
                <p class="text-xs mt-2 text-amber-800">
                  This person isn’t registered — reply by email or phone. In-app replies only work when both sides have an account.
                </p>
              </div>
            </div>

            <div ref="messagesEl" class="flex-1 overflow-y-auto p-4 space-y-3">
              <div
                v-for="msg in selected.messages"
                :key="msg.id"
                class="flex"
                :class="isMine(msg) ? 'justify-end' : 'justify-start'"
              >
                <div
                  class="max-w-[85%] rounded-lg px-3 py-2 text-sm"
                  :class="isMine(msg) ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-900'"
                >
                  <p class="whitespace-pre-wrap">{{ msg.content }}</p>
                  <p class="text-[11px] mt-1 opacity-75">{{ formatTime(msg.created_at) }}</p>
                </div>
              </div>
            </div>

            <div v-if="!selected.isGuest" class="p-4 border-t border-gray-100">
              <form class="flex gap-2" @submit.prevent="sendReply">
                <input
                  v-model="replyText"
                  type="text"
                  required
                  placeholder="Write a reply…"
                  class="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  :disabled="sending"
                >
                <button
                  type="submit"
                  :disabled="sending || !replyText.trim()"
                  class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-semibold disabled:opacity-50"
                >
                  {{ sending ? '…' : 'Send' }}
                </button>
              </form>
            </div>
            <div v-else class="p-4 border-t border-gray-100 text-sm text-gray-600">
              Use the email or phone above to continue this conversation with the guest.
            </div>
          </template>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  middleware: 'auth'
})

usePageSeo({
  title: 'Inbox',
  description: 'Your DogHealthy classifieds message inbox.',
  path: '/inbox',
  index: false
})

interface Msg {
  id: string
  listing_id: string
  sender_id: string | null
  recipient_id: string
  content: string
  is_read: boolean
  created_at: string
  guest_name: string | null
  guest_email: string | null
  guest_phone: string | null
  doghealthy_listings?: { id: string; title: string } | null
}

interface Thread {
  key: string
  listingId: string
  listingTitle: string
  counterpartName: string
  counterpartUserId: string | null
  guestEmail: string | null
  guestPhone: string | null
  isGuest: boolean
  preview: string
  lastAt: string
  unreadCount: number
  messages: Msg[]
}

const supabase = useSupabase()
const authStore = useAuthStore()

const loading = ref(true)
const threads = ref<Thread[]>([])
const selectedKey = ref<string | null>(null)
const replyText = ref('')
const sending = ref(false)
const messagesEl = ref<HTMLElement | null>(null)

const selected = computed(() => threads.value.find((t) => t.key === selectedKey.value) || null)

const isMine = (msg: Msg) => msg.sender_id === authStore.userId

const formatWhen = (iso: string) => {
  const d = new Date(iso)
  const now = new Date()
  const sameDay = d.toDateString() === now.toDateString()
  if (sameDay) {
    return d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })
  }
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
}

const formatTime = (iso: string) =>
  new Date(iso).toLocaleString('en-GB', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit'
  })

const threadKeyFor = (msg: Msg, userId: string) => {
  if (!msg.sender_id) {
    return `guest:${msg.listing_id}:${(msg.guest_email || '').toLowerCase()}`
  }
  const other = msg.sender_id === userId ? msg.recipient_id : msg.sender_id
  return `user:${msg.listing_id}:${other}`
}

const buildThreads = (rows: Msg[], userId: string): Thread[] => {
  const map = new Map<string, Thread>()

  for (const msg of rows) {
    const key = threadKeyFor(msg, userId)
    const listingTitle = msg.doghealthy_listings?.title || 'Listing'
    const isGuest = !msg.sender_id
    let counterpartName = 'User'
    let counterpartUserId: string | null = null
    let guestEmail: string | null = null
    let guestPhone: string | null = null

    if (isGuest) {
      counterpartName = msg.guest_name || 'Guest'
      guestEmail = msg.guest_email
      guestPhone = msg.guest_phone
    } else {
      counterpartUserId = msg.sender_id === userId ? msg.recipient_id : msg.sender_id
      counterpartName = msg.sender_id === userId ? 'Buyer / seller' : 'Message'
    }

    if (!map.has(key)) {
      map.set(key, {
        key,
        listingId: msg.listing_id,
        listingTitle,
        counterpartName,
        counterpartUserId,
        guestEmail,
        guestPhone,
        isGuest,
        preview: msg.content,
        lastAt: msg.created_at,
        unreadCount: 0,
        messages: []
      })
    }

    const thread = map.get(key)!
    thread.messages.push(msg)
    if (msg.created_at >= thread.lastAt) {
      thread.lastAt = msg.created_at
      thread.preview = msg.content
      if (isGuest) {
        thread.counterpartName = msg.guest_name || thread.counterpartName
        thread.guestEmail = msg.guest_email || thread.guestEmail
        thread.guestPhone = msg.guest_phone || thread.guestPhone
      }
    }
    if (!msg.is_read && msg.recipient_id === userId) {
      thread.unreadCount += 1
    }
  }

  return [...map.values()]
    .map((t) => ({
      ...t,
      messages: t.messages.sort(
        (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      )
    }))
    .sort((a, b) => new Date(b.lastAt).getTime() - new Date(a.lastAt).getTime())
}

const loadInbox = async () => {
  loading.value = true
  try {
    const userId = authStore.userId
    if (!userId) return

    const { data, error } = await supabase
      .from('doghealthy_messages')
      .select('*, doghealthy_listings(id, title)')
      .or(`sender_id.eq.${userId},recipient_id.eq.${userId}`)
      .order('created_at', { ascending: true })

    if (error) throw error

    threads.value = buildThreads((data || []) as Msg[], userId)

    // Resolve counterpart names for registered users
    const otherIds = [
      ...new Set(
        threads.value
          .filter((t) => t.counterpartUserId)
          .map((t) => t.counterpartUserId as string)
      )
    ]
    if (otherIds.length) {
      const { data: users } = await supabase
        .from('doghealthy_users')
        .select('id, full_name, email')
        .in('id', otherIds)

      const byId = new Map((users || []).map((u: any) => [u.id, u]))
      threads.value = threads.value.map((t) => {
        if (!t.counterpartUserId) return t
        const u = byId.get(t.counterpartUserId)
        if (!u) return t
        return {
          ...t,
          counterpartName: u.full_name || u.email || 'User'
        }
      })
    }

    if (!selectedKey.value && threads.value.length) {
      await selectThread(threads.value[0])
    } else if (selectedKey.value) {
      const t = threads.value.find((x) => x.key === selectedKey.value)
      if (t) await selectThread(t)
    }
  } catch (err) {
    console.error('loadInbox', err)
  } finally {
    loading.value = false
  }
}

const selectThread = async (thread: Thread) => {
  selectedKey.value = thread.key
  replyText.value = ''

  const unreadIds = thread.messages
    .filter((m) => !m.is_read && m.recipient_id === authStore.userId)
    .map((m) => m.id)

  if (unreadIds.length) {
    await supabase
      .from('doghealthy_messages')
      .update({ is_read: true })
      .in('id', unreadIds)

    thread.unreadCount = 0
    thread.messages = thread.messages.map((m) =>
      unreadIds.includes(m.id) ? { ...m, is_read: true } : m
    )
  }

  await nextTick()
  if (messagesEl.value) {
    messagesEl.value.scrollTop = messagesEl.value.scrollHeight
  }
}

const sendReply = async () => {
  if (!selected.value || selected.value.isGuest || !authStore.userId) return
  if (!replyText.value.trim() || !selected.value.counterpartUserId) return

  sending.value = true
  try {
    const content = replyText.value.trim()
    const { error } = await supabase.from('doghealthy_messages').insert({
      listing_id: selected.value.listingId,
      sender_id: authStore.userId,
      recipient_id: selected.value.counterpartUserId,
      content
    })
    if (error) throw error

    await supabase.from('doghealthy_notifications').insert({
      user_id: selected.value.counterpartUserId,
      type: 'message',
      reference_id: selected.value.listingId,
      title: 'New Message',
      message: content.slice(0, 280),
      is_read: false
    })

    replyText.value = ''
    await loadInbox()
  } catch (err) {
    console.error('sendReply', err)
    alert('Could not send reply. Please try again.')
  } finally {
    sending.value = false
  }
}

onMounted(async () => {
  if ((authStore as any).loading) {
    await new Promise<void>((resolve) => {
      const check = () => {
        if (!(authStore as any).loading) resolve()
        else setTimeout(check, 40)
      }
      check()
    })
  }
  await loadInbox()
})
</script>
