import { FORMAT_COPY } from '../../copy/format'
import { MEETUP_COPY } from '../../copy/meetup'

export const CALENDAR_COPY = {
  lastWeeks: (weeks: number) => `${weeks} השבועות האחרונים`,
  previousWeeks: (weeks: number) => `${weeks} השבועות הקודמים`,
  nextWeeks: (weeks: number) => `${weeks} השבועות הבאים`,
  range: (from: string, to: string) => `${from}–${to}`,
  dayCell: (...parts: string[]) => parts.join(MEETUP_COPY.listSeparator),
  noMeetups: 'אין מפגשים',
  meetupCount: (count: number) => `${count} מפגשים`,
  legend: 'מקרא דירוגים',
  meetups: 'מפגשים',
  greatMeetups: 'מעולים',
  hours: 'שעות',
  meetupDetails: (place: string, duration: string) => [place, duration].join(FORMAT_COPY.listSeparator),
  noMeetupsThatDay: 'אין מפגשים ביום הזה',
  noMeetupsYet: 'עדיין לא נרשמו מפגשים. מפגש חדש נרשם בכפתור +',
} as const
