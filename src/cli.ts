import { createInterface, Interface } from 'readline'
import { handleMessage } from './events/chat.js'
import { handleFollow } from './events/channel.js'
import { mediaShare } from './data/media-share.js'
import { eventList } from './data/event-list.js'
import { generateCommandsMarkup } from './utils.js'
import { getBroadcaster } from './clients/app.js'

export function getCLI(): Interface {
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
        await handleMessage(getBroadcaster(), message)
        break
      }
      case 'event.follow':
        handleFollow('admin')
        break
      case 'mediaShare.queue':
        console.log(mediaShare.queue)
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

  return rl
}
