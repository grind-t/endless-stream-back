import { socket } from '../server.js'
import { eventList, EventListItem, EventType } from '../data/event-list.js'

export function handleFollow(user: string) {
  const item: EventListItem = { user, event: EventType.Follow }
  eventList.items.push(item)
  if (eventList.items.length > eventList.limit) eventList.items.shift()
  socket.emit('event-list/changed', eventList.items)
}
