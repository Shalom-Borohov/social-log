import { describe, expect, it } from 'vitest'
import { groupSuggestion } from '../../src/domain/groupSuggestion'
import { aGroup, aMeetup } from '../helpers/meetups'

const meetups = [
  aMeetup({ id: 'walk', personIds: ['tamar', 'maya'] }),
  aMeetup({ id: 'coffee', personIds: ['maya', 'tamar'] }),
  aMeetup({ id: 'trio', personIds: ['tamar', 'maya', 'noam'] }),
  aMeetup({ id: 'alone', personIds: ['tamar'] }),
]

describe('groupSuggestion', () => {
  it('counts meetups with exactly these people in any order', () => {
    expect(groupSuggestion(['tamar', 'maya'], meetups, [])).toBe(2)
  })

  it('suggests nothing after only one meetup together, leaving out larger ones', () => {
    expect(groupSuggestion(['tamar', 'maya', 'noam'], meetups, [])).toBe(0)
  })

  it('suggests nothing for fewer than two people', () => {
    const together = [aMeetup({ personIds: ['tamar'] }), aMeetup({ personIds: ['tamar'] })]

    expect(groupSuggestion(['tamar'], together, [])).toBe(0)
  })

  it('suggests nothing when a group already has these members', () => {
    const sisters = aGroup({ memberIds: ['maya', 'tamar'] })

    expect(groupSuggestion(['tamar', 'maya'], meetups, [sisters])).toBe(0)
  })

  it('leaves out the meetup being edited', () => {
    const third = aMeetup({ id: 'third', personIds: ['tamar', 'maya'] })

    expect(groupSuggestion(['tamar', 'maya'], [...meetups, third], [], 'walk')).toBe(2)
    expect(groupSuggestion(['tamar', 'maya'], meetups, [], 'walk')).toBe(0)
  })
})
