import { useIonToast } from '@ionic/react'
import { COMMON_COPY } from '../copy/common'

export const TOAST_DURATION_MS = 2500

const UNDO_TOAST_DURATION_MS = 5000

export function useToast() {
  const [presentToast] = useIonToast()

  const toast = (message: string) => presentToast({ message, duration: TOAST_DURATION_MS, position: 'top' })

  const toastWithUndo = (message: string, onUndo: () => void) =>
    presentToast({
      message,
      duration: UNDO_TOAST_DURATION_MS,
      position: 'top',
      buttons: [{ text: COMMON_COPY.cancel, role: 'cancel', handler: onUndo }],
    })

  return { toast, toastWithUndo }
}
