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
import { useMeetups } from '../../data/hooks'
import { FAMILY_CIRCLE_ID, type PeopleTab } from '../../domain/circles'
import { orbitPeople, peopleBySince } from '../../domain/orbit'
import { personSummary } from '../../domain/person'
import { mostOverdue } from '../../domain/rhythm'
import type { Meetup, Person } from '../../domain/types'
import { useToday } from '../../hooks/useToday'
import { allPeoplePath, circleSettingsPath, personPath } from '../../navigation/paths'
import { FRIENDS_COPY } from './copy'
import { NudgeCard } from './NudgeCard'
import { OrbitField } from './OrbitField'
import { useTabPeople } from './useTabPeople'
import './friends.css'

interface FriendsOrbitProps {
  tab: PeopleTab
  people: Person[]
  meetups: Meetup[]
  today: string
  onOpen: (personId: string) => void
}

function NoFamilyYet() {
  return (
    <div className="friends-empty">
      <p>{FRIENDS_COPY.noFamilyYet}</p>
      <IonButton routerLink={circleSettingsPath(FAMILY_CIRCLE_ID)}>{FRIENDS_COPY.pickFamily}</IonButton>
    </div>
  )
}

function FriendsOrbit({ tab, people, meetups, today, onOpen }: FriendsOrbitProps) {
  if (tab === 'family' && people.length === 0) {
    return <NoFamilyYet />
  }

  if (peopleBySince(people, meetups, today).every(({ daysSince }) => daysSince === null)) {
    return <p className="friends-empty">{FRIENDS_COPY.emptyOrbit[tab]}</p>
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

export function FriendsPage({ tab }: { tab: PeopleTab }) {
  const today = useToday()
  const people = useTabPeople(tab)
  const meetups = useMeetups()
  const router = useIonRouter()

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>{FRIENDS_COPY.orbitTitle}</IonTitle>
          <IonButtons slot="end">
            <IonButton routerLink={allPeoplePath(tab)}>{FRIENDS_COPY.everyone}</IonButton>
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
            tab={tab}
            people={people}
            meetups={meetups}
            today={today}
            onOpen={(personId) => router.push(personPath(tab, personId))}
          />
        )}
      </IonContent>
    </IonPage>
  )
}
