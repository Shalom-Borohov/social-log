import { FORMAT_COPY } from '../copy/format'
import { pad, parseIsoDate, toIsoDate } from './logicalDay'

export const LIST_SEPARATOR = FORMAT_COPY.listSeparator

export function weekdayName(date: string): string {
  return FORMAT_COPY.weekdays[parseIsoDate(date).getDay()]
}

export function gregorianLabel(date: string): string {
  const parsed = parseIsoDate(date)

  return `${parsed.getDate()}.${parsed.getMonth() + 1}`
}

export function fullDateLabel(date: string): string {
  return `${gregorianLabel(date)}.${parseIsoDate(date).getFullYear()}`
}

export function dateTimeLabel(timestamp: number): string {
  const date = new Date(timestamp)

  return `${fullDateLabel(toIsoDate(date))} ${pad(date.getHours())}:${pad(date.getMinutes())}`
}

export function dayLabel(date: string): string {
  return `${weekdayName(date)} ${gregorianLabel(date)}`
}
