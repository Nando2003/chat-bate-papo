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
    const page = 1
    const limit = ctx.request.input('limit', 10)

    const paginatedResult = await Message.query()
      .preload('sender')
      .orderBy('createdAt', 'desc')
      .paginate(page, limit)

    const paginatedMessages = paginatedResult.all()

    const response: MessageResponse[] = paginatedMessages.map((message: Message) => ({
      content: message.content,
      createdAt: message.createdAt,
      sender: {
        fullName: message.sender.fullName,
        username: message.sender.username,
      },
    }))

    return ctx.response.ok({
      data: response.reverse(),
      hasMore: paginatedResult.total > limit,
    })
  }

  async loadMore(ctx: HttpContext) {
    const lastMessageCreatedAt = ctx.request.input('lastMessageId')
    const page = 1
    const limit = ctx.request.input('limit', 10)

    const query = Message.query()
      .preload('sender')
      .orderBy('createdAt', 'desc')
      .orderBy('id', 'desc')

    if (lastMessageCreatedAt) {
      const lastDateTime = DateTime.fromISO(lastMessageCreatedAt)

      if (lastDateTime.isValid) {
        query.where('createdAt', '<', lastDateTime.toJSDate())
      }
    }

    const paginatedQuery = query.paginate(page, limit)
    const paginatedResult = await paginatedQuery
    const paginatedMessages = paginatedResult.all()

    const response: MessageResponse[] = paginatedMessages.map((message: Message) => ({
      content: message.content,
      createdAt: message.createdAt,
      sender: {
        fullName: message.sender.fullName,
        username: message.sender.username,
      },
    }))

    return ctx.response.ok({
      data: response,
      hasMore: paginatedResult.total > limit,
    })
  }
}
