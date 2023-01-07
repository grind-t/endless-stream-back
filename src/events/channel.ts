import { EventType, getEventId } from 'lib/event-list'
import { App } from 'apps/generic'

export function handleFollow({ eventList, io }: App, user: string) {
  if (eventList.items.length < eventList.limit) {
    eventList.items.unshift({
      id: getEventId(),
      user,
      event: EventType.Follow,
    })
    io.emit('event-list/changed', eventList.items)
  }
}
