import { RatingDots } from '../../components/RatingDots'
import { FORMAT_COPY } from '../../copy/format'
import { MEETUP_COPY } from '../../copy/meetup'
import type { DayCell } from '../../domain/calendar'
import { dayLabel } from '../../domain/format'
import { parseIsoDate } from '../../domain/logicalDay'
import type { WeeksRange } from '../../domain/weeks'
import { CALENDAR_COPY } from './copy'

interface DayGridProps {
  range: WeeksRange
  cells: Map<string, DayCell>
  selectedDay: string | null
  onSelect: (date: string) => void
}

function dayCellLabel(date: string, { bestRating, count }: DayCell): string {
  if (bestRating === null) {
    return CALENDAR_COPY.dayCell(dayLabel(date), CALENDAR_COPY.noMeetups)
  }

  const rating = MEETUP_COPY.ratings[bestRating]

  return count > 1
    ? CALENDAR_COPY.dayCell(dayLabel(date), rating, CALENDAR_COPY.meetupCount(count))
    : CALENDAR_COPY.dayCell(dayLabel(date), rating)
}

interface DayButtonProps {
  date: string
  cell: DayCell
  future: boolean
  selected: boolean
  onSelect: (date: string) => void
}

function DayButton({ date, cell, future, selected, onSelect }: DayButtonProps) {
  const { bestRating, count } = cell

  return (
    <button
      type="button"
      className={`calendar-day${bestRating === null ? '' : ` is-logged rating-${bestRating}`}`}
      disabled={future}
      aria-pressed={selected}
      aria-label={dayCellLabel(date, cell)}
      onClick={() => onSelect(date)}
    >
      {parseIsoDate(date).getDate()}
      {bestRating !== null && <RatingDots rating={bestRating} />}
      {count > 1 && (
        <span className="calendar-day-count" aria-hidden="true">
          {count}
        </span>
      )}
    </button>
  )
}

export function DayGrid({ range, cells, selectedDay, onSelect }: DayGridProps) {
  return (
    <>
      <div className="calendar-weekdays" aria-hidden="true">
        {FORMAT_COPY.weekdayLetters.map((letter) => (
          <span key={letter} className="calendar-weekday">
            {letter}
          </span>
        ))}
      </div>
      <div className="calendar-grid">
        {[...cells].map(([date, cell]) => (
          <DayButton
            key={date}
            date={date}
            cell={cell}
            future={range.isFuture(date)}
            selected={date === selectedDay}
            onSelect={onSelect}
          />
        ))}
      </div>
    </>
  )
}
