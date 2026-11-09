import { addDays, isIsoDate } from '../../domain/logicalDay'
import { RECENT_DAY_WORDS } from '../../domain/sentence'
import { LOG_COPY } from './copy'
import { Chip, ChipGroup, MainAction, Panel } from './Panel'

interface DatePanelProps {
  date: string
  today: string
  onChange: (date: string) => void
  onPick: (date: string) => void
  onNext: () => void
}

export function DatePanel({ date, today, onChange, onPick, onNext }: DatePanelProps) {
  function changeDate(value: string) {
    if (isIsoDate(value) && value <= today) {
      onChange(value)
    }
  }

  return (
    <Panel heading={LOG_COPY.panelHeadings.date} action={<MainAction label={LOG_COPY.next} onClick={onNext} />}>
      <ChipGroup label={LOG_COPY.panelHeadings.date}>
        {RECENT_DAY_WORDS.map((label, daysAgo) => {
          const day = addDays(today, -daysAgo)

          return <Chip key={label} label={label} pressed={date === day} onClick={() => onPick(day)} />
        })}
      </ChipGroup>
      <label className="log-field">
        <span>{LOG_COPY.otherDate}</span>
        <input type="date" max={today} value={date} onChange={(event) => changeDate(event.target.value)} />
      </label>
    </Panel>
  )
}
