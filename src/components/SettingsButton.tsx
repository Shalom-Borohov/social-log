import { IonButton, IonButtons, IonIcon } from '@ionic/react'
import { settingsOutline } from 'ionicons/icons'
import { COMMON_COPY } from '../copy/common'
import { SETTINGS_PATH } from '../navigation/paths'

export function SettingsButton() {
  return (
    <IonButtons slot="end">
      <IonButton aria-label={COMMON_COPY.settings} routerLink={SETTINGS_PATH}>
        <IonIcon slot="icon-only" icon={settingsOutline} aria-hidden="true" />
      </IonButton>
    </IonButtons>
  )
}
