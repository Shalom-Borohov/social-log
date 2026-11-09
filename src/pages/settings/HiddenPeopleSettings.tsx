import { IonButton, IonItem, IonLabel, IonList, IonListHeader } from '@ionic/react'
import { usePeople } from '../../data/hooks'
import { setPersonHidden } from '../../data/repo'
import { useSave } from '../../hooks/useSave'
import { SETTINGS_COPY } from './copy'

export function HiddenPeopleSettings() {
  const hiddenPeople = (usePeople() ?? []).filter((person) => person.hidden)
  const save = useSave()

  if (hiddenPeople.length === 0) {
    return null
  }

  return (
    <>
      <IonListHeader>
        <IonLabel>{SETTINGS_COPY.hiddenFromOrbit}</IonLabel>
      </IonListHeader>
      <IonList inset>
        {hiddenPeople.map((person) => (
          <IonItem key={person.id}>
            <IonLabel>{person.name}</IonLabel>
            <IonButton
              slot="end"
              fill="clear"
              aria-label={SETTINGS_COPY.showInOrbit(person.name)}
              onClick={() => void save(setPersonHidden(person.id, false))}
            >
              {SETTINGS_COPY.show}
            </IonButton>
          </IonItem>
        ))}
      </IonList>
    </>
  )
}
