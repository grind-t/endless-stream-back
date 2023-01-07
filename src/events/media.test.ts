import { App } from 'apps/generic'
import { expect, it, vi } from 'vitest'
import { handleMediaEnd } from './media'

const emit = vi.fn()

const app = {
  mediaShare: {
    queue: [{}],
    skipVoters: new Set(['1', '2', '3']),
    idleMedia: {},
  },
  io: {
    emit,
  },
} as unknown as App

it('should play next media if previous ended', () => {
  const nextMedia = app.mediaShare.queue[0]

  handleMediaEnd(app)

  expect(app.mediaShare.queue.length).toBe(0)
  expect(app.mediaShare.skipVoters.size).toBe(0)
  expect(emit).lastCalledWith('media/changed', nextMedia)
})
