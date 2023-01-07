import { App } from 'apps/generic'
import { it, vi, expect } from 'vitest'
import { Socket } from 'socket.io'
import { handleConnection } from './socket'

const emit = vi.fn()

const app = {
  mediaShare: {
    queue: [],
    idleMedia: {},
  },
  io: {
    emit,
  },
} as unknown as App

const socket = {
  on: vi.fn(),
} as unknown as Socket

it('should start mediaShare on client connection', () => {
  handleConnection(app, socket)
  expect(emit).lastCalledWith('media/changed', app.mediaShare.idleMedia)
})
