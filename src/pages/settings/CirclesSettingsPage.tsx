import {
  IonBackButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonIcon,
  IonItem,
  IonLabel,
  IonList,
  IonNote,
  IonPage,
  IonTitle,
  IonToolbar,
  useIonRouter,
} from '@ionic/react'
import { add } from 'ionicons/icons'
import { COMMON_COPY } from '../../copy/common'
import { saveCircle } from '../../data/circles'
import { useCircles } from '../../data/hooks'
import { isFamilyCircle } from '../../domain/circles'
import { useNamePrompt } from '../../hooks/useNamePrompt'
import { useCircleSave } from './useCircleSave'
import { circleSettingsPath, SETTINGS_PATH } from '../../navigation/paths'
import { SETTINGS_COPY } from './copy'

export function CirclesSettingsPage() {
  const circles = useCircles()
  const promptName = useNamePrompt()
  const router = useIonRouter()
  const save = useCircleSave()

  function createCircle() {
    promptName({
      header: SETTINGS_COPY.newCircle,
      label: COMMON_COPY.name,
      onName: (name) => void save(saveCircle(name).then(({ id }) => router.push(circleSettingsPath(id)))),
    })
  }

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton defaultHref={SETTINGS_PATH} text={COMMON_COPY.settings} />
          </IonButtons>
          <IonTitle>{SETTINGS_COPY.circles}</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent>
        <IonList inset>
          {circles?.map(({ id, name, memberIds }) => (
            <IonItem key={id} button routerLink={circleSettingsPath(id)}>
              <IonLabel>{name}</IonLabel>
              <IonNote slot="end">{SETTINGS_COPY.peopleCount(memberIds.length)}</IonNote>
            </IonItem>
          ))}
          <IonItem button detail={false} onClick={createCircle}>
            <IonIcon slot="start" color="primary" icon={add} aria-hidden="true" />
            <IonLabel>{SETTINGS_COPY.newCircle}</IonLabel>
          </IonItem>
        </IonList>
        {circles?.every(isFamilyCircle) && (
          <IonNote className="list-footer">{SETTINGS_COPY.circlesExplained}</IonNote>
        )}
      </IonContent>
    </IonPage>
  )
}
