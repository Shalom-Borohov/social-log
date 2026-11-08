import { RatingChip } from '../../components/RatingChip'
import { MEETUP_COPY } from '../../copy/meetup'
import type { RangeStats } from '../../domain/calendar'
import { RATINGS } from '../../domain/types'
import { CALENDAR_COPY } from './copy'

const HOURS_ROUNDING = 10

const roundedHours = (hours: number) => String(Math.round(hours * HOURS_ROUNDING) / HOURS_ROUNDING)

export function RatingLegend() {
  return (
    <ul className="calendar-legend" aria-label={CALENDAR_COPY.legend}>
      {RATINGS.map((rating) => (
        <li key={rating}>
          <RatingChip rating={rating} />
          {MEETUP_COPY.ratings[rating]}
        </li>
      ))}
    </ul>
  )
}

function StatTile({ amount, label }: { amount: string; label: string }) {
  return (
    <div className="calendar-stat">
      <div className="calendar-stat-value">{amount}</div>
      <div className="calendar-stat-label">{label}</div>
    </div>
  )
}

export function StatTiles({ stats }: { stats: RangeStats }) {
  return (
    <div className="calendar-stats">
      <StatTile amount={String(stats.meetups)} label={CALENDAR_COPY.meetups} />
      <StatTile amount={String(stats.great)} label={CALENDAR_COPY.greatMeetups} />
      <StatTile amount={roundedHours(stats.hours)} label={CALENDAR_COPY.hours} />
    </div>
  )
}
