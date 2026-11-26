import { describe, expect, it } from 'vitest'
import { meetupPlaces, placesLabel, storedPlaces } from '../../src/domain/places'
import { aMeetup } from '../helpers/meetups'

describe('placesLabel', () => {
  it('reads one place as it is', () => {
    expect(placesLabel(['בטיילת'])).toBe('בטיילת')
  })

  it('joins two places with ו', () => {
    expect(placesLabel(['בטיילת', 'בים'])).toBe('בטיילת ובים')
  })

  it('lists every place, even past three', () => {
    expect(placesLabel(['בטיילת', 'בים', 'בבית', 'אצל נועם'])).toBe('בטיילת, בים, בבית ואצל נועם')
  })
})

describe('meetupPlaces', () => {
  it('puts the first place before the later ones', () => {
    expect(meetupPlaces(aMeetup({ place: 'בטיילת', laterPlaces: ['בים', 'בבית'] }))).toEqual(['בטיילת', 'בים', 'בבית'])
  })

  it('reads a meetup with one place', () => {
    expect(meetupPlaces(aMeetup({ place: 'בטיילת' }))).toEqual(['בטיילת'])
  })
})

describe('storedPlaces', () => {
  it('keeps the first place apart from the later ones, in order', () => {
    expect(storedPlaces('בטיילת', ['בים', 'בבית'])).toEqual({ place: 'בטיילת', laterPlaces: ['בים', 'בבית'] })
  })

  it('trims, drops blanks and lists a place once', () => {
    expect(storedPlaces(' בטיילת ', ['', ' בים', 'בטיילת', 'בים '])).toEqual({ place: 'בטיילת', laterPlaces: ['בים'] })
  })

  it('leaves out the later places when there is only one place', () => {
    expect(storedPlaces('בטיילת')).toEqual({ place: 'בטיילת' })
    expect(storedPlaces('בטיילת', [' '])).toEqual({ place: 'בטיילת' })
  })
})
