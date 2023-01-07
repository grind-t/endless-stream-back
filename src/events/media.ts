import { App } from 'apps/generic'

export function handleMediaEnd({ mediaShare, io }: App): void {
  const { queue, skipVoters, idleMedia } = mediaShare
  queue.shift()
  skipVoters.clear()
  const media = queue.length ? queue[0].media : idleMedia
  io.emit('media/changed', media)
}
