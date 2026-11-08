import { describe, expect, it } from 'vitest'
import { ownActivities, recentPlaces } from '../../src/pages/log/recentChoices'
import { aMeetup } from '../helpers/meetups'

describe('recentPlaces', () => {
  it('lists distinct places, newest first', () => {
    const meetups = [
      aMeetup({ date: '2026-11-01', place: 'בטיילת' }),
      aMeetup({ date: '2026-11-03', place: 'אצל נועם' }),
      aMeetup({ date: '2026-11-02', place: 'בטיילת' }),
    ]

    expect(recentPlaces(meetups)).toEqual(['אצל נועם', 'בטיילת'])
  })

  it('puts the later of two same-day meetups first', () => {
    const meetups = [
      aMeetup({ date: '2026-11-03', place: 'בקפה', createdAt: 1 }),
      aMeetup({ date: '2026-11-03', place: 'בים', createdAt: 2 }),
    ]

    expect(recentPlaces(meetups)).toEqual(['בים', 'בקפה'])
  })

  it('offers at most six', () => {
    const meetups = Array.from({ length: 8 }, (_, index) =>
      aMeetup({ date: `2026-11-0${index + 1}`, place: `מקום ${index + 1}` }),
    )

    expect(recentPlaces(meetups)).toEqual(['מקום 8', 'מקום 7', 'מקום 6', 'מקום 5', 'מקום 4', 'מקום 3'])
  })
})

describe('ownActivities', () => {
  it('lists activities beyond the presets, distinct and newest first', () => {
    const meetups = [
      aMeetup({ date: '2026-11-01', activities: ['קפה', 'סנובורד'] }),
      aMeetup({ date: '2026-11-04', activities: ['בריכה', 'סנובורד'] }),
      aMeetup({ date: '2026-11-02' }),
    ]

    expect(ownActivities(meetups, ['קפה'])).toEqual(['בריכה', 'סנובורד'])
  })
})
