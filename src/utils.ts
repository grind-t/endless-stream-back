import { mediaCommands } from './events/command.js'

/**
 * Returns the index of the last element in the array where predicate is true, and -1
 * otherwise.
 * @param array The source array to search in
 * @param predicate find calls predicate once for each element of the array, in descending
 * order, until it finds one where predicate returns true. If such an element is found,
 * findLastIndex immediately returns that element index. Otherwise, findLastIndex returns -1.
 */
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

export function generateCommandsMarkup(): string {
  const blocks = { Медиа: mediaCommands }
  let markup = ''
  for (const [block, commands] of Object.entries(blocks)) {
    markup += `# ${block}\n\n`
    for (const [command, data] of Object.entries(commands)) {
      const args = data.arguments
      const argsMarkup = args
        ? ' ' + args.map((v) => `***${v}***`).join(', ')
        : ''
      markup += `+ **${command}**${argsMarkup} - ${data.description}\n`
      markup += `**Стоимость:** ${data.cost}\n`
      markup += `**Пример:** ${data.example}\n\n`
    }
  }
  return markup
}

export function getIdGenerator(): () => number {
  let id = 0
  return () => id++
}
