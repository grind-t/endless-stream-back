import 'dotenv/config'
import { createInterface } from 'readline'
import {
  channelId as twitchChannelId,
  getChatClient as getTwitchChatClient,
  getEventSubMiddleware as getTwitchEventSubMiddleware,
} from './clients/twitch.js'
import { app, getTunnel, socket, start } from './server.js'
import { handleMessage } from './events/message.js'
import { media } from './data/media.js'
import { generateCommandsMarkup } from './utils.js'
import { handleMediaEnd } from './events/media.js'
import { handleFollow } from './events/channel.js'
import { eventList } from './data/event-list.js'

const platform = process.argv[2]

if (platform === 'twitch') {
  const tunnel = await getTunnel()
  const chat = getTwitchChatClient()
  const events = getTwitchEventSubMiddleware(tunnel.hostname, '/twitch/events')
  await chat.connect()
  await events.apply(app)
  await start()
  await events.markAsReady()

  chat.onMessage((_, user, message) => handleMessage(user, message))
  events.subscribeToChannelFollowEvents(twitchChannelId, (e) =>
    handleFollow(e.userDisplayName)
  )
} else await start()

socket.on('connection', (socket) => {
  socket.on('media/ended', handleMediaEnd)
})

const rl = createInterface({
  input: process.stdin,
  output: process.stdout,
})

rl.on('line', async (line) => {
  const match = line.trim().match(/(\S+)\s*(.*)/)
  if (!match) return
  const command = match[1]
  const args = match[2]
  switch (command) {
    case 'event.message': {
      const message = args
      await handleMessage('admin', message)
      break
    }
    case 'event.follow':
      handleFollow('admin')
      break
    case 'media.queue':
      console.log(media.queue)
      break
    case 'media.current':
      console.log(media.current)
      break
    case 'eventList.items':
      console.log(eventList.items)
      break
    case 'commands.markup':
      console.log(generateCommandsMarkup())
      break
  }
  rl.prompt()
})

rl.prompt()
