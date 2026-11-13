import Dexie from 'dexie'
import { beforeEach, describe, expect, it } from 'vitest'
import { db } from '../../src/data/db'
import { allSavedChoices } from '../../src/data/savedChoices'
import { inSavedOrder, placesByLastUse } from '../../src/domain/choices'
import type { Circle, Meetup } from '../../src/domain/types'
import { ACTIVITY_PRESETS, aMeetup, names } from '../helpers/meetups'

async function installVersionTwo(meetups: Meetup[], hiddenPlaces: string[]) {
  const versionTwo = new Dexie(db.name)

  versionTwo.version(1).stores({ people: 'id, name', groups: 'id', meetups: 'id, date, *personIds' })
  versionTwo.version(2).stores({ hiddenPlaces: 'place' })
  await versionTwo.table('meetups').bulkAdd(meetups)
  await versionTwo.table('hiddenPlaces').bulkAdd(hiddenPlaces.map((place) => ({ place })))
  versionTwo.close()
}

async function installVersionFive(circles: Circle[]) {
  const versionFive = new Dexie(db.name)

  versionFive.version(1).stores({ people: 'id, name', groups: 'id', meetups: 'id, date, *personIds' })
  versionFive.version(2).stores({ hiddenPlaces: 'place' })
  versionFive.version(3).stores({ savedPlaces: 'name', savedActivities: 'name' })
  versionFive.version(4).stores({ hiddenPlaces: null })
  versionFive.version(5).stores({ circles: 'id' })
  await versionFive.table('circles').bulkAdd(circles)
  versionFive.close()
}

const EMPTY_FAMILY: Circle = { id: 'family', name: 'משפחה', memberIds: [] }

describe('the database', () => {
  beforeEach(async () => {
    db.close()
    await Dexie.delete(db.name)
  })

  it('keeps the chips shown before the update as the saved places and activities', async () => {
    const meetups = [
      aMeetup({ date: '2026-11-01', place: 'בטיילת', activities: ['קפה', 'סנובורד'] }),
      aMeetup({ date: '2026-11-03', place: 'בים' }),
      aMeetup({ date: '2026-11-04', place: 'אצל נועם', activities: ['שש-בש'] }),
    ]

    await installVersionTwo(meetups, ['בים'])
    await db.open()

    expect(names(placesByLastUse(await allSavedChoices('place'), meetups))).toEqual(['אצל נועם', 'בטיילת'])
    expect(names(inSavedOrder(await allSavedChoices('activity')))).toEqual([...ACTIVITY_PRESETS, 'שש-בש', 'סנובורד'])
    expect(db.tables.map(({ name }) => name)).not.toContain('hiddenPlaces')
    expect(await db.meetups.count()).toBe(3)
    expect(await db.circles.toArray()).toEqual([EMPTY_FAMILY])
  })

  it('turns a circle already named משפחה into the built-in one', async () => {
    const work: Circle = { id: 'work', name: 'עבודה', memberIds: ['tamar'] }

    await installVersionFive([work, { id: 'circle-7', name: 'משפחה', memberIds: ['mom'] }])
    await db.open()

    expect(await db.circles.toArray()).toEqual([{ id: 'family', name: 'משפחה', memberIds: ['mom'] }, work])
  })

  it('starts a new phone with the preset activities and no places', async () => {
    await db.open()

    expect(await allSavedChoices('place')).toEqual([])
    expect(names(inSavedOrder(await allSavedChoices('activity')))).toEqual(ACTIVITY_PRESETS)
    expect(await db.circles.toArray()).toEqual([EMPTY_FAMILY])
  })
})
