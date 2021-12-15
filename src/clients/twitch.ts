import { readFileSync } from 'fs'
import { writeFile } from 'fs/promises'
import {
  RefreshingAuthProvider,
  ClientCredentialsAuthProvider,
} from '@twurple/auth'
import { ApiClient } from '@twurple/api'
import { ChatClient } from '@twurple/chat'
import { EventSubMiddleware } from '@twurple/eventsub'

export const channelId = '149690942'
export const channel = 'grind_t'
const tokenPath = 'data/twitch-token.json'
const clientId = process.env.TWITCH_CLIENT_ID as string
const clientSecret = process.env.TWITCH_CLIENT_SECRET as string
const eventSubSecret = process.env.TWITCH_EVENTSUB_SECRET as string

let userAuthProvider: RefreshingAuthProvider | undefined
let appAuthProvider: ClientCredentialsAuthProvider | undefined
let userApiClient: ApiClient | undefined
let appApiClient: ApiClient | undefined
let chatClient: ChatClient | undefined

function getUserAuthProvider() {
  if (userAuthProvider) return userAuthProvider
  const token = JSON.parse(readFileSync(tokenPath, 'utf-8'))
  userAuthProvider = new RefreshingAuthProvider(
    {
      clientId,
      clientSecret,
      onRefresh: (token) => {
        const json = JSON.stringify(token, null, 2)
        writeFile(tokenPath, json).catch(console.error)
      },
    },
    token
  )
  return userAuthProvider
}

function getAppAuthProvider() {
  if (appAuthProvider) return appAuthProvider
  appAuthProvider = new ClientCredentialsAuthProvider(clientId, clientSecret)
  return appAuthProvider
}

export function getUserApiClient(): ApiClient {
  if (userApiClient) return userApiClient
  userApiClient = new ApiClient({
    authProvider: getUserAuthProvider(),
  })
  return userApiClient
}

export function getAppApiClient(): ApiClient {
  if (appApiClient) return appApiClient
  appApiClient = new ApiClient({ authProvider: getAppAuthProvider() })
  return appApiClient
}

export function getChatClient(): ChatClient {
  if (chatClient) return chatClient
  chatClient = new ChatClient({
    authProvider: getUserAuthProvider(),
    channels: [channel],
  })
  return chatClient
}

export function getEventSubMiddleware(
  hostName: string,
  pathPrefix: string
): EventSubMiddleware {
  return new EventSubMiddleware({
    apiClient: getAppApiClient(),
    hostName: hostName,
    pathPrefix: pathPrefix,
    secret: eventSubSecret,
  })
}
