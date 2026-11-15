import { describe, expect, it } from 'vitest'
import { chipPeople } from '../../src/domain/circles'
import type { Circle, Person } from '../../src/domain/types'
import { aPerson } from '../helpers/meetups'

const people = [
  aPerson({ id: 'tamar' }),
  aPerson({ id: 'maya' }),
  aPerson({ id: 'noam' }),
  aPerson({ id: 'itay', hidden: true }),
]

const work: Circle = { id: 'work', name: 'עבודה', memberIds: ['tamar', 'itay'] }

const ids = (shown: Person[]) => shown.map(({ id }) => id)

describe('the people chips on מי', () => {
  it('shows everyone not hidden, plus hidden people already picked, when no circle is chosen', () => {
    expect(ids(chipPeople(people, [], undefined))).toEqual(['tamar', 'maya', 'noam'])
    expect(ids(chipPeople(people, ['itay'], undefined))).toEqual(['tamar', 'maya', 'noam', 'itay'])
  })

  it('narrows to the circle’s members and keeps everyone already picked', () => {
    expect(ids(chipPeople(people, [], work))).toEqual(['tamar'])
    expect(ids(chipPeople(people, ['noam'], work))).toEqual(['tamar', 'noam'])
    expect(ids(chipPeople(people, ['itay'], work))).toEqual(['tamar', 'itay'])
  })

  it('puts favourites first, each part keeping the name order', () => {
    const withFavourites = [
      aPerson({ id: 'tamar' }),
      aPerson({ id: 'maya', favourite: true }),
      aPerson({ id: 'noam' }),
      aPerson({ id: 'yael', favourite: true }),
    ]

    expect(ids(chipPeople(withFavourites, [], undefined))).toEqual(['maya', 'yael', 'tamar', 'noam'])
  })

  it('puts favourites first inside a circle too, and leaves a hidden favourite off until picked', () => {
    const withFavourites = [
      aPerson({ id: 'tamar' }),
      aPerson({ id: 'maya', favourite: true }),
      aPerson({ id: 'itay', hidden: true, favourite: true }),
    ]

    const everyone: Circle = { id: 'everyone', name: 'כולם', memberIds: ['tamar', 'maya', 'itay'] }

    expect(ids(chipPeople(withFavourites, [], everyone))).toEqual(['maya', 'tamar'])
    expect(ids(chipPeople(withFavourites, ['itay'], everyone))).toEqual(['maya', 'itay', 'tamar'])
  })
})
