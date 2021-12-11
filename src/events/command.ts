import { media } from '../data/media.js'
import { getChatClient } from '../clients/main.js'
import { getApiClient as getYoutubeApi } from '../clients/youtube.js'
import { socket } from '../server.js'
import { findLastIndex } from '../utils.js'

type CommandHandler = (user: string, args: string) => Promise<void>

interface Command {
  format: string
  cost: number
  example: string
  handler: CommandHandler
}

const commands: Record<string, Command> = {
  '!плейлист+': {
    format: '!плейлист+ (ссылка на ютуб видео) - добавить видео в плейлист',
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
      const videoTitle = video.snippet?.title || ''
      const req = { user, videoId, videoTitle }
      media.queue.push(req)
      if (!media.current) {
        media.current = media.queue.shift()
        socket.emit('media/changed', media.current)
      }
      const success = `@${user} добавил в плейлист "${req.videoTitle}"`
      return chat.say(success)
    },
  },
  '!плейлист-': {
    format: '!плейлист- - удалить твое последнее видео из плейлиста',
    cost: 0,
    example: '!плейлист-',
    handler: async (user) => {
      const chat = getChatClient()
      const reqIdx = findLastIndex(media.queue, (req) => req.user === user)
      if (reqIdx !== -1) {
        const req = media.queue.splice(reqIdx, 1)[0]
        const success = `@${user} удалил из плейлиста "${req.videoTitle}"`
        return chat.say(success)
      }
      if (media.current && media.current.user === user) {
        const req = media.current
        media.current = media.queue.shift()
        socket.emit('media/changed', media.current)
        const success = `@${user} удалил из плейлиста "${req.videoTitle}"`
        return chat.say(success)
      }
      const error = `@${user}, в плейлисте нет твоих видео 🤕`
      return chat.say(error)
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
