import { Socket } from 'socket.io'
import { handleMediaEnd } from './media'
import { App } from 'apps/generic'

export function handleConnection(
  { mediaShare, io }: App,
  socket: Socket
): void {
  socket.on('media/ended', handleMediaEnd)
  const { queue, idleMedia } = mediaShare
  const media = queue.length ? queue[0].media : idleMedia
  io.emit('media/changed', media)
}
