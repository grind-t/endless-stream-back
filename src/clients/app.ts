import { env } from 'process'
import { getTwitchChat, getTwitchChannel } from './twitch.js'

export enum UserRole {
  Regular,
  Sub,
  Mod,
  Caster,
}

export interface User {
  id: string
  name: string
  role: UserRole
}

export interface Chat {
  say(message: string): Promise<void>
}

export interface Channel {
  id: string
  name: string
}

let chat: Chat | undefined
let channel: Channel | undefined
let caster: User | undefined

export function getChat(): Chat {
  if (chat) return chat
  const platform = env.PLATFORM
  if (platform === 'twitch') {
    const twitchChat = getTwitchChat()
    const twitchChannel = getTwitchChannel()
    chat = {
      say(message) {
        return twitchChat.say(twitchChannel.name, message)
      },
    }
  } else {
    chat = {
      say(message) {
        return Promise.resolve(console.log(message))
      },
    }
  }
  return chat
}

export function getChannel(): Channel {
  if (channel) return channel
  const platform = env.PLATFORM
  if (platform === 'twitch') {
    channel = getTwitchChannel()
  } else {
    channel = { id: 'admin', name: 'admin' }
  }
  return channel
}

export function getBroadcaster(): User {
  if (caster) return caster
  const channel = getChannel()
  caster = { id: channel.id, name: channel.name, role: UserRole.Caster }
  return caster
}
