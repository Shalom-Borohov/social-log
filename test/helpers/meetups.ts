import type { Group, Meetup, Person } from '../../src/domain/types'

let nextId = 0

const newId = (prefix: string) => `${prefix}-${++nextId}`

export function aMeetup(overrides: Partial<Meetup> = {}): Meetup {
  return {
    id: newId('meetup'),
    date: '2026-11-05',
    personIds: ['noam'],
    place: 'בפלורנטין',
    minutes: 90,
    rating: 4,
    createdAt: 0,
    ...overrides,
  }
}

export function aPerson(overrides: Partial<Person> = {}): Person {
  return { id: newId('person'), name: 'נועם', hidden: false, createdAt: 0, ...overrides }
}

export function aGroup(overrides: Partial<Group> = {}): Group {
  return { id: newId('group'), name: 'החבר׳ה מהצבא', memberIds: [], ...overrides }
}
