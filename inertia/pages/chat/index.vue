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
import { computed, nextTick, onMounted, onUnmounted, type Ref, ref } from 'vue'
import type { User } from '../../types/user'
import type { Message } from '../../types/message'
import { formatTime } from '../../utils/format_utils'
import { useMessages } from '../../composables/use_messages'
import { useChat } from '../../composables/use_chat'

const page = usePage()
const user = computed(() => page.props.user as User)

const messages = ref<Message[]>([])
const newMessage = ref('')

const messagesContainer = ref<HTMLElement>()
const isLoading = ref(false)
const isLoadingMore = ref(false)
const hasMore = ref(true)

const { fetchMessages, loadMoreMessages } = useMessages({ messages, isLoading, isLoadingMore, hasMore, messagesContainer })
const { joinChat, disconnectChat, sendMessage } = useChat('main-room', { messages, newMessage })

const smoothScrollTo = (container: HTMLElement, target: number, duration = 180) => {
  const start = container.scrollTop
  const change = target - start
  const startTime = performance.now()
  const easeInOutQuad = (t: number) => (t < 0.5 ? 2*t*t : -1 + (4 - 2*t)*t)

  function animate(now: number) {
    const elapsed = now - startTime
    const t = Math.min(1, elapsed / duration)
    container.scrollTop = start + change * easeInOutQuad(t)
    if (t < 1) requestAnimationFrame(animate)
  }
  requestAnimationFrame(animate)
}

const scrollToBottom = () => {
  const el = messagesContainer.value
  if (!el) return
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      smoothScrollTo(el, el.scrollHeight, 180)
    })
  })
}

const isUserAtBottom = (thresholdPercentage = 80) => {
  const el = messagesContainer.value
  if (!el) return true

  const scrollPercentage = (el.scrollTop + el.clientHeight) / el.scrollHeight
  const isAtBottom = scrollPercentage >= (thresholdPercentage / 100)
  return isAtBottom
}

const scrollToBottomIfNeeded = () => {
  const isAtBottom = isUserAtBottom()
  if (isAtBottom) {
    scrollToBottom()
  }
}

const scrollToBottomAuto = () => {
  const el = messagesContainer.value
  if (!el) return
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      el.scrollTop = el.scrollHeight
    })
  })
}

const isMyMessage = (message: Message): boolean => {
  return message.sender.username === user.value?.username
}

const handleScroll = () => {
  if (!messagesContainer.value) return
  
  const { scrollTop } = messagesContainer.value
  
  if (scrollTop <= 30 && hasMore.value && !isLoadingMore.value) {
    loadMoreMessages()
  }
}

onMounted(async () => {
  fetchMessages(scrollToBottomAuto)
  joinChat(scrollToBottomIfNeeded)
})

onUnmounted(() => {
  disconnectChat()
})

defineOptions({ layout: DefaultLayout })
</script>