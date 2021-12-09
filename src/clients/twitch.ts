import { readFileSync } from 'fs'
import { writeFile } from 'fs/promises'
import {
  RefreshingAuthProvider,
  ClientCredentialsAuthProvider,
} from '@twurple/auth'
import { ApiClient } from '@twurple/api'
import { ChatClient } from '@twurple/chat'
import { EventSubMiddleware } from '@twurple/eventsub'
import { tunnel } from '../server.js'

const userId = '149690942'
const userName = 'grind_t'
const clientId = process.env.TWITCH_CLIENT_ID as string
const clientSecret = process.env.TWITCH_CLIENT_SECRET as string
const token = JSON.parse(readFileSync('data/twitch-token.json', 'utf-8'))
const userAuthProvider = new RefreshingAuthProvider(
  {
    clientId,
    clientSecret,
    onRefresh: (token) => {
      const json = JSON.stringify(token, null, 2)
      writeFile('data/twitch-token.json', json).catch(console.error)
    },
  },
  token
)
const appAuthProvider = new ClientCredentialsAuthProvider(
  clientId,
  clientSecret
)
const apiClient = new ApiClient({ authProvider: userAuthProvider })
const chatClient = new ChatClient({
  authProvider: userAuthProvider,
  channels: [userName],
})
const middleware = new EventSubMiddleware({
  apiClient: new ApiClient({ authProvider: appAuthProvider }),
  hostName: tunnel.hostname,
  pathPrefix: '/twitch/events',
  secret: process.env.TWITCH_EVENTSUB_SECRET as string,
})

const twitch = {
  channelId: userId,
  channel: userName,
  api: apiClient,
  chat: chatClient,
  events: middleware,
}

export default twitch
