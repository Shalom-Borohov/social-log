import { describe, expect, it } from 'vitest'
import { backupReminder } from '../../src/domain/backupReminder'
import { aMeetup } from '../helpers/meetups'

const meetups = [aMeetup({ date: '2026-10-30' }), aMeetup({ date: '2026-10-28' })]

const at = (dayOfMonth: number, hour = 9) => new Date(2026, 10, dayOfMonth, hour).getTime()

describe('backupReminder', () => {
  it('stays quiet when nothing was logged, even with an old backup', () => {
    expect(backupReminder([], null, '2026-11-20')).toBeNull()
    expect(backupReminder([], at(1), '2026-11-20')).toBeNull()
  })

  it('counts from the first meetup when there was never a backup', () => {
    expect(backupReminder(meetups, null, '2026-11-03')).toBeNull()
    expect(backupReminder(meetups, null, '2026-11-04')).toEqual({ kind: 'never' })
  })

  it('appears seven days after the last backup, not six', () => {
    expect(backupReminder(meetups, at(1), '2026-11-07')).toBeNull()
    expect(backupReminder(meetups, at(1), '2026-11-08')).toEqual({ kind: 'stale', days: 7 })
  })

  it('counts a backup before the 03:00 rollover as the previous day', () => {
    expect(backupReminder(meetups, at(2, 0), '2026-11-08')).toEqual({ kind: 'stale', days: 7 })
    expect(backupReminder(meetups, at(2, 3), '2026-11-08')).toBeNull()
  })
})
