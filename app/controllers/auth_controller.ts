import User from '#models/user'
import { loginValidator } from '#validators/login'
import { registerValidator } from '#validators/register'
import type { HttpContext } from '@adonisjs/core/http'
import hash from '@adonisjs/core/services/hash'

export default class AuthController {
  async showRegister({ inertia }: HttpContext) {
    return inertia.render('auth/register')
  }

  async showLogin({ inertia }: HttpContext) {
    return inertia.render('auth/login')
  }

  async register(ctx: HttpContext) {
    const payload = await ctx.request.validateUsing(registerValidator)

    await User.create({
      fullName: payload.fullName,
      username: payload.username,
      email: payload.email,
      password: payload.password,
    })

    ctx.session.flash('success', 'User created successfully!')
    return ctx.response.redirect().toRoute('login.show')
  }

  async login(ctx: HttpContext) {
    const payload = await ctx.request.validateUsing(loginValidator)

    const user = payload.registration.includes('@')
      ? await User.findBy('email', payload.registration)
      : await User.findBy('username', payload.registration)

    if (!user) {
      ctx.session.flash('error', 'Invalid username/email or password')
      return ctx.response.redirect().back()
    }

    if (!(await hash.verify(user.password, payload.password))) {
      ctx.session.flash('error', 'Invalid username/email or password')
      return ctx.response.redirect().back()
    }

    await ctx.auth.use('web').login(user)
    ctx.session.flash('success', 'Logged in successfully!')
    return ctx.response.redirect().toRoute('chat.show')
  }

  async logout(ctx: HttpContext) {
    await ctx.auth.use('web').logout()
    ctx.session.flash('success', 'Logged out successfully!')
    return ctx.response.redirect().toRoute('login.show')
  }
}
