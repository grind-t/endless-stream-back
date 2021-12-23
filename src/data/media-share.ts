import { User } from '../clients/app.js'

export enum MediaType {
  Video,
  Playlist,
}

export interface Media {
  id: string
  title: string
  type: MediaType
}

export interface MediaRequest {
  user: User
  media: Media
}

export interface MediaShare {
  queue: MediaRequest[]
  maxQueue: number
  maxUserRequests: number
  votesToSkip: number
  skipVoters: Set<string>
  idleMedia: Media
}

export const mediaShare: MediaShare = {
  queue: [],
  maxQueue: 100,
  maxUserRequests: 1,
  votesToSkip: 2,
  skipVoters: new Set(),
  idleMedia: {
    id: 'StC5hQTgxUk',
    title: 'Мужик 10 часов ест чипсы и смотрит в камеру',
    type: MediaType.Video,
  },
}
