import { useState } from 'react'
import { useSave } from '../../hooks/useSave'
import { useToast } from '../../hooks/useToast'

export function useChipEditing() {
  const [editing, setEditing] = useState(false)
  const save = useSave()
  const { toastWithUndo } = useToast()

  async function hideWithUndo(hide: () => Promise<void>, show: () => Promise<void>, message: string) {
    if (await save(hide())) {
      void toastWithUndo(message, () => void save(show()))
    }
  }

  return { editing, toggleEditing: () => setEditing(!editing), hideWithUndo }
}
