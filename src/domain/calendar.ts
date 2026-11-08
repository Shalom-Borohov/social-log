import { MINUTES_PER_HOUR } from './logicalDay'
import { GREAT, type Meetup, type Rating } from './types'

export interface DayCell {
  bestRating: Rating | null
  count: number
}

export interface RangeStats {
  meetups: number
  great: number
  hours: number
}

export function dayCells(meetups: Meetup[], days: string[]): Map<string, DayCell> {
  const cells = new Map<string, DayCell>(days.map((day) => [day, { bestRating: null, count: 0 }]))

  for (const meetup of meetups) {
    const cell = cells.get(meetup.date)

    if (cell) {
      cell.count += 1

      if (cell.bestRating === null || meetup.rating > cell.bestRating) {
        cell.bestRating = meetup.rating
      }
    }
  }

  return cells
}

export function rangeStats(meetups: Meetup[], from: string, to: string): RangeStats {
  const inRange = meetups.filter((meetup) => meetup.date >= from && meetup.date <= to)
  const minutes = inRange.reduce((total, meetup) => total + meetup.minutes, 0)

  return {
    meetups: inRange.length,
    great: inRange.filter((meetup) => meetup.rating === GREAT).length,
    hours: minutes / MINUTES_PER_HOUR,
  }
}
