import type { HttpContext } from '@adonisjs/core/http'

export default class ChatsController {
  async showChat({ inertia }: HttpContext) {
    return inertia.render('chat/index')
  }
}
