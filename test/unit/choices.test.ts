import { describe, expect, it } from 'vitest'
import { initialSavedLists, inSavedOrder, placesByLastUse } from '../../src/domain/choices'
import { ACTIVITY_PRESETS, aMeetup, names } from '../helpers/meetups'

describe('placesByLastUse', () => {
  it('lists the saved places used most recently first, then unused ones newest saved first', () => {
    const saved = [
      { name: 'בטיילת', savedAt: 1 },
      { name: 'בים', savedAt: 2 },
      { name: 'אצל נועם', savedAt: 3 },
      { name: 'בקפה', savedAt: 4 },
    ]

    const meetups = [
      aMeetup({ date: '2026-11-03', place: 'בים' }),
      aMeetup({ date: '2026-11-05', place: 'בטיילת' }),
      aMeetup({ date: '2026-11-06', place: 'בפארק' }),
    ]

    expect(names(placesByLastUse(saved, meetups))).toEqual(['בטיילת', 'בים', 'בקפה', 'אצל נועם'])
  })

  it('shows every saved place', () => {
    const saved = Array.from({ length: 8 }, (_, index) => ({ name: `מקום ${index + 1}`, savedAt: index }))

    expect(placesByLastUse(saved, [])).toHaveLength(8)
  })
})

describe('inSavedOrder', () => {
  it('lists the saved names in the order they were saved', () => {
    const saved = [
      { name: 'שש-בש', savedAt: 30 },
      { name: 'אוכל', savedAt: 1 },
      { name: 'קפה', savedAt: 2 },
    ]

    expect(names(inSavedOrder(saved))).toEqual(['אוכל', 'קפה', 'שש-בש'])
  })
})

describe('initialSavedLists', () => {
  it('starts a new phone with the preset activities and no places', () => {
    const { places, activities } = initialSavedLists([], [])

    expect(places).toEqual([])
    expect(names(inSavedOrder(activities))).toEqual(ACTIVITY_PRESETS)
  })

  it('keeps the chips shown before saving became a choice', () => {
    const meetups = [
      ...Array.from({ length: 8 }, (_, index) => aMeetup({ date: `2026-10-0${index + 1}`, place: `מקום ${index + 1}` })),
      aMeetup({ date: '2026-11-01', place: 'בטיילת', activities: ['קפה', 'סנובורד'] }),
      aMeetup({ date: '2026-11-04', place: 'בבית של נועם', activities: ['שש-בש'] }),
    ]

    const { places, activities } = initialSavedLists(meetups, ['מקום 8'])

    expect(names(placesByLastUse(places, meetups))).toEqual(['בבית של נועם', 'בטיילת', 'מקום 7', 'מקום 6', 'מקום 5', 'מקום 4'])
    expect(names(inSavedOrder(activities))).toEqual([...ACTIVITY_PRESETS, 'שש-בש', 'סנובורד'])
  })
})
