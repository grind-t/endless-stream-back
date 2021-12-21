import { Socket } from 'socket.io'
import { getIO } from '../server.js'
import { handleMediaEnd } from './media.js'
import { media } from '../data/media.js'

export function handleConnection(socket: Socket): void {
  socket.on('media/ended', handleMediaEnd)
  if (media.current) getIO().emit('media/changed', media.current)
  else handleMediaEnd()
}
