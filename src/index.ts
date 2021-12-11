import 'dotenv/config'
import { createInterface } from 'readline'
import {
  getChatClient as getTwitchChatClient,
  getEventSubMiddleware as getTwitchEventSubMiddleware,
} from './clients/twitch.js'
import { app, getTunnel, start } from './server.js'
import { handleMessage } from './events/message.js'

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
}

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
  }
  rl.prompt()
})

rl.prompt()
