import type { ReactNode } from 'react'
import { inSavedOrder, placesByLastUse } from '../../domain/choices'
import type { Group, Meetup, Person, SavedChoice } from '../../domain/types'
import { DatePanel } from './DatePanel'
import { DurationPanel } from './DurationPanel'
import { ExtrasPanel } from './ExtrasPanel'
import { completeDraft, type DraftFields, type Step } from './meetupDraft'
import { PeoplePanel } from './PeoplePanel'
import { PlacePanel } from './PlacePanel'
import { RatingPanel } from './RatingPanel'
import { Sentence } from './Sentence'
import type { useLogActions } from './useLogActions'
import { useMeetupDraft } from './useMeetupDraft'

interface MeetupFormProps {
  initial: DraftFields
  meetupId?: string
  today: string
  people: Person[]
  groups: Group[]
  meetups: Meetup[]
  savedPlaces: SavedChoice[]
  savedActivities: SavedChoice[]
  actions: ReturnType<typeof useLogActions>
}

export function MeetupForm({
  initial,
  meetupId,
  today,
  people,
  groups,
  meetups,
  savedPlaces,
  savedActivities,
  actions,
}: MeetupFormProps) {
  const { draft, step, update, fill, open } = useMeetupDraft(initial)
  const complete = completeDraft(draft)

  const panels: Record<Step, () => ReactNode> = {
    date: () => (
      <DatePanel
        date={draft.date}
        today={today}
        onChange={(date) => update({ date })}
        onPick={(date) => fill({ date })}
        onNext={() => fill()}
      />
    ),
    people: () => (
      <PeoplePanel
        choice={draft}
        meetupId={meetupId}
        people={people}
        groups={groups}
        meetups={meetups}
        onChange={update}
        onNewPerson={actions.rememberNewPerson}
        onNext={() => fill()}
      />
    ),
    place: () => (
      <PlacePanel
        place={draft.place}
        savedPlaces={placesByLastUse(savedPlaces, meetups)}
        onChange={(place) => update({ place })}
        onPick={(place) => fill({ place })}
        onNext={() => fill()}
      />
    ),
    duration: () => <DurationPanel minutes={draft.minutes} onPick={(minutes) => fill({ minutes })} />,
    rating: () => <RatingPanel rating={draft.rating} onPick={(rating) => fill({ rating })} />,
    extras: () => (
      <ExtrasPanel
        extras={draft}
        savedActivities={inSavedOrder(savedActivities)}
        saving={actions.saving}
        onChange={update}
        onSave={(activities) => complete && void actions.saveMeetup({ ...complete, activities })}
        onDelete={meetupId ? () => actions.confirmDelete(meetupId) : undefined}
      />
    ),
  }

  return (
    <>
      <Sentence draft={draft} step={step} today={today} people={people} groups={groups} onOpen={open} />
      {panels[step]()}
    </>
  )
}
