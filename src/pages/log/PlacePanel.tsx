import type { FormEvent } from 'react'
import { saveChoices } from '../../data/savedChoices'
import { splitParts } from '../../domain/split'
import type { SavedChoice } from '../../domain/types'
import { useSave } from '../../hooks/useSave'
import { LOG_COPY } from './copy'
import { type DraftFields, toggledIn } from './meetupDraft'
import { MainAction, Panel, SaveForNextTime } from './Panel'
import { PlaceChips } from './PlaceChips'
import { useSplitPrompt } from './useSplitPrompt'

type PlaceFields = Pick<DraftFields, 'places' | 'placeText'>

interface PlacePanelProps {
  fields: PlaceFields
  savedPlaces: SavedChoice[]
  onChange: (changes: Partial<PlaceFields>) => void
  onMoveOn: (changes: Partial<PlaceFields>) => void
}

export function PlacePanel({ fields, savedPlaces, onChange, onMoveOn }: PlacePanelProps) {
  const { places, placeText } = fields
  const typed = placeText.trim()
  const noPlaceYet = places.length === 0
  const askSplit = useSplitPrompt()
  const save = useSave()
  const savedNames = savedPlaces.map(({ name }) => name)
  const alreadySaved = savedNames.includes(typed) || splitParts(typed).every((part) => savedNames.includes(part))
  const unsaved = typed !== '' && !alreadySaved

  function addTyped(moveOn: boolean) {
    const add = (names: string[]) =>
      (moveOn ? onMoveOn : onChange)({ places: [...new Set([...places, ...names])], placeText: '' })

    askSplit({ text: typed, header: LOG_COPY.splitAddHeader, onParts: add, onWhole: (text) => add([text]) })
  }

  function submit(event: FormEvent) {
    event.preventDefault()
    addTyped(noPlaceYet)
  }

  const next = () => (typed === '' ? onMoveOn({}) : addTyped(true))

  const tapChip = (place: string) =>
    noPlaceYet ? onMoveOn({ places: [place], placeText: '' }) : onChange({ places: toggledIn(places, place) })

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
      action={<MainAction label={LOG_COPY.next} disabled={noPlaceYet && typed === ''} onClick={next} />}
    >
      <form className="log-add-field" onSubmit={submit}>
        <input
          aria-label={LOG_COPY.place}
          placeholder={LOG_COPY.placePlaceholder}
          enterKeyHint={noPlaceYet ? 'next' : 'done'}
          value={placeText}
          onChange={(event) => onChange({ placeText: event.target.value })}
        />
      </form>
      {unsaved && <SaveForNextTime name={typed} onSave={saveTyped} />}
      <PlaceChips places={places} savedPlaces={savedPlaces} onTap={tapChip} />
    </Panel>
  )
}
