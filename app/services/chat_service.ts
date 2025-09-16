import Message from '#models/message'
import User from '#models/user'
import { Socket } from 'socket.io'

export default class ChatService {
  constructor(private userId: number) {}

  async joinRoom(socket: Socket, room: string) {
    const userEntity = await User.find(this.userId)
    if (!userEntity) return
    socket.join(room)
  }

  async leaveRoom(socket: Socket, room: string) {
    socket.leave(room)
  }

  async sendMessage(socket: Socket, room: string, content: string) {
    const userEntity = await User.find(this.userId)
    if (!userEntity) return

    const message = await Message.create({
      content,
      senderId: userEntity.id,
    })

    const messageResponse = {
      content: message.content,
      createdAt: message.createdAt.toISO(),
      sender: {
        username: userEntity.username,
        fullName: userEntity.fullName,
      },
    }

    socket.to(room).emit('newMessage', messageResponse)
    socket.emit('newMessage', messageResponse)
  }
}
