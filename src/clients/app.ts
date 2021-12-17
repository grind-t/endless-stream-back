import { env } from 'process'
import { getTwitchChat, getTwitchChannel } from './twitch.js'

export interface Chat {
  say(message: string): Promise<void>
}

let chat: Chat | undefined

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
