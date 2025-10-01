import { type User } from './user'

export interface Message {
  content: string
  createdAt: string
  sender: User
}
