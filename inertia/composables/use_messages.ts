import type { Message } from '../types/message'
import { nextTick, type Ref } from 'vue'

type ChatRefs = {
  messages: Ref<Message[]>
  isLoading: Ref<boolean>
  isLoadingMore: Ref<boolean>
  hasMore: Ref<boolean>
  messagesContainer: Ref<HTMLElement>
}

export function useMessages(refs: ChatRefs) {
  const { messages, isLoading, isLoadingMore, hasMore, messagesContainer } = refs

  const fetchMessages = async (scrollToBottom?: () => void) => {
    if (isLoading.value) return

    isLoading.value = true

    try {
      const response = await fetch('/messages')

      if (response.ok) {
        const data = await response.json()
        messages.value = data.data
        hasMore.value = data.hasMore

        await nextTick()
        if (scrollToBottom) {
          scrollToBottom()
        }
      }
    } finally {
      isLoading.value = false
    }
  }

  const loadMoreMessages = async () => {
    if (isLoadingMore.value || !hasMore.value || messages.value.length === 0) return
    isLoadingMore.value = true

    const currentScrollHeight = messagesContainer.value?.scrollHeight || 0
    await new Promise((resolve) => setTimeout(resolve, 1500))

    try {
      const firstMessage = messages.value[0]
      const params = new URLSearchParams({
        lastMessageId: firstMessage.createdAt,
        limit: '10',
      })
      const response = await fetch(`/messages/load-more?${params}`)

      if (response.ok) {
        const { data: olderMessages, hasMore: newHasMore } = (await response.json()) as {
          data: Message[]
          hasMore: boolean
        }

        olderMessages.sort(
          (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        )

        messages.value = [...olderMessages, ...messages.value]
        hasMore.value = newHasMore

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

  return {
    fetchMessages,
    loadMoreMessages,
  }
}
