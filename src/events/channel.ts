import { getIO } from '../server.js'
import {
  eventList,
  EventListItem,
  EventType,
  getEventId,
} from '../data/event-list.js'

export function handleFollow(user: string) {
  const io = getIO()
  const item: EventListItem = {
    id: getEventId(),
    user,
    event: EventType.Follow,
  }
  eventList.items.push(item)
  if (eventList.items.length > eventList.limit) eventList.items.shift()
  io.emit('event-list/changed', eventList.items)
}
