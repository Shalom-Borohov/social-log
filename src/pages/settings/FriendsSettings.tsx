import { IonItem, IonLabel, IonList, IonNote } from '@ionic/react'
import { COMMON_COPY } from '../../copy/common'
import { usePeople } from '../../data/hooks'
import { SETTINGS_FRIENDS_PATH } from '../../navigation/paths'

export function FriendsSettings() {
  const people = usePeople() ?? []

  if (people.length === 0) {
    return null
  }

  return (
    <IonList inset>
      <IonItem button routerLink={SETTINGS_FRIENDS_PATH}>
        <IonLabel>{COMMON_COPY.friends}</IonLabel>
        <IonNote slot="end">{people.length}</IonNote>
      </IonItem>
    </IonList>
  )
}
