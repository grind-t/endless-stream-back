import { getIdGenerator } from 'lib/utils'

export enum EventType {
  Follow,
  Sub,
  Donation,
}

export interface EventListItem {
  id: number
  user: string
  event: EventType
  payload?: string
}

export const getEventId = getIdGenerator()

export class EventList {
  items: EventListItem[]
  limit: number

  constructor(limit: number) {
    this.items = []
    this.limit = limit
  }
}
