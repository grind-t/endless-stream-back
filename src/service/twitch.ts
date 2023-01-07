import { readFile, writeFile } from 'fs/promises'
import {
  RefreshingAuthProvider,
  ClientCredentialsAuthProvider,
  AuthProvider,
} from '@twurple/auth'
import { ApiClient } from '@twurple/api'
import { ChatClient } from '@twurple/chat'
import { EventSubMiddleware } from '@twurple/eventsub'

export const twitchChannel = {
  id: '149690942',
  name: 'grind_t',
  tokenPath: 'apps/twitch-token.json',
} as const

export async function getTwitchChannelAuth(): Promise<RefreshingAuthProvider> {
  const token = JSON.parse(await readFile(twitchChannel.tokenPath, 'utf-8'))
  return new RefreshingAuthProvider(
    {
      clientId: import.meta.env.VITE_TWITCH_CLIENT_ID,
      clientSecret: import.meta.env.VITE_TWITCH_CLIENT_SECRET,
      onRefresh: (token) => {
        const json = JSON.stringify(token, null, 2)
        writeFile(twitchChannel.tokenPath, json).catch(console.error)
      },
    },
    token
  )
}

export function getTwitchAppAuth(): ClientCredentialsAuthProvider {
  return new ClientCredentialsAuthProvider(
    import.meta.env.VITE_TWITCH_CLIENT_ID,
    import.meta.env.VITE_TWITCH_CLIENT_SECRET
  )
}

export function getTwitchChat(authProvider: AuthProvider): ChatClient {
  return new ChatClient({
    authProvider,
    channels: [twitchChannel.name],
    requestMembershipEvents: true,
  })
}

export function getTwitchApi(authProvider: AuthProvider): ApiClient {
  return new ApiClient({ authProvider })
}

export function getTwitchEventsMiddleware(
  apiClient: ApiClient,
  hostName: string,
  pathPrefix: string
): EventSubMiddleware {
  return new EventSubMiddleware({
    apiClient,
    hostName,
    pathPrefix,
    secret: import.meta.env.VITE_TWITCH_EVENTSUB_SECRET,
  })
}
