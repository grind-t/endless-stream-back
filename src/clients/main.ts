import {
  channel as twitchChannel,
  getChatClient as getTwitchChatClient,
} from './twitch.js'

export interface ChatClient {
  say(message: string): Promise<void>
}

const platform = process.argv[2]
let chatClient: ChatClient | undefined

export function getChatClient(): ChatClient {
  if (chatClient) return chatClient
  if (platform === 'twitch') {
    const client = getTwitchChatClient()
    chatClient = {
      say: (message) => client.say(twitchChannel, message),
    }
  } else {
    chatClient = {
      say: (message) => Promise.resolve(console.log(message)),
    }
  }
  return chatClient
}
