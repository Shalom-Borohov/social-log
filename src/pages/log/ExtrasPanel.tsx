import { useState } from 'react'
import { COMMON_COPY } from '../../copy/common'
import { MEETUP_COPY } from '../../copy/meetup'
import { INITIATORS } from '../../domain/types'
import { AddField } from './AddField'
import { LOG_COPY } from './copy'
import { type DraftFields, toggledIn } from './meetupDraft'
import { Chip, ChipGroup, MainAction, Panel } from './Panel'

type Extras = Pick<DraftFields, 'activities' | 'initiator' | 'note'>

interface ExtrasPanelProps {
  extras: Extras
  ownActivities: string[]
  saving: boolean
  onChange: (extras: Partial<Extras>) => void
  onSave: () => void
  onDelete?: () => void
}

export function ExtrasPanel({ extras, ownActivities, saving, onChange, onSave, onDelete }: ExtrasPanelProps) {
  const { activities, initiator, note } = extras
  const [newActivity, setNewActivity] = useState('')
  const offered = [...new Set([...MEETUP_COPY.activityPresets, ...ownActivities, ...activities])]

  function addActivity() {
    const activity = newActivity.trim()

    onChange({ activities: activities.includes(activity) ? activities : [...activities, activity] })
    setNewActivity('')
  }

  const actions = (
    <div className="log-actions">
      <MainAction label={COMMON_COPY.save} disabled={saving} onClick={onSave} />
      {onDelete && (
        <button type="button" className="log-delete" onClick={onDelete}>
          {COMMON_COPY.delete}
        </button>
      )}
    </div>
  )

  return (
    <Panel heading={LOG_COPY.panelHeadings.extras} action={actions}>
      <ChipGroup label={LOG_COPY.activities}>
        {offered.map((activity) => (
          <Chip
            key={activity}
            label={activity}
            pressed={activities.includes(activity)}
            onClick={() => onChange({ activities: toggledIn(activities, activity) })}
          />
        ))}
      </ChipGroup>
      <AddField label={LOG_COPY.otherActivity} value={newActivity} onChange={setNewActivity} onAdd={addActivity} />
      <div className="log-segmented" role="group" aria-label={LOG_COPY.initiator}>
        <span className="log-segmented-label">{LOG_COPY.initiator}</span>
        {INITIATORS.map((option) => (
          <button
            key={option}
            type="button"
            aria-pressed={initiator === option}
            onClick={() => onChange({ initiator: initiator === option ? undefined : option })}
          >
            {MEETUP_COPY.initiators[option]}
          </button>
        ))}
      </div>
      <label className="log-field">
        <span>{LOG_COPY.note}</span>
        <textarea rows={3} value={note} onChange={(event) => onChange({ note: event.target.value })} />
      </label>
    </Panel>
  )
}
