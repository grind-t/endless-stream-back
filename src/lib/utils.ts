import { commands } from 'events/chat'

export function generateCommandsMarkup(): string {
  let markup = ''
  const roles = ['зритель', 'подписчик', 'модератор', 'стример']
  for (const [command, data] of Object.entries(commands)) {
    const args = data.arguments
      ? ' ' + data.arguments.map((v) => `***${v}***`).join(', ')
      : ''
    markup += `+ **${command}**${args} - ${data.description}\n`
    markup += `**Стоимость:** ${data.cost}\n`
    markup += `**Доступ:** ${roles[data.role]}\n`
    markup += `**Пример:** ${data.example}\n\n`
  }
  return markup
}

export function findLastIndex<T>(
  array: Array<T>,
  predicate: (value: T, index: number, obj: T[]) => boolean
): number {
  let l = array.length
  while (l--) {
    if (predicate(array[l], l, array)) return l
  }
  return -1
}

export function getIdGenerator(): () => number {
  let id = 0
  return () => id++
}
