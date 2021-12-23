import { getIO } from '../server.js'
import { mediaShare } from '../data/media-share.js'

export function handleMediaEnd(): void {
  const { queue, skipVoters, idleMedia } = mediaShare
  queue.shift()
  skipVoters.clear()
  const media = queue.length ? queue[0].media : idleMedia
  getIO().emit('media/changed', media)
}
