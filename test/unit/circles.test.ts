import { beforeEach, describe, expect, it } from 'vitest'
import {
  allCircles,
  deleteCircle,
  joinCircle,
  renameCircle,
  saveCircle,
  setCircleMember,
} from '../../src/data/circles'
import { addMeetup, addPerson, allPeople, forgetUnusedPeople } from '../../src/data/repo'
import { resetDb } from '../helpers/db'
import { aMeetup } from '../helpers/meetups'

const circleNames = async () => (await allCircles()).map(({ name }) => name)

const membersOf = async (circleId: string) =>
  (await allCircles()).find(({ id }) => id === circleId)?.memberIds

describe('circles', () => {
  beforeEach(resetDb)

  it('saves a trimmed name with no members and lists circles by name', async () => {
    await saveCircle(' צבא ')
    await saveCircle('עבודה')
    await saveCircle('משפחה')

    const circles = await allCircles()

    expect(circles.map(({ name }) => name)).toEqual(['משפחה', 'עבודה', 'צבא'])
    expect(circles.every(({ memberIds }) => memberIds.length === 0)).toBe(true)
  })

  it('renames a circle and keeps the old name when the new one is empty', async () => {
    const { id } = await saveCircle('עבודה')

    await renameCircle(id, ' העבודה ')
    await renameCircle(id, '  ')

    expect(await circleNames()).toEqual(['העבודה'])
  })

  it('deletes a circle', async () => {
    const { id } = await saveCircle('עבודה')

    await saveCircle('צבא')
    await deleteCircle(id)

    expect(await circleNames()).toEqual(['צבא'])
  })

  it('adds and removes one member at a time', async () => {
    const { id } = await saveCircle('עבודה')

    await setCircleMember(id, 'tamar', true)
    await setCircleMember(id, 'maya', true)
    await setCircleMember(id, 'tamar', true)
    await setCircleMember(id, 'maya', false)

    expect(await membersOf(id)).toEqual(['tamar'])
  })

  it('joins people to a circle once each', async () => {
    const { id } = await saveCircle('עבודה')

    await joinCircle(id, ['tamar', 'maya'])
    await joinCircle(id, ['maya', 'noam'])

    expect(await membersOf(id)).toEqual(['tamar', 'maya', 'noam'])
  })

  it('forgets an unused person even when in a circle, and takes them out of it', async () => {
    const tamar = await addPerson('תמר')
    const maya = await addPerson('מאיה')
    const { id } = await saveCircle('עבודה')

    await joinCircle(id, [tamar.id, maya.id])
    await addMeetup(aMeetup({ personIds: [maya.id] }))
    await forgetUnusedPeople([tamar.id, maya.id])

    expect((await allPeople()).map(({ name }) => name)).toEqual(['מאיה'])
    expect(await membersOf(id)).toEqual([maya.id])
  })
})
