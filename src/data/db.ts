import Dexie, { type EntityTable, type Transaction } from 'dexie'
import { initialSavedLists } from '../domain/choices'
import { withFamilyCircle } from '../domain/circles'
import type { Circle, Group, HiddenPlace, Meetup, Person, SavedChoice } from '../domain/types'

const DB_NAME = 'social-log'

function addSavedLists(tx: Transaction, { places, activities }: ReturnType<typeof initialSavedLists>) {
  return Promise.all([
    tx.table<SavedChoice, string>('savedPlaces').bulkAdd(places),
    tx.table<SavedChoice, string>('savedActivities').bulkAdd(activities),
  ])
}

async function saveTheChipsShownSoFar(tx: Transaction) {
  const meetups = await tx.table<Meetup, string>('meetups').toArray()
  const hiddenPlaces = await tx.table<HiddenPlace, string>('hiddenPlaces').toCollection().primaryKeys()

  await addSavedLists(tx, initialSavedLists(meetups, hiddenPlaces))
}

async function addTheFamilyCircle(tx: Transaction) {
  const circles = tx.table<Circle, string>('circles')

  const withFamily = withFamilyCircle(await circles.toArray())

  await circles.clear()
  await circles.bulkAdd(withFamily)
}

class SocialDb extends Dexie {
  people!: EntityTable<Person, 'id'>
  groups!: EntityTable<Group, 'id'>
  meetups!: EntityTable<Meetup, 'id'>
  savedPlaces!: EntityTable<SavedChoice, 'name'>
  savedActivities!: EntityTable<SavedChoice, 'name'>
  circles!: EntityTable<Circle, 'id'>

  constructor() {
    super(DB_NAME)
    this.version(1).stores({
      people: 'id, name',
      groups: 'id',
      meetups: 'id, date, *personIds',
    })
    this.version(2).stores({ hiddenPlaces: 'place' })
    this.version(3).stores({ savedPlaces: 'name', savedActivities: 'name' }).upgrade(saveTheChipsShownSoFar)
    this.version(4).stores({ hiddenPlaces: null })
    this.version(5).stores({ circles: 'id' })
    this.version(6).upgrade(addTheFamilyCircle)
    this.on('populate', (tx) => void Promise.all([addSavedLists(tx, initialSavedLists([], [])), addTheFamilyCircle(tx)]))
  }
}

export const db = new SocialDb()
