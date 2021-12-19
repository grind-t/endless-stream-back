import { getIO } from '../server.js'
import { media } from '../data/media.js'

export function handleMediaEnd(): void {
  const io = getIO()
  media.current = media.queue.shift()
  io.emit('media/changed', media.current || media.idle)
}
