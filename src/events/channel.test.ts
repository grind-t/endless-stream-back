import { App } from 'apps/generic'
import { it, vi, expect } from 'vitest'
import { handleFollow } from './channel'

const app = {
  eventList: {
    items: [],
    limit: 2,
  },
  io: {
    emit: vi.fn(),
  },
} as unknown as App

it('should update event list on follow', () => {
  handleFollow(app, '')
  expect(app.eventList.items.length).toBe(1)
  handleFollow(app, '')
  expect(app.eventList.items.length).toBe(2)
  handleFollow(app, '')
  expect(app.eventList.items.length).toBe(2)
})
