import { Socket } from 'socket.io'
import { getIO } from '../server.js'
import { handleMediaEnd } from './media.js'
import { mediaShare } from '../data/media-share.js'

export function handleConnection(socket: Socket): void {
  socket.on('media/ended', handleMediaEnd)
  const { queue, idleMedia } = mediaShare
  const media = queue.length ? queue[0].media : idleMedia
  getIO().emit('media/changed', media)
}
