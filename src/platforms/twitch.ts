import 'dotenv/config'
import { connect } from 'ngrok'
import { app, port, startServer } from '../server.js'
import {
  channelId,
  getChatClient,
  getEventSubMiddleware,
} from '../clients/twitch.js'
import { rl } from '../cli.js'
import { handleMessage } from '../events/message.js'
import { handleFollow } from '../events/channel.js'

const tunnel = new URL(await connect(port))
const chat = getChatClient()
const events = getEventSubMiddleware(tunnel.hostname, '/twitch/events')
await chat.connect()
await events.apply(app)
await startServer()
await events.markAsReady()

chat.onMessage((_, user, message) => handleMessage(user, message))
events.subscribeToChannelFollowEvents(channelId, (e) =>
  handleFollow(e.userDisplayName)
)

rl.prompt()
