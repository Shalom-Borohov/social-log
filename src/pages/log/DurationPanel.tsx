import { useState } from 'react'
import { MINUTES_PER_HOUR } from '../../domain/logicalDay'
import { DURATION_PRESETS, durationLabel } from '../../domain/sentence'
import { LOG_COPY } from './copy'
import { Chip, ChipGroup, MainAction, Panel } from './Panel'
import { Stepper } from './Stepper'

const MINUTES_STEP = 15

const MAX_HOURS = 23

const MAX_MINUTES = MINUTES_PER_HOUR - MINUTES_STEP

const isPreset = (minutes: number | undefined) =>
  DURATION_PRESETS.some((preset) => preset === minutes)

interface DurationPanelProps {
  minutes: number | undefined
  onPick: (minutes: number) => void
}

export function DurationPanel({ minutes, onPick }: DurationPanelProps) {
  const [custom, setCustom] = useState(minutes !== undefined && !isPreset(minutes))
  const [hours, setHours] = useState(custom && minutes !== undefined ? Math.floor(minutes / MINUTES_PER_HOUR) : 0)
  const [extraMinutes, setExtraMinutes] = useState(custom && minutes !== undefined ? minutes % MINUTES_PER_HOUR : 0)
  const customTotal = hours * MINUTES_PER_HOUR + extraMinutes

  return (
    <Panel
      heading={LOG_COPY.panelHeadings.duration}
      action={
        custom && (
          <MainAction
            label={LOG_COPY.confirmDuration}
            disabled={customTotal === 0}
            onClick={() => onPick(customTotal)}
          />
        )
      }
    >
      <ChipGroup label={LOG_COPY.panelHeadings.duration}>
        {DURATION_PRESETS.map((preset) => (
          <Chip
            key={preset}
            label={durationLabel(preset)}
            pressed={!custom && minutes === preset}
            onClick={() => onPick(preset)}
          />
        ))}
        <Chip label={LOG_COPY.otherDuration} pressed={custom} onClick={() => setCustom(true)} />
      </ChipGroup>
      {custom && (
        <div className="log-steppers">
          <Stepper
            label={LOG_COPY.hoursLabel}
            value={hours}
            max={MAX_HOURS}
            step={1}
            moreLabel={LOG_COPY.moreHours}
            fewerLabel={LOG_COPY.fewerHours}
            onChange={setHours}
          />
          <Stepper
            label={LOG_COPY.minutesLabel}
            value={extraMinutes}
            max={MAX_MINUTES}
            step={MINUTES_STEP}
            moreLabel={LOG_COPY.moreMinutes}
            fewerLabel={LOG_COPY.fewerMinutes}
            onChange={setExtraMinutes}
          />
        </div>
      )}
    </Panel>
  )
}
