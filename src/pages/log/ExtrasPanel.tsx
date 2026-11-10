import { useState } from 'react'
import { COMMON_COPY } from '../../copy/common'
import { MEETUP_COPY } from '../../copy/meetup'
import { INITIATORS, type SavedChoice } from '../../domain/types'
import { ActivityChips } from './ActivityChips'
import { AddField } from './AddField'
import { LOG_COPY } from './copy'
import type { DraftFields } from './meetupDraft'
import { MainAction, Panel } from './Panel'
import { useSplitPrompt } from './useSplitPrompt'

type Extras = Pick<DraftFields, 'activities' | 'initiator' | 'note'>

interface ExtrasPanelProps {
  extras: Extras
  savedActivities: SavedChoice[]
  saving: boolean
  onChange: (extras: Partial<Extras>) => void
  onSave: (activities: string[]) => void
  onDelete?: () => void
}

export function ExtrasPanel({ extras, savedActivities, saving, onChange, onSave, onDelete }: ExtrasPanelProps) {
  const { activities, initiator, note } = extras
  const [newActivity, setNewActivity] = useState('')
  const askSplit = useSplitPrompt()
  const typed = newActivity.trim()
  const withAdded = (names: string[]) => [...new Set([...activities, ...names])]

  function addActivities(names: string[]) {
    onChange({ activities: withAdded(names) })
    setNewActivity('')
  }

  const addNewActivity = () =>
    askSplit({
      text: typed,
      header: LOG_COPY.splitAddHeader,
      onParts: addActivities,
      onWhole: (text) => addActivities([text]),
    })

  const actions = (
    <div className="log-actions">
      <MainAction
        label={COMMON_COPY.save}
        disabled={saving}
        onClick={() => onSave(typed === '' ? activities : withAdded([typed]))}
      />
      {onDelete && (
        <button type="button" className="log-delete" onClick={onDelete}>
          {COMMON_COPY.delete}
        </button>
      )}
    </div>
  )

  return (
    <Panel heading={LOG_COPY.panelHeadings.extras} action={actions}>
      <ActivityChips
        activities={activities}
        savedActivities={savedActivities}
        onChange={(activities) => onChange({ activities })}
      />
      <AddField label={LOG_COPY.otherActivity} value={newActivity} onChange={setNewActivity} onAdd={addNewActivity} />
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
