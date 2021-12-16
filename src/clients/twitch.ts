import { readFileSync } from 'fs'
import { writeFile } from 'fs/promises'
import {
  RefreshingAuthProvider,
  ClientCredentialsAuthProvider,
} from '@twurple/auth'
import { ApiClient } from '@twurple/api'
import { ChatClient } from '@twurple/chat'
import { EventSubMiddleware } from '@twurple/eventsub'

const channelId = '149690942'
const channel = 'grind_t'
const tokenPath = 'data/twitch-token.json'
const clientId = process.env.TWITCH_CLIENT_ID as string
const clientSecret = process.env.TWITCH_CLIENT_SECRET as string
const eventSubSecret = process.env.TWITCH_EVENTSUB_SECRET as string

let userAuth: RefreshingAuthProvider | undefined
let appAuth: ClientCredentialsAuthProvider | undefined
let userApi: ApiClient | undefined
let appApi: ApiClient | undefined
let chat: ChatClient | undefined

function getUserAuth() {
  if (userAuth) return userAuth
  const token = JSON.parse(readFileSync(tokenPath, 'utf-8'))
  userAuth = new RefreshingAuthProvider(
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
  return userAuth
}

function getAppAuth() {
  if (appAuth) return appAuth
  appAuth = new ClientCredentialsAuthProvider(clientId, clientSecret)
  return appAuth
}

export function getTwitchApi(auth: 'user' | 'app'): ApiClient {
  if (auth === 'user') {
    if (userApi) return userApi
    userApi = new ApiClient({ authProvider: getUserAuth() })
    return userApi
  } else {
    if (appApi) return appApi
    appApi = new ApiClient({ authProvider: getAppAuth() })
    return appApi
  }
}

export function getTwitchChat(): ChatClient {
  if (chat) return chat
  chat = new ChatClient({
    authProvider: getUserAuth(),
    channels: [channel],
  })
  return chat
}

export function getTwitchChannel() {
  return { id: channelId, name: channel }
}

export function getTwitchEventsMiddleware(
  hostName: string,
  pathPrefix: string
): EventSubMiddleware {
  return new EventSubMiddleware({
    apiClient: getTwitchApi('app'),
    hostName: hostName,
    pathPrefix: pathPrefix,
    secret: eventSubSecret,
  })
}
