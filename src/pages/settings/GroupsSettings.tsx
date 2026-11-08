import { IonItem, IonLabel, IonList, IonListHeader, IonNote, useIonActionSheet, useIonAlert } from '@ionic/react'
import { COMMON_COPY } from '../../copy/common'
import { useGroups } from '../../data/hooks'
import { deleteGroup, renameGroup } from '../../data/repo'
import type { Group } from '../../domain/types'
import { useNamePrompt } from '../../hooks/useNamePrompt'
import { useSave } from '../../hooks/useSave'
import { SETTINGS_COPY } from './copy'

export function GroupsSettings() {
  const groups = useGroups() ?? []
  const [presentActions] = useIonActionSheet()
  const [presentAlert] = useIonAlert()
  const promptName = useNamePrompt()
  const save = useSave()

  function rename({ id, name }: Group) {
    promptName({
      header: COMMON_COPY.rename,
      label: COMMON_COPY.name,
      name,
      onName: (newName) => void save(renameGroup(id, newName)),
    })
  }

  function confirmDelete({ id }: Group) {
    void presentAlert({
      header: SETTINGS_COPY.deleteGroupHeader,
      message: SETTINGS_COPY.deleteGroupMessage,
      buttons: [
        { text: COMMON_COPY.cancel, role: 'cancel' },
        { text: COMMON_COPY.delete, role: 'destructive', handler: () => void save(deleteGroup(id)) },
      ],
    })
  }

  function openActions(group: Group) {
    void presentActions({
      header: group.name,
      buttons: [
        { text: COMMON_COPY.rename, handler: () => rename(group) },
        { text: COMMON_COPY.delete, role: 'destructive', handler: () => confirmDelete(group) },
        { text: COMMON_COPY.cancel, role: 'cancel' },
      ],
    })
  }

  if (groups.length === 0) {
    return null
  }

  return (
    <>
      <IonListHeader>
        <IonLabel>{SETTINGS_COPY.groups}</IonLabel>
      </IonListHeader>
      <IonList inset>
        {groups.map((group) => (
          <IonItem key={group.id} button detail={false} onClick={() => openActions(group)}>
            <IonLabel>{group.name}</IonLabel>
            <IonNote slot="end">{SETTINGS_COPY.groupSize(group.memberIds.length)}</IonNote>
          </IonItem>
        ))}
      </IonList>
    </>
  )
}
