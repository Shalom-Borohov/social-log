import { IonItem, IonLabel, IonList, IonNote } from '@ionic/react'
import { useCircles, usePeople } from '../../data/hooks'
import { SETTINGS_CIRCLES_PATH } from '../../navigation/paths'
import { SETTINGS_COPY } from './copy'

export function CirclesSettings() {
  const people = usePeople() ?? []
  const circles = useCircles() ?? []

  if (people.length === 0) {
    return null
  }

  return (
    <IonList inset>
      <IonItem button routerLink={SETTINGS_CIRCLES_PATH}>
        <IonLabel>{SETTINGS_COPY.circles}</IonLabel>
        <IonNote slot="end">{circles.length}</IonNote>
      </IonItem>
    </IonList>
  )
}
