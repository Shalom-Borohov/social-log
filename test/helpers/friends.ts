import { db } from '../../src/data/db'
import type { Group, Meetup, Person } from '../../src/domain/types'

export const TODAY_AT_TEN = new Date(2026, 10, 8, 10).getTime()

interface Stored {
  people?: Person[]
  groups?: Group[]
  meetups?: Meetup[]
}

export async function store({ people = [], groups = [], meetups = [] }: Stored) {
  await Promise.all([db.people.bulkPut(people), db.groups.bulkPut(groups), db.meetups.bulkPut(meetups)])
}
