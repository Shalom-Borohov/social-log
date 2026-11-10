const ROLLOVER_HOUR = 3

const NOON = 12

const ISO_DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/

const MS_PER_DAY = 86_400_000

export const DAYS_PER_WEEK = 7

export const MINUTES_PER_HOUR = 60

export const pad = (value: number) => String(value).padStart(2, '0')

export const isIsoDate = (date: string) => ISO_DATE_PATTERN.test(date) && toIsoDate(parseIsoDate(date)) === date

export const isLoggableDate = (date: string, today: string) => isIsoDate(date) && date <= today

export function toIsoDate(date: Date): string {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
}

export function parseIsoDate(date: string): Date {
  const [year, month, day] = date.split('-').map(Number)

  return new Date(year, month - 1, day, NOON)
}

export function addDays(date: string, days: number): string {
  const parsed = parseIsoDate(date)

  return toIsoDate(new Date(parsed.getFullYear(), parsed.getMonth(), parsed.getDate() + days, NOON))
}

export function daysBetween(from: string, to: string): number {
  return Math.round((parseIsoDate(to).getTime() - parseIsoDate(from).getTime()) / MS_PER_DAY)
}

export function logicalToday(now: number): string {
  const moment = new Date(now)
  const today = toIsoDate(moment)

  return moment.getHours() < ROLLOVER_HOUR ? addDays(today, -1) : today
}

export function weekStart(date: string): string {
  return addDays(date, -parseIsoDate(date).getDay())
}

export function daysInRange(from: string, to: string): string[] {
  const days: string[] = []
  for (let day = from; day <= to; day = addDays(day, 1)) {
    days.push(day)
  }

  return days
}
