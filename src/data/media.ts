export interface MediaRequest {
  user: string
  videoId: string
}

export interface Media {
  queue: MediaRequest[]
  maxQueue: number
  maxUserRequests: number
  current: MediaRequest | undefined
}

export const media: Media = {
  queue: [],
  maxQueue: 100,
  maxUserRequests: 1,
  current: undefined,
}
