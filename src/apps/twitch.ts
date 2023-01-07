import 'dotenv/config'
import express from 'express'
import { connect } from 'ngrok'
import {
  getTwitchApi,
  getTwitchChat,
  getTwitchEventsMiddleware,
  getTwitchAppAuth,
  getTwitchChannelAuth,
  twitchChannel,
} from 'service/twitch'
import { handleConnection } from 'events/socket'
import { handleJoin, handleMessage } from 'events/chat'
import { handleFollow } from 'events/channel'
import { createServer } from 'http'
import { Server } from 'socket.io'
import { App, User, UserRole } from 'apps/generic'
import { EventList } from 'lib/event-list'
import { MediaShare } from 'lib/media-share'
import { getCLI } from 'service/cli'

const port = 80

const expressApp = express()
const server = createServer(expressApp)
const io = new Server(server)
const tunnel = new URL(await connect(port))
const twitchChannelAuth = await getTwitchChannelAuth()
const twitchAppAuth = getTwitchAppAuth()
const twitchChat = getTwitchChat(twitchChannelAuth)
const twitchApi = getTwitchApi(twitchAppAuth)
const twitchEvents = getTwitchEventsMiddleware(
  twitchApi,
  tunnel.hostname,
  '/twitch/events'
)
const app = {
  broadcaster: {
    id: twitchChannel.id,
    name: twitchChannel.name,
    role: UserRole.Broadcaster,
  },
  eventList: new EventList(3),
  mediaShare: new MediaShare(100, 1, 2),
  chat: {
    say: (message) => twitchChat.say(twitchChannel.name, message),
  },
  io,
} satisfies App
const cli = getCLI(app)

await twitchApi.eventSub.deleteAllSubscriptions()
await twitchChat.connect()
await twitchEvents.apply(expressApp)
await new Promise((resolve) => server.listen(port, <() => void>resolve))
await twitchEvents.markAsReady()

io.on('connection', (socket) => handleConnection(app, socket))

twitchChat.onMessage((_channel, userName, message, { userInfo }) => {
  const user: User = {
    id: userInfo.userId,
    name: userName,
    role:
      (userInfo.isBroadcaster && UserRole.Broadcaster) ||
      (userInfo.isMod && UserRole.Moderator) ||
      (userInfo.isSubscriber && UserRole.Subscriber) ||
      UserRole.Viewer,
  }
  handleMessage(app, user, message)
})

twitchChat.onJoin((_, user) => {
  if (user === twitchChannel.name) return
  console.log(user)
  handleJoin(user)
})

twitchEvents.subscribeToChannelFollowEvents(twitchChannel.id, (e) =>
  handleFollow(app, e.userDisplayName)
)

cli.prompt()
