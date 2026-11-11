import {
  IonBackButton,
  IonButton,
  IonButtons,
  IonCheckbox,
  IonContent,
  IonHeader,
  IonItem,
  IonLabel,
  IonList,
  IonPage,
  IonTitle,
  IonToolbar,
  useIonAlert,
  useIonRouter,
} from '@ionic/react'
import { useEffect, useEffectEvent } from 'react'
import { useParams } from 'react-router-dom'
import { COMMON_COPY } from '../../copy/common'
import { deleteCircle, renameCircle, setCircleMember } from '../../data/circles'
import { useCircles, usePeople } from '../../data/hooks'
import type { Circle } from '../../domain/types'
import { useNamePrompt } from '../../hooks/useNamePrompt'
import { useSave } from '../../hooks/useSave'
import { SETTINGS_CIRCLES_PATH } from '../../navigation/paths'
import { SETTINGS_COPY } from './copy'

export function CircleSettingsPage() {
  const { circleId } = useParams()
  const circles = useCircles()
  const circle = circles?.find(({ id }) => id === circleId)
  const missing = circles !== undefined && circle === undefined
  const people = usePeople() ?? []
  const router = useIonRouter()
  const [presentAlert] = useIonAlert()
  const promptName = useNamePrompt()
  const save = useSave()

  const backToCircles = useEffectEvent(() => {
    if (router.canGoBack()) {
      router.goBack()

      return
    }

    router.push(SETTINGS_CIRCLES_PATH, 'back', 'replace')
  })

  useEffect(() => {
    if (missing) {
      backToCircles()
    }
  }, [missing])

  function rename({ id, name }: Circle) {
    promptName({
      header: COMMON_COPY.rename,
      label: COMMON_COPY.name,
      name,
      onName: (newName) => void save(renameCircle(id, newName)),
    })
  }

  function confirmDelete({ id, name }: Circle) {
    void presentAlert({
      header: SETTINGS_COPY.deleteCircleHeader(name),
      message: SETTINGS_COPY.deleteCircleMessage,
      buttons: [
        { text: COMMON_COPY.cancel, role: 'cancel' },
        { text: COMMON_COPY.delete, role: 'destructive', handler: () => void save(deleteCircle(id)) },
      ],
    })
  }

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton defaultHref={SETTINGS_CIRCLES_PATH} text={SETTINGS_COPY.circles} />
          </IonButtons>
          <IonTitle>{circle?.name}</IonTitle>
          {circle && (
            <IonButtons slot="end">
              <IonButton onClick={() => rename(circle)}>{COMMON_COPY.rename}</IonButton>
            </IonButtons>
          )}
        </IonToolbar>
      </IonHeader>
      <IonContent>
        {circle && (
          <>
            <IonList inset>
              {people.map((person) => (
                <IonItem key={person.id}>
                  <IonCheckbox
                    justify="space-between"
                    checked={circle.memberIds.includes(person.id)}
                    helperText={person.hidden ? COMMON_COPY.hiddenFromOrbit : undefined}
                    onIonChange={(event) => void save(setCircleMember(circle.id, person.id, event.detail.checked))}
                  >
                    {person.name}
                  </IonCheckbox>
                </IonItem>
              ))}
            </IonList>
            <IonList inset>
              <IonItem button detail={false} onClick={() => confirmDelete(circle)}>
                <IonLabel color="danger">{COMMON_COPY.delete}</IonLabel>
              </IonItem>
            </IonList>
          </>
        )}
      </IonContent>
    </IonPage>
  )
}
