import vine from '@vinejs/vine'

export const registerValidator = vine.compile(
  vine.object({
    fullName: vine.string().minLength(3).maxLength(255),
    username: vine
      .string()
      .minLength(3)
      .maxLength(180)
      .regex(/^[a-z0-9._-]+$/)
      .unique({ table: 'users', column: 'username' }),
    email: vine.string().email().maxLength(255).unique({ table: 'users', column: 'email' }),
    password: vine.string().minLength(6).maxLength(180),
    confirmPassword: vine.string().minLength(6).maxLength(180).sameAs('password'),
  })
)
