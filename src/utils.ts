import { commands } from './events/chat.js'

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

/** Shuffle array in place. */
export function shuffle(array: any[]): any[] {
  let currentIndex = array.length

  // While there remain elements to shuffle...
  while (currentIndex != 0) {
    // Pick a remaining element...
    const randomIndex = Math.floor(Math.random() * currentIndex)
    currentIndex--

    // And swap it with the current element.
    ;[array[currentIndex], array[randomIndex]] = [
      array[randomIndex],
      array[currentIndex],
    ]
  }

  return array
}

export function getIdGenerator(): () => number {
  let id = 0
  return () => id++
}
