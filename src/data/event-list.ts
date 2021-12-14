import { getIdGenerator } from '../utils.js'

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

export interface EventList {
  items: EventListItem[]
  limit: number
}

export const eventList: EventList = {
  items: [],
  limit: 3,
}

export const getEventId = getIdGenerator()
