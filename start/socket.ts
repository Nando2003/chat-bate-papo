import { Server } from 'socket.io'
import server from '@adonisjs/core/services/server'
import app from '@adonisjs/core/services/app'
import AuthSocketMiddleware from '#middleware/auth_socket_middleware'
import ChatService from '#services/chat_service'

export let io: Server

app.ready(async () => {
  io = new Server(server.getNodeServer(), {
    cors: { origin: true, credentials: true },
  })

  io.use(async (socket, next) => {
    const middleware = new AuthSocketMiddleware()
    await middleware.handle(socket, next)
  })

  io.on('connection', (socket) => {
    const userId = socket.data.userId as number
    const chatService = new ChatService(userId)

    socket.on('joinRoom', async (room: string) => {
      await chatService.joinRoom(socket, room)
    })

    socket.on('leaveRoom', async (room: string) => {
      await chatService.leaveRoom(socket, room)
    })

    socket.on('sendMessage', async (data: { room: string; content: string }) => {
      const { room, content } = data
      await chatService.sendMessage(socket, room, content)
    })
  })
})
