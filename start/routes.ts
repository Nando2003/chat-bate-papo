import router from '@adonisjs/core/services/router'
import { middleware } from './kernel.js'

router.get('/', async ({ response }) => response.redirect().toRoute('chat.show'))

router.get('/chat', '#controllers/chats_controller.showChat').as('chat.show').use(middleware.auth())

router
  .get('/login', '#controllers/auth_controller.showLogin')
  .as('login.show')
  .use(middleware.guest())
router.post('/login', '#controllers/auth_controller.login').as('login').use(middleware.guest())

router
  .get('/register', '#controllers/auth_controller.showRegister')
  .as('register.show')
  .use(middleware.guest())
router
  .post('/register', '#controllers/auth_controller.register')
  .as('register')
  .use(middleware.guest())

router.post('/logout', '#controllers/auth_controller.logout').as('logout').use(middleware.auth())

router
  .get('/messages', '#controllers/messages_controller.index')
  .as('messages.index')
  .use(middleware.auth())

router
  .get('/messages/load-more', '#controllers/messages_controller.loadMore')
  .as('messages.loadMore')
  .use(middleware.auth())
