import { Socket } from 'socket.io'
import redis from '@adonisjs/redis/services/main'

export default class AuthSocketMiddleware {
  async handle(socket: Socket, next: (err?: Error) => void): Promise<void> {
    try {
      const cookie = socket.handshake.headers.cookie
      if (!cookie) {
        return next(new Error('Authentication error: No cookies found'))
      }

      const sessionCookie = cookie.split(';').find((c) => c.trim().startsWith('adonis-session='))

      if (!sessionCookie) {
        return next(new Error('Authentication error: No session cookie found'))
      }

      const encryptedSessionId = decodeURIComponent(sessionCookie.split('=')[1])

      const cleanCookie = encryptedSessionId.startsWith('s:')
        ? encryptedSessionId.slice(2)
        : encryptedSessionId

      const decoded = JSON.parse(Buffer.from(cleanCookie.split('.')[0], 'base64').toString('utf-8'))
      const sessionId = decoded.message || decoded

      const sessionKey = `${sessionId}`
      const sessionData = await redis.get(sessionKey)

      if (!sessionData) {
        return next(new Error('Authentication error: Session not found'))
      }

      const parsedSession = JSON.parse(sessionData)
      const sessionMessage = parsedSession.message

      if (!sessionMessage.auth_web) {
        return next(new Error('Authentication error: User not authenticated'))
      }

      socket.data.userId = Number(sessionMessage.auth_web)
      return next()
    } catch (error) {
      return next(new Error('Authentication error'))
    }
  }
}
