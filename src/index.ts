import { app, socket, start } from './server.js'
import twitch from './clients/twitch.js'
import youtube from './clients/youtube.js'
import { createInterface } from 'readline'
import { media } from './data.js'

await twitch.chat.connect()
await twitch.events.apply(app)
await start()
await twitch.events.markAsReady()
twitch.chat.say(twitch.channel, 'чупапи муняня')

async function handleMessage(
  user: string,
  message: string,
  say: (message: string) => Promise<void>
) {
  if (message[0] != '!') return
  const [command, arg] = message.split(' ', 2)
  switch (command) {
    case '!плейлист+': {
      if (media.queue.length >= media.maxQueue) {
        const errorMessage = `@${user}, плейлист переполнен 🤕`
        say(errorMessage)
        return
      }
      const videoId = arg.match(/(.*?)(^|\/|v=)([a-z0-9_-]{11})(.*)?/i)?.at(3)
      if (!videoId) {
        const errorMessage = `@${user}, непонятная ссылка 🤕`
        say(errorMessage)
        return
      }
      const video = await youtube.videos
        .list({ id: [videoId], part: ['snippet', 'statistics'] })
        .then((r) => r.data.items?.at(0))
        .catch(console.error)
      if (!video) {
        const errorMessage = `@${user}, видео не найдено 🤕`
        say(errorMessage)
        return
      }
      media.queue.push({ user, videoId })
      if (!media.current) {
        media.current = media.queue.shift()
        socket.emit('media/changed', media.current)
      }
      const successMessage = `@${user} добавил в плейлист "${video.snippet?.title}"`
      say(successMessage)
      break
    }
  }
}

twitch.chat.onMessage((channel, user, message) =>
  handleMessage(user, message, (message) => twitch.chat.say(channel, message))
)

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
      await handleMessage('admin', message, (response) =>
        Promise.resolve(console.log(response))
      )
      break
    }
  }
  rl.prompt()
})

rl.prompt()
