import { EventList } from 'lib/event-list'
import { MediaShare } from 'lib/media-share'
import { Server } from 'socket.io'

export enum UserRole {
  Viewer,
  Subscriber,
  Moderator,
  Broadcaster,
}

export interface User {
  id: string
  name: string
  role: UserRole
}

export interface Chat {
  say(message: string): Promise<void>
}

export interface App {
  eventList: EventList
  mediaShare: MediaShare
  chat: Chat
  broadcaster: User
  io: Server
}
