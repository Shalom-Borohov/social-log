import { describe, expect, it } from 'vitest'
import { isUnused, personSummary } from '../../src/domain/person'
import { aGroup, aMeetup } from '../helpers/meetups'

describe('personSummary', () => {
  it('summarises meetups with one person, newest first', () => {
    const meetups = [
      aMeetup({ id: 'old', date: '2026-10-01', personIds: ['tamar'], initiator: 'me' }),
      aMeetup({ id: 'other', date: '2026-10-05', personIds: ['noam'] }),
      aMeetup({ id: 'mid', date: '2026-10-08', personIds: ['tamar', 'noam'], initiator: 'them' }),
      aMeetup({ id: 'new', date: '2026-10-15', personIds: ['tamar'], initiator: 'me' }),
    ]

    const summary = personSummary('tamar', meetups)

    expect(summary.history.map((meetup) => meetup.id)).toEqual(['new', 'mid', 'old'])
    expect(summary.lastDate).toBe('2026-10-15')
    expect(summary.usualGap).toBe(7)
    expect(summary.initiated).toEqual({ me: 2, them: 1 })
  })

  it('has no last date or gap for someone never met', () => {
    const summary = personSummary('tamar', [])

    expect(summary).toEqual({ history: [], lastDate: null, usualGap: null, initiated: { me: 0, them: 0 } })
  })
})

describe('isUnused', () => {
  const meetups = [aMeetup({ personIds: ['tamar', 'noam'] })]

  const groups = [aGroup({ memberIds: ['ori', 'dana'] })]

  it('is true only for someone in no meetup and no group', () => {
    expect(isUnused('typo', meetups, groups)).toBe(true)
    expect(isUnused('noam', meetups, groups)).toBe(false)
    expect(isUnused('dana', meetups, groups)).toBe(false)
  })
})
