import { IonLabel, IonListHeader, IonSegment, IonSegmentButton } from '@ionic/react'
import { APPEARANCES, isAppearance, saveAppearance, useAppearance } from '../../appearance/appearance'
import { SETTINGS_COPY } from './copy'
import './feedback.css'

export function AppearanceSettings() {
  const appearance = useAppearance()

  return (
    <>
      <IonListHeader>
        <IonLabel>{SETTINGS_COPY.appearance}</IonLabel>
      </IonListHeader>
      <IonSegment
        className="inset-segment"
        aria-label={SETTINGS_COPY.appearance}
        value={appearance}
        onIonChange={(event) => isAppearance(event.detail.value) && saveAppearance(event.detail.value)}
      >
        {APPEARANCES.map((choice) => (
          <IonSegmentButton key={choice} value={choice}>
            <IonLabel>{SETTINGS_COPY.appearanceChoices[choice]}</IonLabel>
          </IonSegmentButton>
        ))}
      </IonSegment>
    </>
  )
}
