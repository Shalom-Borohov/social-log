import { describe, expect, it } from 'vitest'
import { peopleInTab, withFamilyCircle } from '../../src/domain/circles'
import type { Circle, Person } from '../../src/domain/types'
import { aPerson } from '../helpers/meetups'

const work: Circle = { id: 'work', name: 'עבודה', memberIds: ['tamar'] }

describe('the built-in משפחה circle', () => {
  it('is added, empty, when there is none', () => {
    expect(withFamilyCircle([work])).toEqual([work, { id: 'family', name: 'משפחה', memberIds: [] }])
  })

  it('is kept as it is when it already exists', () => {
    const family: Circle = { id: 'family', name: 'משפחה', memberIds: ['dad'] }

    expect(withFamilyCircle([work, family])).toEqual([work, family])
  })

  it('takes over a circle already named משפחה, with its members', () => {
    const named: Circle = { id: 'circle-7', name: 'משפחה', memberIds: ['mom', 'dad'] }

    expect(withFamilyCircle([named, work])).toEqual([{ id: 'family', name: 'משפחה', memberIds: ['mom', 'dad'] }, work])
  })
})

describe('who each people tab shows', () => {
  const people = [aPerson({ id: 'tamar' }), aPerson({ id: 'mom' }), aPerson({ id: 'noam' })]
  const family: Circle = { id: 'family', name: 'משפחה', memberIds: ['mom'] }
  const ids = (shown: Person[]) => shown.map(({ id }) => id)

  it('shows family members only in משפחה and everyone else only in חברים', () => {
    expect(ids(peopleInTab(people, [work, family], 'family'))).toEqual(['mom'])
    expect(ids(peopleInTab(people, [work, family], 'friends'))).toEqual(['tamar', 'noam'])
  })
})
