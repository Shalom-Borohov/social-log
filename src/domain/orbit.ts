import { daysBetween } from './logicalDay'
import type { Meetup, Person } from './types'

export const ORBIT_LIMIT = 15

const RING_LIMITS = [7, 30] as const

const RING_OFFSETS = [Math.PI / 4, Math.PI / 2, Math.PI / 3] as const

const FULL_TURN = 2 * Math.PI

export type Ring = 0 | 1 | 2

export interface PersonSince {
  person: Person
  daysSince: number | null
}

export interface OrbitPerson {
  person: Person
  daysSince: number
  ring: Ring
  angle: number
}

function lastMetByPerson(meetups: Meetup[]): Map<string, string> {
  const lastMet = new Map<string, string>()

  for (const meetup of meetups) {
    for (const personId of meetup.personIds) {
      const previous = lastMet.get(personId)

      if (previous === undefined || meetup.date > previous) {
        lastMet.set(personId, meetup.date)
      }
    }
  }

  return lastMet
}

export function peopleBySince(people: Person[], meetups: Meetup[], today: string): PersonSince[] {
  const lastMet = lastMetByPerson(meetups)

  const withSince = people.map((person) => {
    const date = lastMet.get(person.id)

    return { person, daysSince: date === undefined ? null : daysBetween(date, today) }
  })

  return withSince.sort((first, second) => (first.daysSince ?? Infinity) - (second.daysSince ?? Infinity))
}

function ringFor(daysSince: number): Ring {
  if (daysSince <= RING_LIMITS[0]) {
    return 0
  }

  return daysSince <= RING_LIMITS[1] ? 1 : 2
}

export function orbitPeople(people: Person[], meetups: Meetup[], today: string): OrbitPerson[] {
  const shown = peopleBySince(people, meetups, today)
    .filter((entry): entry is { person: Person; daysSince: number } => entry.daysSince !== null && !entry.person.hidden)
    .slice(0, ORBIT_LIMIT)
    .map((entry) => ({ ...entry, ring: ringFor(entry.daysSince) }))

  return shown.map((entry) => {
    const ringmates = shown.filter((other) => other.ring === entry.ring)
    const position = ringmates.indexOf(entry)

    return { ...entry, angle: RING_OFFSETS[entry.ring] + (position * FULL_TURN) / ringmates.length }
  })
}
