import { media } from '../data/media.js'
import { getChatClient } from '../clients/main.js'
import { getApiClient as getYoutubeApi } from '../clients/youtube.js'
import { socket } from '../server.js'

type CommandHandler = (user: string, args: string) => Promise<void>

interface Command {
  format: string
  cost: number
  example: string
  handler: CommandHandler
}

const commands: Record<string, Command> = {
  '!плейлист+': {
    format:
      '!плейлист+ (ссылка на ютуб видео) - добавить видео в очередь для воспроизведения',
    cost: 0,
    example: '!плейлист+ https://youtu.be/YlKXLGxMvw4',
    handler: async (user, args) => {
      const chat = getChatClient()
      if (media.queue.length >= media.maxQueue) {
        const error = `@${user}, плейлист переполнен 🤕`
        return chat.say(error)
      }
      const userRequests = media.queue.reduce(
        (acc, req) => (acc + req.user === user ? 1 : 0),
        0
      )
      if (userRequests >= media.maxUserRequests) {
        const error = `@${user}, можно заказать максимум ${media.maxUserRequests} видео 🤕`
        return chat.say(error)
      }
      const videoId = args.match(/(.*?)(^|\/|v=)([a-z0-9_-]{11})(.*)?/i)?.at(3)
      if (!videoId) {
        const error = `@${user}, непонятная ссылка 🤕`
        return chat.say(error)
      }
      const youtube = getYoutubeApi()
      const video = await youtube.videos
        .list({ id: [videoId], part: ['snippet', 'statistics'] })
        .then((r) => r.data.items?.at(0))
        .catch(console.error)
      if (!video) {
        const error = `@${user}, видео не найдено 🤕`
        return chat.say(error)
      }
      media.queue.push({ user, videoId })
      if (!media.current) {
        media.current = media.queue.shift()
        socket.emit('media/changed', media.current)
      }
      return chat.say(`@${user} добавил в плейлист "${video.snippet?.title}"`)
    },
  },
}

export function handleCommand(user: string, command: string): Promise<void> {
  const match = command.match(/(!\S+)\s*(.*)/)
  if (!match) return Promise.resolve()
  const name = match[1]
  const args = match[2]
  if (!commands[name]) return Promise.resolve()
  return commands[name].handler(user, args)
}
