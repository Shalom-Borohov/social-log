import { IonContent, IonIcon, IonPage } from '@ionic/react'
import { close } from 'ionicons/icons'
import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { COMMON_COPY } from '../../copy/common'
import { useGroups, useMeetups, usePeople } from '../../data/hooks'
import type { Meetup } from '../../domain/types'
import { useToday } from '../../hooks/useToday'
import { LOG_COPY } from './copy'
import './log.css'
import './log-fields.css'
import { type DraftFields, draftFromMeetup, emptyDraft } from './meetupDraft'
import { MeetupForm } from './MeetupForm'
import { useLogActions } from './useLogActions'

export function LogPage() {
  const { meetupId } = useParams()
  const today = useToday()
  const meetups = useMeetups()
  const people = usePeople() ?? []
  const groups = useGroups() ?? []
  const actions = useLogActions(meetupId)
  const found = meetups?.find((meetup) => meetup.id === meetupId)
  const [opened, setOpened] = useState<Meetup>()

  if (found && found.id !== opened?.id) {
    setOpened(found)
  }

  const editing = opened?.id === meetupId ? opened : found

  const form = (initial: DraftFields) => (
    <MeetupForm
      key={meetupId}
      initial={initial}
      meetupId={meetupId}
      today={today}
      people={people}
      groups={groups}
      meetups={meetups ?? []}
      actions={actions}
    />
  )

  function body() {
    if (!meetupId) {
      return form(emptyDraft(today))
    }

    if (!meetups) {
      return null
    }

    return editing ? form(draftFromMeetup(editing)) : <p className="log-not-found">{LOG_COPY.notFound}</p>
  }

  return (
    <IonPage>
      <IonContent>
        <div className="log-screen">
          <button type="button" className="log-close" aria-label={COMMON_COPY.close} onClick={actions.close}>
            <IonIcon icon={close} aria-hidden="true" />
          </button>
          {body()}
        </div>
      </IonContent>
    </IonPage>
  )
}
