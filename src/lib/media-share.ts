import { User } from 'apps/generic'

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

export class MediaShare {
  public queue: MediaRequest[]
  public skipVoters: Set<string>
  public idleMedia: Media

  constructor(
    public queueLimit: number,
    public maxRequestsPerUser: number,
    public minVotesToSkip: number
  ) {
    this.queue = []
    this.skipVoters = new Set()
    this.idleMedia = {
      id: 'StC5hQTgxUk',
      title: 'Мужик 10 часов ест чипсы и смотрит в камеру',
      type: MediaType.Video,
    }
  }
}
