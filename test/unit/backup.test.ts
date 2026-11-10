import { beforeEach, describe, expect, it } from 'vitest'
import { countBadRecords, exportBackup, InvalidBackupError, parseBackup, restoreBackup } from '../../src/data/backup'
import {
  addMeetup,
  addPerson,
  allGroups,
  allHiddenPlaces,
  allMeetups,
  allPeople,
  hidePlace,
  saveGroup,
} from '../../src/data/repo'
import { resetDb } from '../helpers/db'

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

  it('round-trips hidden places', async () => {
    await hidePlace('בטיילת')

    const backup = parseBackup(JSON.stringify(await exportBackup(exportedAt)))

    await resetDb()
    await hidePlace('בבית')
    await restoreBackup(backup)

    expect(await allHiddenPlaces()).toEqual(['בטיילת'])
  })

  it('restores an older backup without hidden places as none hidden', async () => {
    await hidePlace('בבית')

    await restoreBackup(parseBackup(JSON.stringify({ version: 1, exportedAt, people: [], groups: [], meetups: [] })))

    expect(await allHiddenPlaces()).toEqual([])
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
})
