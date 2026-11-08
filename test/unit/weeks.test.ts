import { describe, expect, it } from 'vitest'
import { rollingWeeks } from '../../src/domain/weeks'

describe('rollingWeeks', () => {
  it('shows 5 weeks from Sunday to Saturday ending with the week of today', () => {
    const range = rollingWeeks('2026-11-07', 0)

    expect(range.days).toHaveLength(35)
    expect(range.days[0]).toBe('2026-10-04')
    expect(range.days[34]).toBe('2026-11-07')
  })

  it('marks days after today as future', () => {
    const range = rollingWeeks('2026-11-04', 0)

    expect(range.days[34]).toBe('2026-11-07')
    expect(range.isFuture('2026-11-04')).toBe(false)
    expect(range.isFuture('2026-11-05')).toBe(true)
  })

  it('steps back 5 weeks per page', () => {
    const range = rollingWeeks('2026-11-07', 1)

    expect(range.days[0]).toBe('2026-08-30')
    expect(range.days[34]).toBe('2026-10-03')
  })
})
