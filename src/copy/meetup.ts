import type { Initiator, Rating } from '../domain/types'

export const MEETUP_COPY = {
  ratings: { 4: 'מעולה', 3: 'טוב', 2: 'סביר', 1: 'לא משהו' } satisfies Record<Rating, string>,
  initiators: { me: 'אני', them: 'הם' } satisfies Record<Initiator, string>,
  activityPresets: ['אוכל', 'קפה', 'הליכה', 'בבית', 'ספורט', 'הופעה/סרט'],
  today: 'היום',
  yesterday: 'אתמול',
  dayBeforeYesterday: 'שלשום',
  onDay: (dayLabel: string) => `ב${dayLabel}`,
  and: (name: string) => `ו${name}`,
  listSeparator: ', ',
  andMore: (count: number) => `ועוד ${count}`,
  halfHour: 'חצי שעה',
  hour: 'שעה',
  twoHours: 'שעתיים',
  hours: (count: number) => `${count} שעות`,
  andHalf: (hours: string) => `${hours} וחצי`,
  minutes: (count: number) => `${count} דקות`,
  hoursAndMinutes: (hours: string, minutes: string) => `${hours} ו־${minutes}`,
} as const
