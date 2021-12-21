import { getIO } from '../server.js'
import { media } from '../data/media.js'
import { shuffle } from '../utils.js'

export function handleMediaEnd(): void {
  const io = getIO()
  const { queue, idlePlaylist } = media
  media.current = queue.shift() || idlePlaylist[media.idlePlaylistIdx++]
  if (media.idlePlaylistIdx >= idlePlaylist.length) {
    shuffle(idlePlaylist)
    media.idlePlaylistIdx = 0
  }
  io.emit('media/changed', media.current)
}
