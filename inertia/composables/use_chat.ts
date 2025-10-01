import { io, Socket } from 'socket.io-client'
import type { Message } from '../types/message'
import { nextTick, type Ref } from 'vue'

type ChatRefs = {
  messages: Ref<Message[]>
  newMessage: Ref<string>
}

export function useChat(room: string, refs: ChatRefs) {
  const { messages, newMessage } = refs
  let socket: Socket | null = null

  const joinChat = async (scrollToBottom?: () => void) => {
    socket = io('/')

    socket.on('connect', () => {
      if (!socket) return
      socket.emit('joinRoom', room)
    })

    socket.on('newMessage', async (msg: Message) => {
      messages.value.push(msg)
      await nextTick()

      if (scrollToBottom) {
        scrollToBottom()
      }
    })
  }

  const sendMessage = async () => {
    if (!socket || !newMessage.value.trim()) return
    socket.emit('sendMessage', {
      content: newMessage.value,
      room: room,
    })

    newMessage.value = ''
  }

  const disconnectChat = () => {
    if (!socket) return
    socket.emit('leaveRoom', room)
    socket.disconnect()
    socket = null
  }

  return {
    joinChat,
    sendMessage,
    disconnectChat,
  }
}
