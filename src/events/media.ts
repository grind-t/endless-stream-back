import { socket } from '../server.js'
import { media } from '../data/media.js'

export function handleMediaEnd(): void {
  media.current = media.queue.shift()
  socket.emit('media/changed', media.current)
}
