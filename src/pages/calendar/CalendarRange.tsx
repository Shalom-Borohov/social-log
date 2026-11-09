import { useState } from 'react'
import { dayCells, rangeStats } from '../../domain/calendar'
import { newestFirst } from '../../domain/person'
import type { Group, Meetup, Person } from '../../domain/types'
import type { WeeksRange } from '../../domain/weeks'
import { CALENDAR_COPY } from './copy'
import { DayGrid } from './DayGrid'
import { DayMeetups } from './DayMeetups'
import { RatingLegend, StatTiles } from './RangeSummary'

interface CalendarRangeProps {
  range: WeeksRange
  meetups: Meetup[]
  people: Person[]
  groups: Group[]
}

export function CalendarRange({ range, meetups, people, groups }: CalendarRangeProps) {
  const [chosenDay, setChosenDay] = useState<string | null>(null)
  const cells = dayCells(meetups, range.days)
  const loggedDays = [...cells].filter(([, cell]) => cell.count > 0).map(([date]) => date)
  const latestLoggedDay = loggedDays.at(-1) ?? null
  const selectedDay = chosenDay !== null && range.days.includes(chosenDay) ? chosenDay : latestLoggedDay
  const selectedMeetups = newestFirst(meetups.filter((meetup) => meetup.date === selectedDay))

  return (
    <>
      <DayGrid range={range} cells={cells} selectedDay={selectedDay} onSelect={setChosenDay} />
      {meetups.length === 0 && <p className="calendar-quiet">{CALENDAR_COPY.noMeetupsYet}</p>}
      <RatingLegend />
      <StatTiles stats={rangeStats(meetups, range.from, range.to)} />
      {selectedDay !== null && <DayMeetups meetups={selectedMeetups} people={people} groups={groups} />}
    </>
  )
}
