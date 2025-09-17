<template>
  <Head title="Chat" />

  <div class="min-h-screen bg-gray-100 py-8">
    <div class="max-w-6xl mx-auto px-4">
      <div class="bg-white rounded-lg shadow-lg h-[80vh] flex flex-col">
        <div class="bg-gray-50 px-6 py-4 border-b rounded-t-lg">
          <h2 class="text-xl font-semibold text-gray-800">Main Chat Room</h2>
        </div>

        <div 
          ref="messagesContainer"
          class="flex-1 p-6 overflow-y-auto"
          @scroll="handleScroll"
        >
          <div v-if="isLoadingMore" class="text-center py-4">
            <div class="text-sm text-gray-500">Carregando mensagens antigas...</div>
          </div>

          <div class="space-y-4">
            <div
              v-for="message in messages"
              :key="`${message.createdAt}-${message.sender.username}`"
              class="flex"
              :class="isMyMessage(message) ? 'justify-end' : 'justify-start'"
            >
              <div
                class="max-w-xs lg:max-w-md px-4 py-2 rounded-lg"
                :class="
                  isMyMessage(message) ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-800'
                "
              >
                <div class="mb-2">
                  <div class="text-sm font-semibold">
                    {{ message.sender.fullName }}
                  </div>
                  <div class="text-xs opacity-70">@{{ message.sender.username }}</div>
                </div>

                <div class="text-lg">
                  {{ message.content }}
                </div>

                <hr
                  class="mt-1 border-t"
                  :class="isMyMessage(message) ? 'border-blue-300' : 'border-gray-300'"
                />

                <div class="text-xs mt-1 opacity-70">
                  {{ formatTime(message.createdAt) }}
                </div>
              </div>
            </div>
          </div>

          <div v-if="isLoading" class="text-center py-4">
            <div class="text-sm text-gray-500">Carregando mensagens...</div>
          </div>
        </div>

        <div class="px-6 py-4 border-t bg-gray-50 rounded-b-lg">
          <form @submit.prevent="sendMessage" autocomplete="off">
            <div class="flex items-center space-x-2">
              <input
                type="text"
                v-model="newMessage"
                placeholder="Send a message"
                class="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                type="submit"
                class="bg-gray-400 hover:bg-black text-white px-4 py-2 rounded-lg transition-colors duration-200 ease-in-out"
              >
                Enviar
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Head, usePage } from '@inertiajs/vue3'
import DefaultLayout from '../../layouts/default_layout.vue'
import { computed, onMounted, onUnmounted, ref, nextTick } from 'vue'
import { io, Socket } from 'socket.io-client'

interface User {
  fullName: string
  username: string
}

interface Message {
  content: string
  createdAt: string
  sender: User
}

const page = usePage()
const user = computed(() => page.props.user as User)

const messages = ref<Message[]>([])
const newMessage = ref('')

const messagesContainer = ref<HTMLElement>()
const isLoading = ref(false)
const isLoadingMore = ref(false)
const hasMore = ref(true)

let socket: Socket | null = null

const isMyMessage = (message: Message) => {
  return message.sender.username === user.value?.username
}

const fetchMessages = async () => {
  if (isLoading.value) return

  isLoading.value = true

  try {
    const response = await fetch('/messages')

    if (response.ok) {
      const data = await response.json()
      messages.value = data.data
      hasMore.value = data.hasMore

      await nextTick()
      scrollToBottom()
    }
  } finally {
    isLoading.value = false
  }
}

const loadMoreMessages = async () => {
  if (isLoadingMore.value || !hasMore.value || messages.value.length === 0) return
  
  console.log('Loading more messages...')
  isLoadingMore.value = true
  const currentScrollHeight = messagesContainer.value?.scrollHeight || 0
  
  try {
    const firstMessage = messages.value[0]
    
    const params = new URLSearchParams({
      lastMessageId: firstMessage.createdAt,
      limit: '20',
    })

    const response = await fetch(`/messages/load-more?${params}`)

    if (response.ok) {
      const data = await response.json()
      const olderMessages = data.data
      messages.value.unshift(...olderMessages)
      hasMore.value = data.hasMore

      await nextTick()

      if (messagesContainer.value) {
        const newScrollHeight = messagesContainer.value.scrollHeight
        messagesContainer.value.scrollTop = newScrollHeight - currentScrollHeight
      }
    }

  } finally {
    isLoadingMore.value = false
  }
}

const handleScroll = () => {
  if (!messagesContainer.value) return
  
  const { scrollTop } = messagesContainer.value
  
  if (scrollTop <= 30 && hasMore.value && !isLoadingMore.value) {
    loadMoreMessages()
  }
}

const scrollToBottom = () => {
  if (messagesContainer.value) {
    messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
  }
}

const formatTime = (dateString: string) => {
  const messageDate = new Date(dateString)
  const now = new Date()

  // Verifica se a mensagem é de hoje
  const isToday = messageDate.toDateString() === now.toDateString()

  // Verifica se a mensagem é de ontem
  const yesterday = new Date(now)
  yesterday.setDate(yesterday.getDate() - 1)
  const isYesterday = messageDate.toDateString() === yesterday.toDateString()

  if (isToday) {
    return messageDate.toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit',
    })
  } else if (isYesterday) {
    return `Yesterday ${messageDate.toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit',
    })}`
  } else {
    return messageDate.toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }
}

const joinChat = async () => {
  socket = io('/')

  socket.on('connect', () => {
    if (!socket) return
    socket.emit('joinRoom', 'main-room')
  })

  socket.on('newMessage', (msg: Message) => {
    messages.value.push(msg)
  })
}

const sendMessage = async () => {
  if (!socket || !newMessage.value.trim()) return
  socket.emit('sendMessage', {
    content: newMessage.value,
    room: 'main-room',
  })
  newMessage.value = ''
}

const disconnectChat = () => {
  if (!socket) return
  socket.emit('leaveRoom', 'main-room')
  socket.disconnect()
  socket = null
}

onMounted(() => {
  fetchMessages()
  joinChat()
  sendMessage()
})

onUnmounted(() => {
  disconnectChat()
})

defineOptions({ layout: DefaultLayout })
</script>
