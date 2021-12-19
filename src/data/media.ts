export interface MediaRequest {
  user: string
  videoId: string
  videoTitle: string
}

export interface Media {
  queue: MediaRequest[]
  maxQueue: number
  maxUserRequests: number
  current: MediaRequest | undefined
  votesToSkip: number
  skipVoters: Set<string>
  idle: MediaRequest
}

export const media: Media = {
  queue: [],
  maxQueue: 100,
  maxUserRequests: 1,
  current: undefined,
  votesToSkip: 2,
  skipVoters: new Set(),
  idle: {
    user: '',
    videoId: 'StC5hQTgxUk',
    videoTitle: 'Ожидание команды',
  },
}
