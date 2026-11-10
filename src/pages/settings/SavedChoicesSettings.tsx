import { IonItem, IonLabel, IonList, IonListHeader, useIonActionSheet } from '@ionic/react'
import { COMMON_COPY } from '../../copy/common'
import { useMeetups, useSavedChoices } from '../../data/hooks'
import { ChoiceTakenError, renameChoice } from '../../data/savedChoices'
import { orderedChoices } from '../../domain/choices'
import type { ChoiceKind, SavedChoice } from '../../domain/types'
import { useNamePrompt } from '../../hooks/useNamePrompt'
import { useRemoveChoice } from '../../hooks/useRemoveWithUndo'
import { useToast } from '../../hooks/useToast'
import { SETTINGS_COPY } from './copy'

interface SavedChoicesSettingsProps {
  kind: ChoiceKind
}

export function SavedChoicesSettings({ kind }: SavedChoicesSettingsProps) {
  const choices = orderedChoices(kind, useSavedChoices(kind) ?? [], useMeetups() ?? [])
  const [presentActions] = useIonActionSheet()
  const promptName = useNamePrompt()
  const { toast } = useToast()
  const remove = useRemoveChoice(kind)

  async function saveName(name: string, newName: string) {
    try {
      await renameChoice(kind, name, newName)
    } catch (error) {
      void toast(error instanceof ChoiceTakenError ? error.message : COMMON_COPY.saveFailed)
    }
  }

  function rename({ name }: SavedChoice) {
    promptName({
      header: COMMON_COPY.rename,
      label: COMMON_COPY.name,
      name,
      onName: (newName) => void saveName(name, newName),
    })
  }

  function openActions(choice: SavedChoice) {
    void presentActions({
      header: choice.name,
      buttons: [
        { text: COMMON_COPY.rename, handler: () => rename(choice) },
        { text: COMMON_COPY.delete, role: 'destructive', handler: () => void remove(choice) },
        { text: COMMON_COPY.cancel, role: 'cancel' },
      ],
    })
  }

  if (choices.length === 0) {
    return null
  }

  return (
    <>
      <IonListHeader>
        <IonLabel>{SETTINGS_COPY.savedChoices[kind]}</IonLabel>
      </IonListHeader>
      <IonList inset>
        {choices.map((choice) => (
          <IonItem key={choice.name} button detail={false} onClick={() => openActions(choice)}>
            <IonLabel>{choice.name}</IonLabel>
          </IonItem>
        ))}
      </IonList>
    </>
  )
}
