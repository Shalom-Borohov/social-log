import { addDays, DAYS_PER_WEEK, daysInRange, weekStart } from './logicalDay'

export const WEEKS_SHOWN = 5

const DAYS_SHOWN = WEEKS_SHOWN * DAYS_PER_WEEK

export interface WeeksRange {
  days: string[]
  from: string
  to: string
  isFuture: (date: string) => boolean
}

export function rollingWeeks(today: string, pagesBack: number): WeeksRange {
  const lastSaturday = addDays(weekStart(today), DAYS_PER_WEEK - 1 - pagesBack * DAYS_SHOWN)
  const from = addDays(lastSaturday, 1 - DAYS_SHOWN)

  return {
    days: daysInRange(from, lastSaturday),
    from,
    to: lastSaturday,
    isFuture: (date) => date > today,
  }
}
