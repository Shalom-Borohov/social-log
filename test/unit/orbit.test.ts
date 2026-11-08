import { describe, expect, it } from 'vitest'
import { orbitPeople, peopleBySince } from '../../src/domain/orbit'
import { aMeetup, aPerson } from '../helpers/meetups'

const TODAY = '2026-11-08'

describe('orbitPeople', () => {
  it('puts people in rings by days since you last met', () => {
    const people = [aPerson({ id: 'week' }), aPerson({ id: 'month' }), aPerson({ id: 'long' })]
    const meetups = [
      aMeetup({ date: '2026-11-01', personIds: ['week'] }),
      aMeetup({ date: '2026-10-09', personIds: ['month'] }),
      aMeetup({ date: '2026-10-08', personIds: ['long'] }),
    ]

    const rings = orbitPeople(people, meetups, TODAY).map(({ person, ring, daysSince }) => [person.id, ring, daysSince])

    expect(rings).toEqual([
      ['week', 0, 7],
      ['month', 1, 30],
      ['long', 2, 31],
    ])
  })

  it('leaves out hidden people and people never met', () => {
    const people = [aPerson({ id: 'hidden', hidden: true }), aPerson({ id: 'never' }), aPerson({ id: 'seen' })]
    const meetups = [aMeetup({ personIds: ['hidden', 'seen'] })]

    expect(orbitPeople(people, meetups, TODAY).map(({ person }) => person.id)).toEqual(['seen'])
  })

  it('shows at most the 15 most recently seen people', () => {
    const people = Array.from({ length: 17 }, (_, index) => aPerson({ id: `p${index}` }))
    const meetups = people.map((person, index) => aMeetup({ date: `2026-10-${String(index + 1).padStart(2, '0')}`, personIds: [person.id] }))

    const shown = orbitPeople(people, meetups, TODAY).map(({ person }) => person.id)

    expect(shown).toHaveLength(15)
    expect(shown).not.toContain('p0')
    expect(shown).not.toContain('p1')
  })

  it('spreads people in the same ring evenly around it', () => {
    const people = [aPerson({ id: 'a' }), aPerson({ id: 'b' })]
    const meetups = [aMeetup({ date: '2026-11-07', personIds: ['a', 'b'] })]

    const [first, second] = orbitPeople(people, meetups, TODAY)

    expect(Math.abs(second.angle - first.angle)).toBeCloseTo(Math.PI)
  })
})

describe('peopleBySince', () => {
  it('lists everyone, most recently seen first, hidden included and never-met last', () => {
    const people = [aPerson({ id: 'never' }), aPerson({ id: 'old', hidden: true }), aPerson({ id: 'recent' })]
    const meetups = [aMeetup({ date: '2026-09-01', personIds: ['old'] }), aMeetup({ date: '2026-11-07', personIds: ['recent'] })]

    expect(peopleBySince(people, meetups, TODAY).map(({ person, daysSince }) => [person.id, daysSince])).toEqual([
      ['recent', 1],
      ['old', 68],
      ['never', null],
    ])
  })
})
