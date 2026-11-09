import { daysBetween, logicalToday } from './logicalDay'
import type { Meetup } from './types'

const BACKUP_INTERVAL_DAYS = 7

export type BackupReminder = { kind: 'never' } | { kind: 'stale'; days: number }

const firstMeetupDate = (meetups: Meetup[]) =>
  meetups.reduce<string | null>((first, { date }) => (first === null || date < first ? date : first), null)

export function backupReminder(meetups: Meetup[], lastBackupAt: number | null, today: string): BackupReminder | null {
  const start = firstMeetupDate(meetups)

  if (start === null) {
    return null
  }

  const days = daysBetween(lastBackupAt === null ? start : logicalToday(lastBackupAt), today)

  if (days < BACKUP_INTERVAL_DAYS) {
    return null
  }

  return lastBackupAt === null ? { kind: 'never' } : { kind: 'stale', days }
}
