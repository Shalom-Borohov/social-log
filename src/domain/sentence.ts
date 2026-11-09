import { MEETUP_COPY } from '../copy/meetup'
import { dayLabel } from './format'
import { daysBetween, MINUTES_PER_HOUR } from './logicalDay'
import type { Group, Person } from './types'

const HALF_HOUR = 30

const FULL_LIST_LIMIT = 3

const SHORT_LIST_NAMES = 2

export const DURATION_PRESETS = [30, 60, 90, 120, 180, 240] as const

export const RECENT_DAY_WORDS = [MEETUP_COPY.today, MEETUP_COPY.yesterday, MEETUP_COPY.dayBeforeYesterday]

function joinNames(names: string[]): string {
  if (names.length <= 1) {
    return names.join('')
  }

  if (names.length > FULL_LIST_LIMIT) {
    const shown = names.slice(0, SHORT_LIST_NAMES).join(MEETUP_COPY.listSeparator)

    return `${shown} ${MEETUP_COPY.andMore(names.length - SHORT_LIST_NAMES)}`
  }

  const leading = names.slice(0, -1).join(MEETUP_COPY.listSeparator)

  return `${leading} ${MEETUP_COPY.and(names[names.length - 1])}`
}

export const sameMembers = (personIds: string[], group: Group) =>
  personIds.length === group.memberIds.length && group.memberIds.every((memberId) => personIds.includes(memberId))

export function peopleLabel(personIds: string[], people: Person[], groups: Group[], groupId?: string): string {
  const group = groups.find((candidate) => candidate.id === groupId)

  if (group && sameMembers(personIds, group)) {
    return group.name
  }

  const names = personIds.flatMap((personId) => people.find((person) => person.id === personId)?.name ?? [])

  return joinNames(names)
}

export function dateWord(date: string, today: string): string {
  return RECENT_DAY_WORDS[daysBetween(date, today)] ?? MEETUP_COPY.onDay(dayLabel(date))
}

function hoursLabel(hours: number): string {
  if (hours === 1) {
    return MEETUP_COPY.hour
  }

  return hours === 2 ? MEETUP_COPY.twoHours : MEETUP_COPY.hours(hours)
}

export function durationLabel(minutes: number): string {
  const hours = Math.floor(minutes / MINUTES_PER_HOUR)
  const rest = minutes % MINUTES_PER_HOUR

  if (hours === 0) {
    return rest === HALF_HOUR ? MEETUP_COPY.halfHour : MEETUP_COPY.minutes(rest)
  }

  if (rest === 0) {
    return hoursLabel(hours)
  }

  if (rest === HALF_HOUR) {
    return MEETUP_COPY.andHalf(hoursLabel(hours))
  }

  return MEETUP_COPY.hoursAndMinutes(hoursLabel(hours), MEETUP_COPY.minutes(rest))
}
