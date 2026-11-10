import { beforeEach, describe, expect, it } from 'vitest'
import {
  addMeetup,
  addPerson,
  allGroups,
  allMeetups,
  allPeople,
  deleteGroup,
  deleteMeetup,
  NameTakenError,
  renameGroup,
  renamePerson,
  saveGroup,
  setPersonHidden,
  updateMeetup,
} from '../../src/data/repo'
import { allSavedChoices } from '../../src/data/savedChoices'
import type { MeetupDraft } from '../../src/domain/types'
import { resetDb } from '../helpers/db'

const walk: MeetupDraft = { date: '2026-11-07', personIds: ['tamar'], place: 'בטיילת', minutes: 90, rating: 4 }

describe('repo', () => {
  beforeEach(resetDb)

  it('adds a person by name and reuses an existing name', async () => {
    const tamar = await addPerson('  תמר ')
    const again = await addPerson('תמר')

    expect(again.id).toBe(tamar.id)
    expect(await allPeople()).toEqual([expect.objectContaining({ id: tamar.id, name: 'תמר', hidden: false })])
  })

  it('hides and shows a person', async () => {
    const tamar = await addPerson('תמר')

    await setPersonHidden(tamar.id, true)

    expect((await allPeople())[0].hidden).toBe(true)
  })

  it('saves a group of people', async () => {
    const group = await saveGroup(' החבר׳ה ', ['noam', 'omer'])

    expect(await allGroups()).toEqual([{ id: group.id, name: 'החבר׳ה', memberIds: ['noam', 'omer'] }])
  })

  it('renames a person, ignoring an empty name', async () => {
    const tamar = await addPerson('תמאר')

    await renamePerson(tamar.id, ' תמר ')
    await renamePerson(tamar.id, '  ')

    expect((await allPeople())[0].name).toBe('תמר')
  })

  it('refuses to rename a person to another person’s name', async () => {
    const tamar = await addPerson('תמר')
    await addPerson('מאיה')

    await expect(renamePerson(tamar.id, 'מאיה')).rejects.toThrow(NameTakenError)
    expect((await allPeople()).map(({ name }) => name)).toEqual(['מאיה', 'תמר'])
  })

  it('renames and deletes a group, keeping its meetups', async () => {
    const group = await saveGroup('החבר׳ה', ['noam', 'omer'])
    const meetupId = await addMeetup({ ...walk, personIds: ['noam', 'omer'], groupId: group.id })

    await renameGroup(group.id, ' מהצבא ')

    expect((await allGroups())[0].name).toBe('מהצבא')

    await deleteGroup(group.id)

    expect(await allGroups()).toEqual([])
    expect((await allMeetups()).map(({ id }) => id)).toEqual([meetupId])
  })

  it('adds a meetup, trimming text and dropping empty extras', async () => {
    await addMeetup({ ...walk, place: ' בטיילת ', note: '  ', activities: [], initiator: undefined })

    const [stored] = await allMeetups()

    expect(stored).toEqual({ ...walk, id: expect.any(String), createdAt: expect.any(Number) })
  })

  it('edits and deletes a meetup', async () => {
    const id = await addMeetup(walk)

    await updateMeetup(id, { ...walk, rating: 2, note: 'היה קר' })

    expect(await allMeetups()).toEqual([expect.objectContaining({ id, rating: 2, note: 'היה קר' })])

    await deleteMeetup(id)

    expect(await allMeetups()).toEqual([])
  })

  it('saves no place or activity just because a meetup used it', async () => {
    const placesBefore = await allSavedChoices('place')
    const activitiesBefore = await allSavedChoices('activity')
    const id = await addMeetup({ ...walk, place: 'בבית של נועם', activities: ['שש-בש'] })

    await updateMeetup(id, { ...walk, place: 'בים', activities: ['פינג פונג'] })

    expect(await allSavedChoices('place')).toEqual(placesBefore)
    expect(await allSavedChoices('activity')).toEqual(activitiesBefore)
  })
})
