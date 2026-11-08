import { describe, expect, it } from 'vitest'
import { agoLabel, daysLabel, sinceLabel } from '../../src/pages/friends/sinceLabel'

describe('sinceLabel', () => {
  it.each([
    [1, 'יום'],
    [2, 'יומיים'],
    [3, '3 ימים'],
    [13, '13 ימים'],
    [14, 'שבועיים'],
    [20, '3 שבועות'],
    [59, '8 שבועות'],
    [60, 'חודשיים'],
    [120, '4 חודשים'],
    [365, '12 חודשים'],
  ])('words %i days as "%s"', (days, label) => {
    expect(sinceLabel(days)).toBe(label)
  })
})

describe('agoLabel', () => {
  it('says today for a meetup today', () => {
    expect(agoLabel(0)).toBe('היום')
  })

  it('says how long ago otherwise', () => {
    expect(agoLabel(120)).toBe('לפני 4 חודשים')
  })
})

describe('daysLabel', () => {
  it.each([
    [1, 'יום'],
    [2, 'יומיים'],
    [9, '9 ימים'],
  ])('words %i days as "%s"', (days, label) => {
    expect(daysLabel(days)).toBe(label)
  })
})
