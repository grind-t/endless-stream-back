import { shuffle } from '../utils.js'
import { User, getBroadcaster } from '../clients/app.js'

export interface MediaRequest {
  user: User
  videoId: string
  videoTitle: string
}

export interface Media {
  queue: MediaRequest[]
  maxQueue: number
  maxUserRequests: number
  current: MediaRequest | undefined
  votesToSkip: number
  skipVoters: Set<string>
  idlePlaylist: MediaRequest[]
  idlePlaylistIdx: number
}

const idlePlaylist: MediaRequest[] = [
  ['ql9TiOhGx0s', 'А мой мальчик едет на девятке [Right version]'],
  ['VFzF-l6gz-o', 'Pain - Shut your mouth (Gachi mix)'],
  ['yukHZvo5mnw', 'CUMпитал (Капитал gachi mix)'],
  ['dQ2YIQThBd8', 'Мэйби Бэйби - Бла бла (Right version)'],
  ['myy_n8aT8mM', 'NirVANa - SMELLS LIKE TEEN SEMEN'],
  ['p6JXsraIrc8', 'Kavinsky - Nightcall (Right version)'],
  ['obuNuIQ7zmU', 'deminer КОЖАНЫЙ ♂ ТРАКТОР'],
  ['wXKqVDvKpmo', 'Big Baby Tape, kizaru - Million【RIGHT VERSION】'],
  ['G9XEsvX7dw0', 'DVRST - Close Eyes (Right version)'],
  ['7IA_wO2rFpY', 'KATY PERRY - F.U.'],
  ['SiFLjGRIRfo', 'fem.love - фотографирую закат【RIGHT VERSION】'],
  ['gw7yUMtlB1w', 'fem.love - 1000-7 【RIGHT VERSION】'],
  ['H9qT4nGh2Rw', 'THUCTION (Imagine Dragons - Thunder Right Version)'],
  ['k7enNNU9j80', 'LIZER - Пачка сигарет (Right version)'],
  ['8N7mtvyYnhg', 'Дально♂BOY♂щики Тихий Огонёк Високосный год Gachi'],
  ['0TyvWoVW2Ss', 'Олег Газманов - Есаул(♂right version♂)'],
  ['Z3ERRPfgprQ', 'Inna - Cola song (Gachi mix)'],
  ['VZIWReHgOmE', '♂️ЛЮБ♂️Э - ПРОРВЁМСЯ! ОПЕРА'],
  ['4sdByTVVsYA', 'Oxxxymiron - Город под подошвой ♂【RIGHT VERSION】'],
  ['0vbjTjWkIzo', 'Макс Корж - Малый повзрослел (Right Version)'],
  ['ZTMXStS7Pas', 'SLAVA MARLOW & MORGENSHTERN - Быстро (Right Version)'],
  ['vS1ZDcVWfSY', 'Slava Marlow - Снова Я Напиваюсь (Right Version)'],
  ['E5r-CbNs1uc', 'SQWOZ BAB, THE FIRST STATION — АУФ (Right Version)'],
  ['hi7MGK_4bRQ', 'Kizaru - Dejavu (Right Version)'],
  ['Zh9dBqIht-g', 'MORGENSHTERN & Тимати - El Problema (Right Version)'],
  ['4oumGFPuJo8', 'DAVA ft. SERYOGA - ЧЕРНЫЙ БУМЕР (Right Version)'],
  ['OEUqa_1w08I', 'Lil Peep & Смешарики - От Винта'],
  ['g4n9AA7kz6k', 'ПЕРВЫЙ В МИРЕ ПОСТ ПАНК MORGENSHTERN'],
  ['SV5KYc8pOLg', 'MORGENSHTERN - PABLO x Car Man - Сан-Франциско'],
  ['nLpH966hENU', 'дурной вкус - пластинки (right version)'],
  ['V4VBPMUGQ00', '♂Big Baby Tape - Gimme the Loot♂ (right version)'],
  ['4JhJqTFc0w0', 'макс корж & morgenshtern - малый пососи'],
  ['6qM8HkIwoAs', 'Three Days Grace - Animal I Have Become (Right Version)'],
  ['nnmmou6morw', 'Смысловые галлюцинации - Вечно молодой (right version)'],
  ['RIQFvrlR2wM', 'Паровозик Трейни (Right Version)'],
].map(([id, title]) => ({
  user: getBroadcaster(),
  videoId: id,
  videoTitle: `Плейлист ожидания: ${title}`,
}))

export const media: Media = {
  queue: [],
  maxQueue: 100,
  maxUserRequests: 1,
  current: undefined,
  votesToSkip: 2,
  skipVoters: new Set(),
  idlePlaylist: shuffle(idlePlaylist),
  idlePlaylistIdx: 0,
}
