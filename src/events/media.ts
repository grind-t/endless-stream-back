import { getIO } from '../server.js'
import { media } from '../data/media.js'

export function handleMediaEnd(): void {
  const io = getIO()
  media.current = media.queue.shift()
  if (!media.current) {
    const idlePlaylist = media.idlePlaylist
    const randomIdx = Math.floor(Math.random() * idlePlaylist.length)
    const req = idlePlaylist[randomIdx]
    media.current = {
      ...req,
      videoTitle: `Плейлист ожидания (${req.videoTitle})`,
    }
  }
  io.emit('media/changed', media.current)
}
