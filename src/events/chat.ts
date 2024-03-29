import { Media, MediaType } from 'lib/media-share'
import { getYoutubeApi } from 'service/youtube'
import { findLastIndex } from 'lib/utils'
import { handleMediaEnd } from './media'
import { App, User, UserRole } from 'apps/generic'

export type CommandHandler = (
  app: App,
  user: User,
  args: string
) => Promise<void>

export interface Command {
  arguments?: string[]
  description: string
  cost: number
  role: UserRole
  example: string
  handler: CommandHandler
}

export const commands: Record<string, Command> = {
  '!медиа+': {
    arguments: ['ссылка на ютуб видео или плейлист'],
    description: 'заказать видео или плейлист',
    cost: 0,
    role: UserRole.Viewer,
    example: '!медиа+ https://youtu.be/YlKXLGxMvw4',
    async handler({ mediaShare, chat, io }, user, args) {
      if (mediaShare.queue.length >= mediaShare.queueLimit) {
        const error = `@${user.name}, очередь переполнена 🤕`
        return chat.say(error)
      }
      const userRequests = mediaShare.queue.reduce(
        (acc, req) => (req.user.id === user.id ? acc + 1 : acc),
        0
      )
      if (userRequests >= mediaShare.maxRequestsPerUser) {
        const error = `@${user.name}, превышен лимит заказов (${mediaShare.maxRequestsPerUser}) 🤕`
        return chat.say(error)
      }
      let mediaId: string | null | undefined
      let mediaType: MediaType
      try {
        const url = new URL(args)
        const lastSegment = url.pathname.split('/').at(-1)
        if (lastSegment === 'playlist') {
          mediaId = url.searchParams.get('list')
          mediaType = MediaType.Playlist
        } else {
          mediaId = url.searchParams.get('v') || lastSegment
          mediaType = MediaType.Video
        }
      } catch {
        mediaId = args
        mediaType = mediaId.length === 11 ? MediaType.Video : MediaType.Playlist
      }
      if (!mediaId) {
        const error = `@${user.name}, непонятная ссылка 🤕`
        return chat.say(error)
      }
      let media: Media | undefined
      const youtube = getYoutubeApi()
      if (mediaType === MediaType.Video) {
        const video = await youtube.videos
          .list({ id: [mediaId], part: ['snippet'] })
          .then((r) => r.data.items?.at(0))
          .catch(console.error)
        if (video && video.snippet) {
          const mediaTitle = video.snippet.title || ''
          media = { id: mediaId, title: mediaTitle, type: mediaType }
        }
      } else {
        const playlist = await youtube.playlists
          .list({ id: [mediaId], part: ['snippet'] })
          .then((r) => r.data.items?.at(0))
          .catch(console.error)
        if (playlist && playlist.snippet) {
          const mediaTitle = playlist.snippet.title || ''
          media = { id: mediaId, title: mediaTitle, type: mediaType }
        }
      }
      if (!media) {
        const error = `@${user.name}, видео или плейлист не найден 🤕`
        return chat.say(error)
      }
      const req = { user, media }
      const newLen = mediaShare.queue.push(req)
      if (newLen === 1) io.emit('media/changed', media)
      const success = `@${user.name} добавил в очередь "${media.title}"`
      return chat.say(success)
    },
  },
  '!медиа-': {
    description: 'удалить свой последний заказ',
    cost: 0,
    role: UserRole.Viewer,
    example: '!медиа-',
    async handler(app, user) {
      const { mediaShare, chat } = app
      const { queue } = mediaShare
      const reqIdx = findLastIndex(queue, (req) => req.user.id === user.id)
      if (reqIdx === -1) {
        const error = `@${user.name}, в очереди нет твоих заказов 🤕`
        return chat.say(error)
      }
      const media = queue[reqIdx].media
      if (reqIdx === 0) handleMediaEnd(app)
      else queue.splice(reqIdx, 1)
      const success = `@${user.name} удалил из очереди "${media.title}"`
      return chat.say(success)
    },
  },
  '!медиа': {
    description: 'узнать название текущего видео или плейлиста',
    cost: 0,
    role: UserRole.Viewer,
    example: '!медиа',
    async handler({ mediaShare, chat }) {
      if (!mediaShare.queue.length) {
        const error = `Сейчас ничего не проигрывается 🤕`
        return chat.say(error)
      }
      const media = mediaShare.queue[0].media
      const success = `Сейчас проигрывается "${media.title}"`
      return chat.say(success)
    },
  },
  '!скип': {
    description: 'проголосовать за пропуск текущего видео или плейлиста',
    cost: 0,
    role: UserRole.Viewer,
    example: '!скип',
    async handler(app, user) {
      const { mediaShare, chat } = app
      if (!mediaShare.queue.length) {
        const error = `Сейчас ничего не проигрывается 🤕`
        return chat.say(error)
      }
      const media = mediaShare.queue[0].media
      mediaShare.skipVoters.add(user.id)
      if (mediaShare.skipVoters.size >= mediaShare.minVotesToSkip) {
        handleMediaEnd(app)
        const success = `"${media.title}" пропущено`
        return chat.say(success)
      }
      const remaining = mediaShare.minVotesToSkip - mediaShare.skipVoters.size
      const success = `@${user.name} проголосовал за пропуск "${media.title}" (голосов до пропуска: ${remaining})`
      return chat.say(success)
    },
  },
  '!вето': {
    description: 'пропустить текущее видео или плейлист',
    cost: 0,
    role: UserRole.Moderator,
    example: '!вето',
    async handler(app, user) {
      const { mediaShare, chat } = app
      if (!mediaShare.queue.length || user.role < this.role) return
      const media = mediaShare.queue[0].media
      handleMediaEnd(app)
      const success = `"${media.title}" пропущено`
      return chat.say(success)
    },
  },
  '!шары': {
    description: 'задать вопрос магическим шарам',
    cost: 0,
    role: UserRole.Viewer,
    example: '!шары Дядя Богдан существует?',
    async handler({ chat }, user) {
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
  '!команды': {
    description: 'узнать, где можно найти список всех команд',
    cost: 0,
    role: UserRole.Viewer,
    example: '!команды',
    async handler({ chat }) {
      const m = 'Список всех команд находится в описании стрима'
      return chat.say(m)
    },
  },
}

export function handleCommand(
  app: App,
  user: User,
  command: string
): Promise<void> {
  const match = command.match(/(!\S+)\s*(.*)/)
  if (!match) return Promise.resolve()
  const name = match[1]
  const args = match[2]
  if (!commands[name]) return Promise.resolve()
  return commands[name].handler(app, user, args)
}

export function handleMessage(
  app: App,
  user: User,
  message: string
): Promise<void> {
  if (message[0] === '!') return handleCommand(app, user, message)
  return Promise.resolve()
}

export function handleJoin(user: string): Promise<void> {
  //const chat = getChat()
  //const m = `@${user}, привет, команды для управления стримом можно найти в описании`
  //return chat.say(m)
  return Promise.resolve()
}
