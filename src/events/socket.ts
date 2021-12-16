import { Socket } from 'socket.io'
import { handleMediaEnd } from './media.js'

export function handleConnection(socket: Socket) {
  socket.on('media/ended', handleMediaEnd)
}
