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
}

export const media: Media = {
  queue: [],
  maxQueue: 100,
  maxUserRequests: 1,
  current: undefined,
  votesToSkip: 2,
  skipVoters: new Set(),
  idlePlaylist: [
    {
      user: getBroadcaster(),
      videoId: 'ql9TiOhGx0s',
      videoTitle: 'А мой мальчик едет на девятке [Right version]',
    },
    {
      user: getBroadcaster(),
      videoId: 'c9JNp6kdKqU',
      videoTitle: 'Gorillaz - Feel good inc. (Gachi mix)',
    },
    {
      user: getBroadcaster(),
      videoId: 'VFzF-l6gz-o',
      videoTitle: 'Pain - Shut your mouth (Gachi mix)',
    },
    {
      user: getBroadcaster(),
      videoId: 'yukHZvo5mnw',
      videoTitle: 'CUMпитал (Капитал gachi mix)',
    },
    {
      user: getBroadcaster(),
      videoId: 'dQ2YIQThBd8',
      videoTitle: 'Мэйби Бэйби - Бла бла (Right version)',
    },
    {
      user: getBroadcaster(),
      videoId: 'myy_n8aT8mM',
      videoTitle: 'NirVANa - SMELLS LIKE TEEN SEMEN',
    },
    {
      user: getBroadcaster(),
      videoId: 'p6JXsraIrc8',
      videoTitle: 'Kavinsky - Nightcall (Right version)',
    },
    {
      user: getBroadcaster(),
      videoId: 'obuNuIQ7zmU',
      videoTitle: 'deminer КОЖАНЫЙ ♂ ТРАКТОР',
    },
    {
      user: getBroadcaster(),
      videoId: 'wXKqVDvKpmo',
      videoTitle: 'Big Baby Tape, kizaru - Million【RIGHT VERSION】',
    },
    {
      user: getBroadcaster(),
      videoId: 'G9XEsvX7dw0',
      videoTitle: 'DVRST - Close Eyes (Right version)',
    },
    {
      user: getBroadcaster(),
      videoId: '7IA_wO2rFpY',
      videoTitle: 'KATY PERRY - F.U.',
    },
    {
      user: getBroadcaster(),
      videoId: 'SiFLjGRIRfo',
      videoTitle: 'fem.love - фотографирую закат【RIGHT VERSION】',
    },
    {
      user: getBroadcaster(),
      videoId: '-PiKqkhyIXM',
      videoTitle: 'Нурминский - Валим (right version)',
    },
    {
      user: getBroadcaster(),
      videoId: 'nsE6Q0PNsKA',
      videoTitle: 'Макс Корж - Мотылек(♂right version♂)',
    },
    {
      user: getBroadcaster(),
      videoId: 'gw7yUMtlB1w',
      videoTitle: 'fem.love - 1000-7 【RIGHT VERSION】',
    },
    {
      user: getBroadcaster(),
      videoId: 'H9qT4nGh2Rw',
      videoTitle: 'THUCTION (Imagine Dragons - Thunder Right Version)',
    },
    {
      user: getBroadcaster(),
      videoId: 'k7enNNU9j80',
      videoTitle: 'LIZER - Пачка сигарет (Right version)',
    },
    {
      user: getBroadcaster(),
      videoId: '8N7mtvyYnhg',
      videoTitle: 'Дально♂BOY♂щики Тихий Огонёк Високосный год Gachi',
    },
    {
      user: getBroadcaster(),
      videoId: '0TyvWoVW2Ss',
      videoTitle: 'Олег Газманов - Есаул(♂right version♂)',
    },
    {
      user: getBroadcaster(),
      videoId: 'Z3ERRPfgprQ',
      videoTitle: 'Inna - Cola song (Gachi mix)',
    },
    {
      user: getBroadcaster(),
      videoId: 'VZIWReHgOmE',
      videoTitle: '♂️ЛЮБ♂️Э - ПРОРВЁМСЯ! ОПЕРА',
    },
    {
      user: getBroadcaster(),
      videoId: '4sdByTVVsYA',
      videoTitle: 'Oxxxymiron - Город под подошвой ♂【RIGHT VERSION】',
    },
    {
      user: getBroadcaster(),
      videoId: 'IDJn-sCLa1I',
      videoTitle: 'Нурминский - Зашумел Район (right version♂)',
    },
    {
      user: getBroadcaster(),
      videoId: '0vbjTjWkIzo',
      videoTitle: 'Макс Корж - Малый повзрослел (Right Version)',
    },
    {
      user: getBroadcaster(),
      videoId: 'ZTMXStS7Pas',
      videoTitle: 'SLAVA MARLOW & MORGENSHTERN - Быстро (Right Version)',
    },
    {
      user: getBroadcaster(),
      videoId: 'vS1ZDcVWfSY',
      videoTitle: 'Slava Marlow - Снова Я Напиваюсь (Right Version)',
    },
    {
      user: getBroadcaster(),
      videoId: 'E5r-CbNs1uc',
      videoTitle: 'SQWOZ BAB, THE FIRST STATION — АУФ (Right Version)',
    },
    {
      user: getBroadcaster(),
      videoId: 'hi7MGK_4bRQ',
      videoTitle: 'Kizaru - Dejavu (Right Version)',
    },
    {
      user: getBroadcaster(),
      videoId: 'Zh9dBqIht-g',
      videoTitle: 'MORGENSHTERN & Тимати - El Problema (Right Version)',
    },
    {
      user: getBroadcaster(),
      videoId: '4oumGFPuJo8',
      videoTitle: 'DAVA ft. SERYOGA - ЧЕРНЫЙ БУМЕР (Right Version)',
    },
    {
      user: getBroadcaster(),
      videoId: 'OEUqa_1w08I',
      videoTitle: 'Lil Peep & Смешарики - От Винта',
    },
    {
      user: getBroadcaster(),
      videoId: 'g4n9AA7kz6k',
      videoTitle: 'ПЕРВЫЙ В МИРЕ ПОСТ ПАНК MORGENSHTERN',
    },
    {
      user: getBroadcaster(),
      videoId: 'SV5KYc8pOLg',
      videoTitle: 'MORGENSHTERN - PABLO x Car Man - Сан-Франциско',
    },
    {
      user: getBroadcaster(),
      videoId: 'nLpH966hENU',
      videoTitle: 'дурной вкус - пластинки (right version)',
    },
    {
      user: getBroadcaster(),
      videoId: 'V4VBPMUGQ00',
      videoTitle: '♂Big Baby Tape - Gimme the Loot♂ (right version)',
    },
    {
      user: getBroadcaster(),
      videoId: '4JhJqTFc0w0',
      videoTitle: 'макс корж & morgenshtern - малый пососи',
    },
    {
      user: getBroadcaster(),
      videoId: '6qM8HkIwoAs',
      videoTitle: 'Three Days Grace - Animal I Have Become (Right Version)',
    },
    {
      user: getBroadcaster(),
      videoId: 'nnmmou6morw',
      videoTitle: 'Смысловые галлюцинации - Вечно молодой (right version)',
    },
    {
      user: getBroadcaster(),
      videoId: 'RIQFvrlR2wM',
      videoTitle: 'Паровозик Трейни (Right Version)',
    },
  ],
}
