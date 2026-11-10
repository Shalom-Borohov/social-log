import Dexie, { type EntityTable } from 'dexie'
import type { Group, HiddenPlace, Meetup, Person } from '../domain/types'

const DB_NAME = 'social-log'

class SocialDb extends Dexie {
  people!: EntityTable<Person, 'id'>
  groups!: EntityTable<Group, 'id'>
  meetups!: EntityTable<Meetup, 'id'>
  hiddenPlaces!: EntityTable<HiddenPlace, 'place'>

  constructor() {
    super(DB_NAME)
    this.version(1).stores({
      people: 'id, name',
      groups: 'id',
      meetups: 'id, date, *personIds',
    })
    this.version(2).stores({ hiddenPlaces: 'place' })
  }
}

export const db = new SocialDb()
