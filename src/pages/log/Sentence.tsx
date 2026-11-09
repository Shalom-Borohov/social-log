import { MEETUP_COPY } from '../../copy/meetup'
import { LIST_SEPARATOR } from '../../domain/format'
import { dateWord, durationLabel, peopleLabel } from '../../domain/sentence'
import type { Group, Person } from '../../domain/types'
import { LOG_COPY } from './copy'
import type { DraftFields, Slot, Step } from './meetupDraft'

interface SentenceProps {
  draft: DraftFields
  step: Step
  today: string
  people: Person[]
  groups: Group[]
  onOpen: (slot: Slot) => void
}

interface SlotButtonProps {
  slot: Slot
  text: string | null
  step: Step
  onOpen: (slot: Slot) => void
}

function SlotButton({ slot, text, step, onOpen }: SlotButtonProps) {
  const filledClass = text === null ? 'log-slot-empty' : 'log-slot-filled'

  return (
    <button
      type="button"
      className={`log-slot ${filledClass}`}
      aria-current={step === slot ? 'step' : undefined}
      aria-label={LOG_COPY.slotLabel(LOG_COPY.slotRoles[slot], text ?? LOG_COPY.emptySlot)}
      onClick={() => onOpen(slot)}
    >
      {text ?? LOG_COPY.slotPlaceholders[slot]}
    </button>
  )
}

function slotTexts({ draft, today, people, groups }: SentenceProps): Record<Slot, string | null> {
  const place = draft.place.trim()

  return {
    date: dateWord(draft.date, today),
    people: draft.personIds.length > 0 ? peopleLabel(draft.personIds, people, groups, draft.groupId) : null,
    place: place === '' ? null : place,
    duration: draft.minutes === undefined ? null : durationLabel(draft.minutes),
    rating: draft.rating === undefined ? null : MEETUP_COPY.ratings[draft.rating],
  }
}

function extrasText({ activities, initiator }: DraftFields): string {
  const parts = initiator ? [...activities, LOG_COPY.initiated[initiator]] : activities

  return parts.join(LIST_SEPARATOR)
}

export function Sentence(props: SentenceProps) {
  const texts = slotTexts(props)
  const extras = extrasText(props.draft)

  const slotButton = (slot: Slot) => (
    <SlotButton slot={slot} text={texts[slot]} step={props.step} onOpen={props.onOpen} />
  )

  return (
    <div className="log-sentence">
      <h1>
        <span className="log-line">
          {slotButton('date')}
          {LOG_COPY.sawWord}
        </span>
        {slotButton('people')}
        {slotButton('place')}
        <span className="log-line">
          {LOG_COPY.forWord}
          {slotButton('duration')}
        </span>
        <span className="log-line">
          {LOG_COPY.andItWas}
          {slotButton('rating')}
        </span>
      </h1>
      {extras !== '' && <p className="log-sentence-extras">{extras}</p>}
    </div>
  )
}
