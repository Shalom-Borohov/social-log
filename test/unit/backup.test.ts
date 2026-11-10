import { beforeEach, describe, expect, it } from 'vitest'
import { countBadRecords, exportBackup, InvalidBackupError, parseBackup, restoreBackup } from '../../src/data/backup'
import { addMeetup, addPerson, allGroups, allMeetups, allPeople, saveGroup } from '../../src/data/repo'
import { allSavedChoices, saveChoices } from '../../src/data/savedChoices'
import { inSavedOrder } from '../../src/domain/choices'
import { resetDb } from '../helpers/db'
import { ACTIVITY_PRESETS, names } from '../helpers/meetups'

const exportedAt = Date.UTC(2026, 10, 8, 20)

async function logAWalk() {
  const tamar = await addPerson('תמר')
  const maya = await addPerson('מאיה')
  const friends = await saveGroup('הבנות', [tamar.id, maya.id])

  await addMeetup({
    date: '2026-11-07',
    personIds: [tamar.id, maya.id],
    groupId: friends.id,
    place: 'בטיילת',
    minutes: 90,
    rating: 4,
    activities: ['הליכה'],
    initiator: 'me',
    note: 'סוף סוף',
  })
}

describe('backup', () => {
  beforeEach(resetDb)

  it('round-trips people, groups and meetups', async () => {
    await logAWalk()
    const before = { people: await allPeople(), groups: await allGroups(), meetups: await allMeetups() }

    const backup = parseBackup(JSON.stringify(await exportBackup(exportedAt)))

    await resetDb()
    await addPerson('מישהו אחר')
    await restoreBackup(backup)

    expect(backup).toMatchObject({ version: 1, exportedAt })
    expect({ people: await allPeople(), groups: await allGroups(), meetups: await allMeetups() }).toStrictEqual(before)
  })

  it('round-trips the saved places and activities in their order', async () => {
    await saveChoices('place', ['בטיילת'])
    await saveChoices('activity', ['שש-בש', 'פינג פונג'])

    const backup = parseBackup(JSON.stringify(await exportBackup(exportedAt)))

    await resetDb()
    await saveChoices('place', ['בבית'])
    await restoreBackup(backup)

    expect(backup).not.toHaveProperty('hiddenPlaces')
    expect(names(inSavedOrder(await allSavedChoices('place')))).toEqual(['בטיילת'])
    expect(names(inSavedOrder(await allSavedChoices('activity')))).toEqual([...ACTIVITY_PRESETS, 'שש-בש', 'פינג פונג'])
  })

  it('gives an older backup the chips it showed: recent places not hidden, presets and own activities', async () => {
    const people = [{ id: 'p', name: 'תמר', hidden: false, createdAt: 1 }]

    const meetups = [
      { id: 'a', date: '2026-11-01', personIds: ['p'], place: 'בטיילת', minutes: 60, rating: 2, createdAt: 1, activities: ['סנובורד'] },
      { id: 'b', date: '2026-11-03', personIds: ['p'], place: 'בים', minutes: 60, rating: 2, createdAt: 1 },
    ]

    await saveChoices('place', ['בבית'])
    await restoreBackup(
      parseBackup(JSON.stringify({ version: 1, exportedAt, people, groups: [], meetups, hiddenPlaces: ['בים'] })),
    )

    expect(names(inSavedOrder(await allSavedChoices('place')))).toEqual(['בטיילת'])
    expect(names(inSavedOrder(await allSavedChoices('activity')))).toEqual([...ACTIVITY_PRESETS, 'סנובורד'])
  })

  it('accepts a meetup without the optional fields', () => {
    const meetup = { id: 'm', date: '2026-11-07', personIds: ['p'], place: 'בבית', minutes: 60, rating: 2, createdAt: 1 }
    const people = [{ id: 'p', name: 'תמר', hidden: false, createdAt: 1 }]

    expect(parseBackup(JSON.stringify({ version: 1, exportedAt, people, groups: [], meetups: [meetup] })).meetups).toEqual([meetup])
  })

  it.each([-30, 0, 7.5, 1441])('rejects a meetup lasting %s minutes', (minutes) => {
    const meetup = { id: 'm', date: '2026-11-07', personIds: ['p'], place: 'בבית', minutes, rating: 2, createdAt: 1 }

    expect(() => parseBackup(JSON.stringify({ version: 1, exportedAt, people: [], groups: [], meetups: [meetup] }))).toThrow(
      InvalidBackupError,
    )
  })

  it.each([
    ['a future date', { date: '2099-01-01' }],
    ['an empty place', { place: '' }],
    ['someone not in the file', { personIds: ['stranger'] }],
  ])('rejects a meetup with %s', (_case, change) => {
    const meetup = { id: 'm', date: '2026-11-07', personIds: ['p'], place: 'בבית', minutes: 60, rating: 2, createdAt: 1, ...change }
    const people = [{ id: 'p', name: 'תמר', hidden: false, createdAt: 1 }]

    expect(() => parseBackup(JSON.stringify({ version: 1, exportedAt, people, groups: [], meetups: [meetup] }))).toThrow(
      InvalidBackupError,
    )
  })

  it('rejects a file that is not a backup', () => {
    expect(() => parseBackup('{"days": []}')).toThrow(InvalidBackupError)
    expect(() => parseBackup('not json')).toThrow(InvalidBackupError)
  })

  it('counts records that would fail to import', () => {
    const bad = { id: 'm', date: '7.11', personIds: [], place: '', minutes: 60, rating: 9, createdAt: 1 }

    expect(countBadRecords(JSON.stringify({ version: 1, exportedAt, people: [], groups: [], meetups: [bad] }))).toBe(1)
  })

  it('counts saved places and activities that would fail to import', () => {
    const file = {
      version: 1,
      exportedAt,
      people: [],
      groups: [],
      meetups: [],
      savedPlaces: [{ name: '', savedAt: 1 }],
      savedActivities: [{ name: 'קפה' }],
    }

    expect(countBadRecords(JSON.stringify(file))).toBe(2)
  })
})
