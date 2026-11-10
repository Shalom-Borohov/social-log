import { saveChoices } from '../../data/savedChoices'
import type { SavedChoice } from '../../domain/types'
import { useRemoveChoice } from '../../hooks/useRemoveWithUndo'
import { useSave } from '../../hooks/useSave'
import { LOG_COPY } from './copy'
import { toggledIn } from './meetupDraft'
import { Chip, ChipGroup, EditToggle, RemoveChip, SaveForNextTime } from './Panel'
import { useChipEditing } from './useChipEditing'

interface ActivityChipsProps {
  activities: string[]
  savedActivities: SavedChoice[]
  onChange: (activities: string[]) => void
}

export function ActivityChips({ activities, savedActivities, onChange }: ActivityChipsProps) {
  const { editing, toggleEditing } = useChipEditing()
  const remove = useRemoveChoice('activity')
  const save = useSave()
  const savedNames = savedActivities.map(({ name }) => name)
  const unsaved = activities.filter((activity) => !savedNames.includes(activity))
  const unpickedSaved = savedActivities.filter(({ name }) => !activities.includes(name))

  const chip = (activity: string) => (
    <Chip
      key={activity}
      label={activity}
      pressed={activities.includes(activity)}
      disabled={editing}
      onClick={() => onChange(toggledIn(activities, activity))}
    />
  )

  return (
    <>
      {(unpickedSaved.length > 0 || editing) && <EditToggle editing={editing} onToggle={toggleEditing} />}
      <ChipGroup label={LOG_COPY.activities}>
        {savedActivities.map((saved) =>
          editing && unpickedSaved.includes(saved) ? (
            <RemoveChip
              key={saved.name}
              label={saved.name}
              removeLabel={LOG_COPY.removeChip(saved.name)}
              onRemove={() => void remove(saved)}
            />
          ) : (
            chip(saved.name)
          ),
        )}
        {unsaved.map((activity) => chip(activity))}
      </ChipGroup>
      {unsaved.map((activity) => (
        <SaveForNextTime
          key={activity}
          name={activity}
          onSave={() => void save(saveChoices('activity', [activity]))}
        />
      ))}
    </>
  )
}
