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
import { useMeetups, usePeople } from '../../data/hooks'
import { peopleBySince } from '../../domain/orbit'
import { useToday } from '../../hooks/useToday'
import { FRIENDS_PATH, personPath } from '../../navigation/paths'
import { FRIENDS_COPY } from './copy'
import { agoLabel } from './sinceLabel'

export function AllFriendsPage() {
  const today = useToday()
  const people = usePeople()
  const meetups = useMeetups()

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton defaultHref={FRIENDS_PATH} text={COMMON_COPY.friends} />
          </IonButtons>
          <IonTitle>{FRIENDS_COPY.everyone}</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent>
        {people && meetups && (
          <IonList inset>
            {peopleBySince(people, meetups, today).map(({ person, daysSince }) => (
              <IonItem key={person.id} button routerLink={personPath(person.id)}>
                <IonLabel>
                  <h2>{person.name}</h2>
                  {person.hidden && <p>{FRIENDS_COPY.hiddenFromOrbit}</p>}
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
