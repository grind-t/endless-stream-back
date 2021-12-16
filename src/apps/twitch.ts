import 'dotenv/config'
import { env } from 'process'
import { getApp, getIO, startServer } from '../server.js'
import { getCLI } from '../cli.js'
import express from 'express'
import { connect } from 'ngrok'
import {
  getTwitchApi,
  getTwitchChat,
  getTwitchChannel,
  getTwitchEventsMiddleware,
} from '../clients/twitch.js'
import { handleConnection } from '../events/socket.js'
import { handleMessage } from '../events/chat.js'
import { handleFollow } from '../events/channel.js'

env.PLATFORM = 'twitch'

const app = getApp()
const io = getIO()
const cli = getCLI()
const port = 80
const tunnel = new URL(await connect(port))
const assetsPath = process.argv.at(2)
const api = getTwitchApi('app')
const chat = getTwitchChat()
const channel = getTwitchChannel()
const events = getTwitchEventsMiddleware(tunnel.hostname, '/twitch/events')

if (assetsPath) app.use(express.static(assetsPath))

await api.eventSub.deleteAllSubscriptions()
await chat.connect()
await events.apply(app)
await startServer(port)
await events.markAsReady()

io.on('connection', handleConnection)
chat.onMessage((_, user, message) => handleMessage(user, message))
events.subscribeToChannelFollowEvents(channel.id, (e) =>
  handleFollow(e.userDisplayName)
)

cli.prompt()