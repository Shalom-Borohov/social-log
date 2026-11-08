import { useIonToast } from '@ionic/react'

export const TOAST_DURATION_MS = 2500

export function useToast() {
  const [presentToast] = useIonToast()

  const toast = (message: string) => presentToast({ message, duration: TOAST_DURATION_MS, position: 'top' })

  return { toast }
}
