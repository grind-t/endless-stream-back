import { handleCommand } from './command.js'

export function handleMessage(user: string, message: string): Promise<void> {
  if (message[0] === '!') return handleCommand(user, message)
  return Promise.resolve()
}
