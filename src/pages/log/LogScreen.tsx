import { IonContent, IonIcon } from '@ionic/react'
import { close } from 'ionicons/icons'
import { useState } from 'react'
import { COMMON_COPY } from '../../copy/common'
import { useGroups, useHiddenPlaces, useMeetups, usePeople } from '../../data/hooks'
import type { Meetup } from '../../domain/types'
import { useToday } from '../../hooks/useToday'
import { LOG_COPY } from './copy'
import './log.css'
import './log-fields.css'
import { type DraftFields, draftFromMeetup, emptyDraft, newMeetupDate } from './meetupDraft'
import { MeetupForm } from './MeetupForm'
import { useLogActions } from './useLogActions'

interface LogScreenProps {
  meetupId: string | undefined
  requestedDate: string | null
}

export function LogScreen({ meetupId, requestedDate }: LogScreenProps) {
  const today = useToday()
  const meetups = useMeetups()
  const people = usePeople() ?? []
  const groups = useGroups() ?? []
  const hiddenPlaces = useHiddenPlaces() ?? []
  const actions = useLogActions(meetupId)
  const found = meetups?.find((meetup) => meetup.id === meetupId)
  const [opened, setOpened] = useState<Meetup>()

  if (found && !opened) {
    setOpened(found)
  }

  const editing = opened ?? found

  const form = (initial: DraftFields) => (
    <MeetupForm
      initial={initial}
      meetupId={meetupId}
      today={today}
      people={people}
      groups={groups}
      meetups={meetups ?? []}
      hiddenPlaces={hiddenPlaces}
      actions={actions}
    />
  )

  function body() {
    if (!meetupId) {
      return form(emptyDraft(newMeetupDate(requestedDate, today)))
    }

    if (!meetups) {
      return null
    }

    return editing ? form(draftFromMeetup(editing)) : <p className="log-not-found">{LOG_COPY.notFound}</p>
  }

  return (
    <IonContent>
      <div className="log-screen">
        <button type="button" className="log-close" aria-label={COMMON_COPY.close} onClick={actions.close}>
          <IonIcon icon={close} aria-hidden="true" />
        </button>
        {body()}
      </div>
    </IonContent>
  )
}
