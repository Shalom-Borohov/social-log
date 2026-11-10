import type { ReactNode } from 'react'
import { MEETUP_COPY } from '../../copy/meetup'
import type { Group, Meetup, Person } from '../../domain/types'
import { DatePanel } from './DatePanel'
import { DurationPanel } from './DurationPanel'
import { ExtrasPanel } from './ExtrasPanel'
import { completeDraft, type DraftFields, type Step } from './meetupDraft'
import { PeoplePanel } from './PeoplePanel'
import { PlacePanel } from './PlacePanel'
import { RatingPanel } from './RatingPanel'
import { ownActivities, recentPlaces } from './recentChoices'
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
  hiddenPlaces: string[]
  actions: ReturnType<typeof useLogActions>
}

export function MeetupForm({
  initial,
  meetupId,
  today,
  people,
  groups,
  meetups,
  hiddenPlaces,
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
        people={people}
        groups={groups}
        onChange={update}
        onNewPerson={actions.rememberNewPerson}
        onNext={() => fill()}
      />
    ),
    place: () => (
      <PlacePanel
        place={draft.place}
        recentPlaces={recentPlaces(meetups, hiddenPlaces)}
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
        ownActivities={ownActivities(meetups, MEETUP_COPY.activityPresets)}
        saving={actions.saving}
        onChange={update}
        onSave={() => complete && void actions.saveMeetup(complete)}
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
