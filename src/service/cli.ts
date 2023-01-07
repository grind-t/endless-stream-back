import { createInterface, Interface } from 'readline'
import { handleMessage } from 'events/chat'
import { handleFollow } from 'events/channel'
import { generateCommandsMarkup } from 'lib/utils'
import { App } from 'apps/generic'

export function getCLI(app: App): Interface {
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
        await handleMessage(app, app.broadcaster, message)
        break
      }
      case 'event.follow':
        handleFollow(app, 'admin')
        break
      case 'app.mediaShare':
        console.log(app.mediaShare)
        break
      case 'app.eventList':
        console.log(app.eventList)
        break
      case 'commands.markup':
        console.log(generateCommandsMarkup())
        break
    }
    rl.prompt()
  })

  return rl
}
