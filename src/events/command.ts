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
      if (media.queue.length >= media.maxQueue)
        return chat.say(`@${user}, плейлист переполнен 🤕`)
      const userRequests = media.queue.reduce(
        (acc, req) => (acc + req.user === user ? 1 : 0),
        0
      )
      if (userRequests > 0)
        return chat.say(`@${user}, можно заказать максимум 1 видео 🤕`)
      const videoId = args.match(/(.*?)(^|\/|v=)([a-z0-9_-]{11})(.*)?/i)?.at(3)
      if (!videoId) return chat.say(`@${user}, непонятная ссылка 🤕`)
      const youtube = getYoutubeApi()
      const video = await youtube.videos
        .list({ id: [videoId], part: ['snippet', 'statistics'] })
        .then((r) => r.data.items?.at(0))
        .catch(console.error)
      if (!video) return chat.say(`@${user}, видео не найдено 🤕`)
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
