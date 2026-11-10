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
  useIonActionSheet,
  useIonAlert,
} from '@ionic/react'
import { COMMON_COPY } from '../../copy/common'
import { useGroups, useMeetups, usePeople } from '../../data/hooks'
import { forgetUnusedPeople, setPersonHidden } from '../../data/repo'
import { isUnused } from '../../domain/person'
import type { Person } from '../../domain/types'
import { useSave } from '../../hooks/useSave'
import { SETTINGS_PATH } from '../../navigation/paths'
import { SETTINGS_COPY } from './copy'

export function FriendsSettingsPage() {
  const people = usePeople() ?? []
  const meetups = useMeetups()
  const groups = useGroups()
  const [presentActions] = useIonActionSheet()
  const [presentAlert] = useIonAlert()
  const save = useSave()

  function confirmDelete({ id, name }: Person) {
    void presentAlert({
      header: SETTINGS_COPY.deletePersonHeader(name),
      message: COMMON_COPY.deleteCannotBeUndone,
      buttons: [
        { text: COMMON_COPY.cancel, role: 'cancel' },
        { text: COMMON_COPY.delete, role: 'destructive', handler: () => void save(forgetUnusedPeople([id])) },
      ],
    })
  }

  function openActions(person: Person) {
    const { id, name, hidden } = person
    const deletable = meetups !== undefined && groups !== undefined && isUnused(id, meetups, groups)

    void presentActions({
      header: name,
      buttons: [
        {
          text: hidden ? COMMON_COPY.showInOrbit : SETTINGS_COPY.hideFromOrbit,
          handler: () => void save(setPersonHidden(id, !hidden)),
        },
        ...(deletable
          ? [{ text: COMMON_COPY.delete, role: 'destructive', handler: () => confirmDelete(person) }]
          : []),
        { text: COMMON_COPY.cancel, role: 'cancel' },
      ],
    })
  }

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton defaultHref={SETTINGS_PATH} text={COMMON_COPY.settings} />
          </IonButtons>
          <IonTitle>{COMMON_COPY.friends}</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent>
        <IonList inset>
          {people.map((person) => (
            <IonItem key={person.id} button detail={false} onClick={() => openActions(person)}>
              <IonLabel>{person.name}</IonLabel>
              {person.hidden && <IonNote slot="end">{COMMON_COPY.hiddenFromOrbit}</IonNote>}
            </IonItem>
          ))}
        </IonList>
        <IonNote className="list-footer">{SETTINGS_COPY.deleteRule}</IonNote>
      </IonContent>
    </IonPage>
  )
}
