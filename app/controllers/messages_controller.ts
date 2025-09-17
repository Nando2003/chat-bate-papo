import Message from '#models/message'
import type { HttpContext } from '@adonisjs/core/http'
import { DateTime } from 'luxon'

interface MessageResponse {
  content: string
  createdAt: DateTime
  sender: {
    fullName: string
    username: string
  }
}

export default class MessagesController {
  async index(ctx: HttpContext) {
    const messages = await Message.query().preload('sender').orderBy('createdAt', 'desc').limit(50)

    const response: MessageResponse[] = messages.map((message) => ({
      content: message.content,
      createdAt: message.createdAt,
      sender: {
        fullName: message.sender.fullName,
        username: message.sender.username,
      },
    }))

    return ctx.response.ok({
      data: response.reverse(),
      hasMore: messages.length === 50,
    })
  }

  async loadMore(ctx: HttpContext) {
    const lastMessageCreatedAt = ctx.request.input('lastMessageId')
    const limit = ctx.request.input('limit', 20)

    const query = Message.query().preload('sender').orderBy('created_at', 'desc').limit(limit)

    if (lastMessageCreatedAt) {
      const lastDateTime = DateTime.fromISO(lastMessageCreatedAt)

      if (lastDateTime.isValid) {
        query.where('createdAt', '<', lastDateTime.toJSDate())
      }
    }

    const messages = await query

    const response: MessageResponse[] = messages.map((message) => ({
      content: message.content,
      createdAt: message.createdAt,
      sender: {
        fullName: message.sender.fullName,
        username: message.sender.username,
      },
    }))

    return ctx.response.ok({
      data: response,
      hasMore: messages.length === limit,
    })
  }
}
