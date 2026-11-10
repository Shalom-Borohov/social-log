import type { FormEvent } from 'react'
import { saveChoices } from '../../data/savedChoices'
import { splitParts } from '../../domain/split'
import type { SavedChoice } from '../../domain/types'
import { useRemoveChoice } from '../../hooks/useRemoveWithUndo'
import { useSave } from '../../hooks/useSave'
import { LOG_COPY } from './copy'
import { Chip, ChipGroup, EditToggle, MainAction, Panel, RemoveChip, SaveForNextTime } from './Panel'
import { useChipEditing } from './useChipEditing'
import { useSplitPrompt } from './useSplitPrompt'

interface PlacePanelProps {
  place: string
  savedPlaces: SavedChoice[]
  onChange: (place: string) => void
  onPick: (place: string) => void
  onNext: () => void
}

export function PlacePanel({ place, savedPlaces, onChange, onPick, onNext }: PlacePanelProps) {
  const typed = place.trim()
  const empty = typed === ''
  const { editing, toggleEditing } = useChipEditing()
  const remove = useRemoveChoice('place')
  const askSplit = useSplitPrompt()
  const save = useSave()
  const savedNames = savedPlaces.map(({ name }) => name)
  const alreadySaved = savedNames.includes(typed) || splitParts(typed).every((part) => savedNames.includes(part))
  const unsaved = !empty && !alreadySaved

  function submit(event: FormEvent) {
    event.preventDefault()

    if (!empty) {
      onNext()
    }
  }

  const saveTyped = () =>
    askSplit({
      text: typed,
      header: LOG_COPY.splitSaveHeader,
      onParts: (parts) => void save(saveChoices('place', parts)),
      onWhole: (text) => void save(saveChoices('place', [text])),
    })

  return (
    <Panel
      heading={LOG_COPY.panelHeadings.place}
      action={<MainAction label={LOG_COPY.next} disabled={empty} onClick={onNext} />}
    >
      <form className="log-add-field" onSubmit={submit}>
        <input
          aria-label={LOG_COPY.place}
          placeholder={LOG_COPY.placePlaceholder}
          enterKeyHint="next"
          value={place}
          onChange={(event) => onChange(event.target.value)}
        />
      </form>
      {unsaved && <SaveForNextTime name={typed} onSave={saveTyped} />}
      {(savedPlaces.length > 0 || editing) && (
        <>
          <EditToggle editing={editing} onToggle={toggleEditing} />
          <ChipGroup label={LOG_COPY.savedPlaces}>
            {savedPlaces.map((saved) =>
              editing ? (
                <RemoveChip
                  key={saved.name}
                  label={saved.name}
                  removeLabel={LOG_COPY.removeChip(saved.name)}
                  onRemove={() => void remove(saved)}
                />
              ) : (
                <Chip
                  key={saved.name}
                  label={saved.name}
                  pressed={saved.name === typed}
                  onClick={() => onPick(saved.name)}
                />
              ),
            )}
          </ChipGroup>
        </>
      )}
    </Panel>
  )
}
