import { App, User } from 'apps/generic'
import { expect, it, vi } from 'vitest'
import { handleMessage } from './chat'

const say = vi.fn()

const app = {
  chat: {
    say,
  },
} as unknown as App

it('should handle command', () => {
  handleMessage(app, null as unknown as User, '!команды')

  expect(say).lastCalledWith('Список всех команд находится в описании стрима')
})
