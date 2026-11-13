import {
  IonBackButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonItem,
  IonLabel,
  IonList,
  IonNote,
  IonPage,
  IonTitle,
  IonToolbar,
} from '@ionic/react'
import { COMMON_COPY } from '../../copy/common'
import { useMeetups } from '../../data/hooks'
import type { PeopleTab } from '../../domain/circles'
import { peopleBySince } from '../../domain/orbit'
import { useToday } from '../../hooks/useToday'
import { personPath, tabPath } from '../../navigation/paths'
import { FRIENDS_COPY } from './copy'
import { agoLabel } from './sinceLabel'
import { useTabPeople } from './useTabPeople'

export function AllFriendsPage({ tab }: { tab: PeopleTab }) {
  const today = useToday()
  const people = useTabPeople(tab)
  const meetups = useMeetups()

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton defaultHref={tabPath(tab)} text={COMMON_COPY[tab]} />
          </IonButtons>
          <IonTitle>{FRIENDS_COPY.everyone}</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent>
        {people && meetups && (
          <IonList inset>
            {peopleBySince(people, meetups, today).map(({ person, daysSince }) => (
              <IonItem key={person.id} button routerLink={personPath(tab, person.id)}>
                <IonLabel>
                  <h2>{person.name}</h2>
                  {person.hidden && <p>{COMMON_COPY.hiddenFromOrbit}</p>}
                </IonLabel>
                <IonNote slot="end">{daysSince === null ? FRIENDS_COPY.neverMet : agoLabel(daysSince)}</IonNote>
              </IonItem>
            ))}
          </IonList>
        )}
      </IonContent>
    </IonPage>
  )
}
