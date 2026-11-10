import type { FormEvent } from 'react'
import { hidePlace, showPlace } from '../../data/repo'
import { LOG_COPY } from './copy'
import { Chip, ChipGroup, EditToggle, MainAction, Panel, RemoveChip } from './Panel'
import { useChipEditing } from './useChipEditing'

interface PlacePanelProps {
  place: string
  recentPlaces: string[]
  onChange: (place: string) => void
  onPick: (place: string) => void
  onNext: () => void
}

export function PlacePanel({ place, recentPlaces, onChange, onPick, onNext }: PlacePanelProps) {
  const empty = place.trim() === ''
  const { editing, toggleEditing, hideWithUndo } = useChipEditing()

  function submit(event: FormEvent) {
    event.preventDefault()

    if (!empty) {
      onNext()
    }
  }

  const hide = (recent: string) =>
    hideWithUndo(
      () => hidePlace(recent),
      () => showPlace(recent),
      LOG_COPY.placeHidden(recent),
    )

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
      {recentPlaces.length > 0 && (
        <>
          <EditToggle editing={editing} onToggle={toggleEditing} />
          <ChipGroup label={LOG_COPY.recentPlaces}>
            {recentPlaces.map((recent) =>
              editing ? (
                <RemoveChip key={recent} label={recent} onRemove={() => void hide(recent)} />
              ) : (
                <Chip key={recent} label={recent} pressed={recent === place.trim()} onClick={() => onPick(recent)} />
              ),
            )}
          </ChipGroup>
        </>
      )}
    </Panel>
  )
}
