import {
  IonButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
  useIonRouter,
} from '@ionic/react'
import { useMeetups, usePeople } from '../../data/hooks'
import { orbitPeople } from '../../domain/orbit'
import { personSummary } from '../../domain/person'
import { mostOverdue } from '../../domain/rhythm'
import type { Meetup, Person } from '../../domain/types'
import { useToday } from '../../hooks/useToday'
import { ALL_FRIENDS_PATH, personPath } from '../../navigation/paths'
import { FRIENDS_COPY } from './copy'
import { NudgeCard } from './NudgeCard'
import { OrbitField } from './OrbitField'
import './friends.css'

interface FriendsOrbitProps {
  people: Person[]
  meetups: Meetup[]
  today: string
  onOpen: (personId: string) => void
}

function FriendsOrbit({ people, meetups, today, onOpen }: FriendsOrbitProps) {
  if (meetups.length === 0) {
    return <p className="friends-empty">{FRIENDS_COPY.emptyOrbit}</p>
  }

  const orbit = orbitPeople(people, meetups, today)
  const overdue = mostOverdue(people, meetups, today)

  return (
    <>
      <OrbitField orbit={orbit} overdueId={overdue?.person.id} onOpen={onOpen} />
      {overdue && (
        <NudgeCard
          person={overdue.person}
          daysSince={overdue.daysSince}
          lastMeetup={personSummary(overdue.person.id, meetups).history[0]}
          onOpen={onOpen}
        />
      )}
    </>
  )
}

export function FriendsPage() {
  const today = useToday()
  const people = usePeople()
  const meetups = useMeetups()
  const router = useIonRouter()

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>{FRIENDS_COPY.orbitTitle}</IonTitle>
          <IonButtons slot="end">
            <IonButton routerLink={ALL_FRIENDS_PATH}>{FRIENDS_COPY.everyone}</IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen>
        <IonHeader collapse="condense">
          <IonToolbar>
            <IonTitle size="large">
              {FRIENDS_COPY.orbitTitle}
            </IonTitle>
          </IonToolbar>
        </IonHeader>
        <p className="friends-subtitle">{FRIENDS_COPY.orbitSubtitle}</p>
        {people && meetups && (
          <FriendsOrbit
            people={people}
            meetups={meetups}
            today={today}
            onOpen={(personId) => router.push(personPath(personId))}
          />
        )}
      </IonContent>
    </IonPage>
  )
}
