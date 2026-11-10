import { beforeEach, describe, expect, it } from 'vitest'
import { db } from '../../src/data/db'
import { allMeetups } from '../../src/data/repo'
import {
  allSavedChoices,
  ChoiceTakenError,
  removeChoice,
  renameChoice,
  restoreChoice,
  saveChoices,
} from '../../src/data/savedChoices'
import { inSavedOrder } from '../../src/domain/choices'
import { resetDb } from '../helpers/db'
import { ACTIVITY_PRESETS, aMeetup, names } from '../helpers/meetups'

const savedPlaceNames = async () => names(inSavedOrder(await allSavedChoices('place')))

const savedActivityNames = async () => names(inSavedOrder(await allSavedChoices('activity')))

describe('saved places and activities', () => {
  beforeEach(resetDb)

  it('starts like a new phone: the preset activities and no places', async () => {
    expect(await savedPlaceNames()).toEqual([])
    expect(await savedActivityNames()).toEqual(ACTIVITY_PRESETS)
  })

  it('saves trimmed names in the order given, after the ones already saved', async () => {
    await saveChoices('activity', [' שש-בש ', 'פינג פונג'])

    expect(await savedActivityNames()).toEqual([...ACTIVITY_PRESETS, 'שש-בש', 'פינג פונג'])
  })

  it('keeps the place of a name that is saved again', async () => {
    await saveChoices('activity', ['קפה'])

    expect(await savedActivityNames()).toEqual(ACTIVITY_PRESETS)
  })

  it('removes a saved name and restores it in its old place', async () => {
    const [, coffee] = (await allSavedChoices('activity')).sort((first, second) => first.savedAt - second.savedAt)

    await removeChoice('activity', 'קפה')

    expect(await savedActivityNames()).not.toContain('קפה')

    await restoreChoice('activity', coffee)

    expect(await savedActivityNames()).toEqual(ACTIVITY_PRESETS)
  })

  it('renames a place in the list and in every past meetup at it', async () => {
    await saveChoices('place', ['בטילת'])
    await db.meetups.bulkPut([aMeetup({ id: 'walk', place: 'בטילת' }), aMeetup({ id: 'home', place: 'בבית' })])

    await renameChoice('place', 'בטילת', ' בטיילת ')

    expect(await savedPlaceNames()).toEqual(['בטיילת'])
    expect((await allMeetups()).map(({ id, place }) => [id, place])).toEqual(
      expect.arrayContaining([
        ['walk', 'בטיילת'],
        ['home', 'בבית'],
      ]),
    )
  })

  it('renames an activity in past meetups without listing it twice', async () => {
    await saveChoices('activity', ['שש-בש'])
    await db.meetups.put(aMeetup({ id: 'game', activities: ['שש בש', 'שש-בש', 'קפה'] }))

    await renameChoice('activity', 'שש-בש', 'שש בש')

    expect(await savedActivityNames()).toEqual([...ACTIVITY_PRESETS, 'שש בש'])
    expect((await db.meetups.get('game'))?.activities).toEqual(['שש בש', 'קפה'])
  })

  it('refuses a name that is already saved', async () => {
    await saveChoices('place', ['בים', 'בטיילת'])

    await expect(renameChoice('place', 'בים', 'בטיילת')).rejects.toThrow(
      new ChoiceTakenError('place', 'בטיילת').message,
    )
    expect(new ChoiceTakenError('place', 'בטיילת').message).toBe('כבר יש מקום בשם „בטיילת”')
    expect(await savedPlaceNames()).toEqual(['בים', 'בטיילת'])
  })

  it('keeps a name renamed to itself', async () => {
    await saveChoices('place', ['בים'])

    await renameChoice('place', 'בים', 'בים')

    expect(await savedPlaceNames()).toEqual(['בים'])
  })
})
