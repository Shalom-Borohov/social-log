import { daysBetween } from './logicalDay'
import type { Meetup, Person } from './types'

const MIN_MEETUPS_FOR_RHYTHM = 3

const MIN_DAYS_FOR_A_GAP = 2

export interface Overdue {
  person: Person
  daysSince: number
}

function meetupDates(personId: string, meetups: Meetup[]): string[] {
  return meetups
    .filter((meetup) => meetup.personIds.includes(personId))
    .map((meetup) => meetup.date)
    .sort()
}

function median(values: number[]): number {
  const sorted = [...values].sort((first, second) => first - second)
  const middle = Math.floor(sorted.length / 2)

  return sorted.length % 2 === 1 ? sorted[middle] : Math.round((sorted[middle - 1] + sorted[middle]) / 2)
}

export function usualGap(dates: string[]): number | null {
  const distinct = [...new Set(dates)].sort()

  if (dates.length < MIN_MEETUPS_FOR_RHYTHM || distinct.length < MIN_DAYS_FOR_A_GAP) {
    return null
  }

  return median(distinct.slice(1).map((date, index) => daysBetween(distinct[index], date)))
}

export function mostOverdue(people: Person[], meetups: Meetup[], today: string): Overdue | null {
  let worst: (Overdue & { ratio: number }) | null = null

  for (const person of people.filter((candidate) => !candidate.hidden)) {
    const dates = meetupDates(person.id, meetups)
    const gap = usualGap(dates)

    if (gap === null) {
      continue
    }

    const daysSince = daysBetween(dates[dates.length - 1], today)
    const ratio = daysSince / gap

    if (daysSince > gap && (worst === null || ratio > worst.ratio)) {
      worst = { person, daysSince, ratio }
    }
  }

  return worst && { person: worst.person, daysSince: worst.daysSince }
}
