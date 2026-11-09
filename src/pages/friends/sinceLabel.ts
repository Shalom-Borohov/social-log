import { DAYS_PER_WEEK } from '../../domain/logicalDay'
import { FRIENDS_COPY } from './copy'

const WEEKS_FROM_DAYS = 14

const MONTHS_FROM_DAYS = 60

const DAYS_PER_MONTH = 30

const DUAL = 2

export function daysLabel(days: number): string {
  if (days === 1) {
    return FRIENDS_COPY.day
  }

  return days === DUAL ? FRIENDS_COPY.twoDays : FRIENDS_COPY.days(days)
}

function weeksLabel(weeks: number): string {
  return weeks === DUAL ? FRIENDS_COPY.twoWeeks : FRIENDS_COPY.weeks(weeks)
}

function monthsLabel(months: number): string {
  return months === DUAL ? FRIENDS_COPY.twoMonths : FRIENDS_COPY.months(months)
}

export function sinceLabel(days: number): string {
  if (days < WEEKS_FROM_DAYS) {
    return daysLabel(days)
  }

  if (days < MONTHS_FROM_DAYS) {
    return weeksLabel(Math.round(days / DAYS_PER_WEEK))
  }

  return monthsLabel(Math.round(days / DAYS_PER_MONTH))
}

export function agoLabel(days: number): string {
  return days === 0 ? FRIENDS_COPY.today : FRIENDS_COPY.ago(sinceLabel(days))
}
