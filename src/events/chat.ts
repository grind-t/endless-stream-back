import { media } from '../data/media.js'
import { User, getChat, UserRole } from '../clients/app.js'
import { getYoutubeApi } from '../clients/youtube.js'
import { getIO } from '../server.js'
import { findLastIndex } from '../utils.js'
import { handleMediaEnd } from './media.js'

export type CommandHandler = (user: User, args: string) => Promise<void>

export interface Command {
  arguments?: string[]
  description: string
  cost: number
  role: UserRole
  example: string
  handler: CommandHandler
}

export const commands: Record<string, Command> = {
  '!плейлист+': {
    arguments: ['ссылка на ютуб видео'],
    description: 'добавить видео в плейлист',
    cost: 0,
    role: UserRole.Viewer,
    example: '!плейлист+ https://youtu.be/YlKXLGxMvw4',
    async handler(user, args) {
      const io = getIO()
      const chat = getChat()
      if (media.queue.length >= media.maxQueue) {
        const error = `@${user.name}, плейлист переполнен 🤕`
        return chat.say(error)
      }
      const userRequests = media.queue.reduce(
        (acc, req) => (req.user.id === user.id ? acc + 1 : acc),
        0
      )
      if (userRequests >= media.maxUserRequests) {
        const error = `@${user.name}, можно заказать максимум ${media.maxUserRequests} видео 🤕`
        return chat.say(error)
      }
      const videoId = args.match(/(.*?)(^|\/|v=)([a-z0-9_-]{11})(.*)?/i)?.at(3)
      if (!videoId) {
        const error = `@${user.name}, непонятная ссылка 🤕`
        return chat.say(error)
      }
      const youtube = getYoutubeApi()
      const video = await youtube.videos
        .list({ id: [videoId], part: ['snippet', 'statistics'] })
        .then((r) => r.data.items?.at(0))
        .catch(console.error)
      if (!video) {
        const error = `@${user.name}, видео не найдено 🤕`
        return chat.say(error)
      }
      const videoTitle = video.snippet?.title || ''
      const req = { user, videoId, videoTitle }
      media.queue.push(req)
      if (!media.current || media.idlePlaylist.includes(media.current)) {
        media.current = media.queue.shift()
        io.emit('media/changed', media.current)
      }
      const success = `@${user.name} добавил в плейлист "${req.videoTitle}"`
      return chat.say(success)
    },
  },
  '!плейлист-': {
    description: 'удалить твое последнее видео из плейлиста',
    cost: 0,
    role: UserRole.Viewer,
    example: '!плейлист-',
    async handler(user) {
      const chat = getChat()
      const reqIdx = findLastIndex(
        media.queue,
        (req) => req.user.id === user.id
      )
      if (reqIdx !== -1) {
        const req = media.queue.splice(reqIdx, 1)[0]
        const success = `@${user.name} удалил из плейлиста "${req.videoTitle}"`
        return chat.say(success)
      }
      if (media.current && media.current.user.id === user.id) {
        const success = `@${user.name} удалил из плейлиста "${media.current.videoTitle}"`
        handleMediaEnd()
        return chat.say(success)
      }
      const error = `@${user.name}, в плейлисте нет твоих видео 🤕`
      return chat.say(error)
    },
  },
  '!скип': {
    description: 'проголосовать за пропуск видео',
    cost: 0,
    role: UserRole.Viewer,
    example: '!скип',
    async handler(user) {
      const chat = getChat()
      if (!media.current) return
      media.skipVoters.add(user.id)
      let success
      if (media.skipVoters.size === media.votesToSkip) {
        success = `"${media.current.videoTitle}" пропущено`
        media.skipVoters.clear()
        handleMediaEnd()
      } else {
        const remaining = media.votesToSkip - media.skipVoters.size
        success = `@${user.name} проголосовал за пропуск видео (голосов до пропуска: ${remaining})`
      }
      return chat.say(success)
    },
  },
  '!вето': {
    description: 'пропустить видео',
    cost: 0,
    role: UserRole.Moderator,
    example: '!вето',
    async handler(user) {
      if (!media.current || user.role < this.role) return
      const chat = getChat()
      const success = `"${media.current.videoTitle}" пропущено`
      handleMediaEnd()
      return chat.say(success)
    },
  },
  '!видео': {
    description: 'узнать название видео',
    cost: 0,
    role: UserRole.Viewer,
    example: '!видео',
    async handler() {
      const chat = getChat()
      if (!media.current) {
        const error = `Сейчас ничего не проигрывается 🤕`
        return chat.say(error)
      }
      const success = `Сейчас проигрывается "${media.current.videoTitle}"`
      return chat.say(success)
    },
  },
  '!8шар': {
    description: 'задать вопрос магическому шару',
    cost: 0,
    role: UserRole.Viewer,
    example: '!8шар Богдан существует?',
    async handler(user) {
      const chat = getChat()
      const replies = [
        'Бесспорно',
        'Это предрешено',
        'Без сомнения',
        'Определенно да',
        'Можешь быть уверен в этом',
        'Мне кажется - да',
        'Вероятнее всего',
        'Перспективы хорошие',
        'Знаки указывают на положительный ответ',
        'Да',
        'Ответ затуманен, попробуй еще раз',
        'Спроси позже',
        'Лучше тебе не рассказывать',
        'Сейчас нельзя предсказать',
        'Сконцентрируйся и спроси снова',
        'Даже не думай',
        'Мой ответ - нет',
        'По моим источникам - нет',
        'Перспективы не очень хорошие',
        'Очень сомнительно',
      ]
      const reply = replies[Math.floor(Math.random() * replies.length)]
      return chat.say(`@${user.name}, ${reply}`)
    },
  },
}

export function handleCommand(user: User, command: string): Promise<void> {
  const match = command.match(/(!\S+)\s*(.*)/)
  if (!match) return Promise.resolve()
  const name = match[1]
  const args = match[2]
  if (!commands[name]) return Promise.resolve()
  return commands[name].handler(user, args)
}

export function handleMessage(user: User, message: string): Promise<void> {
  if (message[0] === '!') return handleCommand(user, message)
  return Promise.resolve()
}

export function handleJoin(user: string): Promise<void> {
  const chat = getChat()
  const m = `@${user}, привет, команды для управления стримом можно найти в описании`
  return chat.say(m)
}
