import type { FormEvent } from 'react'
import { LOG_COPY } from './copy'
import { Chip, ChipGroup, MainAction, Panel } from './Panel'

interface PlacePanelProps {
  place: string
  recentPlaces: string[]
  onChange: (place: string) => void
  onPick: (place: string) => void
  onNext: () => void
}

export function PlacePanel({ place, recentPlaces, onChange, onPick, onNext }: PlacePanelProps) {
  const empty = place.trim() === ''

  function submit(event: FormEvent) {
    event.preventDefault()

    if (!empty) {
      onNext()
    }
  }

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
        <ChipGroup label={LOG_COPY.recentPlaces}>
          {recentPlaces.map((recent) => (
            <Chip key={recent} label={recent} pressed={recent === place.trim()} onClick={() => onPick(recent)} />
          ))}
        </ChipGroup>
      )}
    </Panel>
  )
}
