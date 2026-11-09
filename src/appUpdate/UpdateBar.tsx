import { IonButton, IonIcon, IonLabel } from '@ionic/react'
import { close } from 'ionicons/icons'
import { useEffect, useState } from 'react'
import { APP_UPDATE_COPY } from './copy'
import { useAppUpdate } from './useAppUpdate'
import './appUpdate.css'

export function UpdateBar() {
  const [dismissed, setDismissed] = useState(false)
  const { updateWaiting, applyUpdate } = useAppUpdate()

  useEffect(() => {
    function offerAgain() {
      if (document.visibilityState === 'visible') {
        setDismissed(false)
      }
    }

    document.addEventListener('visibilitychange', offerAgain)

    return () => document.removeEventListener('visibilitychange', offerAgain)
  }, [])

  if (!updateWaiting || dismissed) {
    return null
  }

  return (
    <div slot="bottom" className="update-bar">
      <IonButton fill="clear" color="medium" aria-label={APP_UPDATE_COPY.dismissUpdate} onClick={() => setDismissed(true)}>
        <IonIcon slot="icon-only" icon={close} aria-hidden="true" />
      </IonButton>
      <IonLabel>{APP_UPDATE_COPY.newVersionReady}</IonLabel>
      <IonButton fill="solid" size="small" shape="round" onClick={applyUpdate}>
        {APP_UPDATE_COPY.update}
      </IonButton>
    </div>
  )
}
