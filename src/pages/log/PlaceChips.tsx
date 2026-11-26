import { saveChoices } from '../../data/savedChoices'
import type { SavedChoice } from '../../domain/types'
import { useRemoveChoice } from '../../hooks/useRemoveWithUndo'
import { useSave } from '../../hooks/useSave'
import { LOG_COPY } from './copy'
import { Chip, ChipGroup, EditToggle, RemoveChip, SaveForNextTime } from './Panel'
import { useChipEditing } from './useChipEditing'

interface PlaceChipsProps {
  places: string[]
  savedPlaces: SavedChoice[]
  onTap: (place: string) => void
}

export function PlaceChips({ places, savedPlaces, onTap }: PlaceChipsProps) {
  const { editing, toggleEditing } = useChipEditing()
  const remove = useRemoveChoice('place')
  const save = useSave()
  const savedNames = savedPlaces.map(({ name }) => name)
  const unsaved = places.filter((place) => !savedNames.includes(place))
  const unpickedSaved = savedPlaces.filter(({ name }) => !places.includes(name))

  const chip = (place: string) => (
    <Chip key={place} label={place} pressed={places.includes(place)} disabled={editing} onClick={() => onTap(place)} />
  )

  return (
    <>
      {(unpickedSaved.length > 0 || editing) && <EditToggle editing={editing} onToggle={toggleEditing} />}
      {(savedPlaces.length > 0 || unsaved.length > 0) && (
        <ChipGroup label={LOG_COPY.savedPlaces}>
          {savedPlaces.map((saved) =>
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
          {unsaved.map((place) => chip(place))}
        </ChipGroup>
      )}
      {unsaved.map((place) => (
        <SaveForNextTime key={place} name={place} onSave={() => void save(saveChoices('place', [place]))} />
      ))}
    </>
  )
}
