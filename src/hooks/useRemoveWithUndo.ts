import { COMMON_COPY } from '../copy/common'
import { removeChoice, restoreChoice } from '../data/savedChoices'
import type { ChoiceKind, SavedChoice } from '../domain/types'
import { useSave } from './useSave'
import { useToast } from './useToast'

export function useRemoveWithUndo() {
  const save = useSave()
  const { toastWithUndo } = useToast()

  return async function removeWithUndo(remove: () => Promise<void>, restore: () => Promise<void>, message: string) {
    if (await save(remove())) {
      void toastWithUndo(message, () => void save(restore()))
    }
  }
}

export function useRemoveChoice(kind: ChoiceKind) {
  const removeWithUndo = useRemoveWithUndo()

  return (choice: SavedChoice) =>
    removeWithUndo(
      () => removeChoice(kind, choice.name),
      () => restoreChoice(kind, choice),
      COMMON_COPY.choiceRemoved[kind](choice.name),
    )
}
