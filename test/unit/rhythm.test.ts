import { describe, expect, it } from 'vitest'
import { mostOverdue, usualGap } from '../../src/domain/rhythm'
import { aMeetup, aPerson } from '../helpers/meetups'

const TODAY = '2026-11-08'

const meetupsWith = (personId: string, dates: string[]) => dates.map((date) => aMeetup({ date, personIds: [personId] }))

describe('usualGap', () => {
  it('needs at least 3 meetups', () => {
    expect(usualGap(['2026-10-01', '2026-10-15'])).toBeNull()
  })

  it('is the median gap in days between meetups', () => {
    expect(usualGap(['2026-10-01', '2026-10-08', '2026-10-22', '2026-10-25'])).toBe(7)
  })

  it('is a half day when the middle two gaps differ by one', () => {
    expect(usualGap(['2026-10-01', '2026-10-04', '2026-10-08'])).toBe(3.5)
  })

  it('counts every meetup towards the three, even two on the same day', () => {
    expect(usualGap(['2026-10-01', '2026-10-01', '2026-10-11'])).toBe(10)
  })

  it('has no gap when all the meetups were on one day', () => {
    expect(usualGap(['2026-10-01', '2026-10-01', '2026-10-01'])).toBeNull()
  })
})

describe('mostOverdue', () => {
  it('picks the person furthest past their usual gap', () => {
    const tamar = aPerson({ id: 'tamar', name: 'תמר' })
    const noam = aPerson({ id: 'noam', name: 'נועם' })
    const meetups = [
      ...meetupsWith('tamar', ['2026-06-01', '2026-06-15', '2026-06-29']),
      ...meetupsWith('noam', ['2026-10-04', '2026-10-11', '2026-10-18']),
    ]

    expect(mostOverdue([tamar, noam], meetups, TODAY)).toEqual({ person: tamar, daysSince: 132 })
  })

  it('names nobody when everyone is within their usual gap', () => {
    const noam = aPerson({ id: 'noam' })
    const meetups = meetupsWith('noam', ['2026-10-25', '2026-11-01', '2026-11-05'])

    expect(mostOverdue([noam], meetups, TODAY)).toBeNull()
  })

  it('names someone once the days since pass a half-day usual gap', () => {
    const tamar = aPerson({ id: 'tamar' })
    const meetups = meetupsWith('tamar', ['2026-10-01', '2026-10-04', '2026-10-08'])

    expect(mostOverdue([tamar], meetups, '2026-10-12')).toEqual({ person: tamar, daysSince: 4 })
  })

  it('ranks by the half-day usual gap, not a rounded one', () => {
    const tamar = aPerson({ id: 'tamar', name: 'תמר' })
    const noam = aPerson({ id: 'noam', name: 'נועם' })

    const meetups = [
      ...meetupsWith('tamar', ['2026-10-27', '2026-10-30', '2026-11-03']),
      ...meetupsWith('noam', ['2026-10-19', '2026-10-25', '2026-10-31']),
    ]

    expect(mostOverdue([tamar, noam], meetups, TODAY)).toEqual({ person: tamar, daysSince: 5 })
  })

  it('names nobody seen exactly their usual gap ago', () => {
    const noam = aPerson({ id: 'noam' })
    const meetups = meetupsWith('noam', ['2026-10-18', '2026-10-25', '2026-11-01'])

    expect(mostOverdue([noam], meetups, TODAY)).toBeNull()
  })

  it('names someone one day past their usual gap', () => {
    const noam = aPerson({ id: 'noam' })
    const meetups = meetupsWith('noam', ['2026-10-17', '2026-10-24', '2026-10-31'])

    expect(mostOverdue([noam], meetups, TODAY)).toEqual({ person: noam, daysSince: 8 })
  })

  it('skips hidden people', () => {
    const tamar = aPerson({ id: 'tamar', hidden: true })
    const meetups = meetupsWith('tamar', ['2026-06-01', '2026-06-15', '2026-06-29'])

    expect(mostOverdue([tamar], meetups, TODAY)).toBeNull()
  })
})
