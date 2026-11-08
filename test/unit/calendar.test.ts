import { describe, expect, it } from 'vitest'
import { dayCells, rangeStats } from '../../src/domain/calendar'
import { aMeetup } from '../helpers/meetups'

describe('dayCells', () => {
  it('gives a day with no meetups no rating', () => {
    const cells = dayCells([], ['2026-11-05'])

    expect(cells.get('2026-11-05')).toEqual({ bestRating: null, count: 0 })
  })

  it('takes the best rating of the day and counts its meetups', () => {
    const meetups = [aMeetup({ rating: 2 }), aMeetup({ rating: 3 }), aMeetup({ date: '2026-11-06', rating: 1 })]

    const cells = dayCells(meetups, ['2026-11-05', '2026-11-06'])

    expect(cells.get('2026-11-05')).toEqual({ bestRating: 3, count: 2 })
    expect(cells.get('2026-11-06')).toEqual({ bestRating: 1, count: 1 })
  })
})

describe('rangeStats', () => {
  it('counts meetups, great ones and hours inside the range only', () => {
    const meetups = [
      aMeetup({ date: '2026-10-04', rating: 4, minutes: 150 }),
      aMeetup({ date: '2026-11-07', rating: 2, minutes: 60 }),
      aMeetup({ date: '2026-10-03', rating: 4, minutes: 600 }),
    ]

    expect(rangeStats(meetups, '2026-10-04', '2026-11-07')).toEqual({ meetups: 2, great: 1, hours: 3.5 })
  })
})
