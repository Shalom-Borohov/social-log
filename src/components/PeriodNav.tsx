import { IonButton, IonButtons, IonFooter, IonIcon, IonToolbar } from '@ionic/react'
import { chevronBack, chevronForward } from 'ionicons/icons'
import { COMMON_COPY } from '../copy/common'
import './PeriodNav.css'

interface PeriodNavProps {
  previousLabel: string
  nextLabel: string
  onPrevious: () => void
  onNext: () => void
  nextDisabled: boolean
}

export function PeriodNav({ previousLabel, nextLabel, onPrevious, onNext, nextDisabled }: PeriodNavProps) {
  return (
    <IonFooter className="period-nav">
      <IonToolbar>
        <IonButtons slot="start">
          <IonButton aria-label={previousLabel} onClick={onPrevious}>
            <IonIcon slot="start" icon={chevronForward} aria-hidden="true" />
            {COMMON_COPY.previous}
          </IonButton>
        </IonButtons>
        <IonButtons slot="end">
          <IonButton aria-label={nextLabel} disabled={nextDisabled} onClick={onNext}>
            {COMMON_COPY.next}
            <IonIcon slot="end" icon={chevronBack} aria-hidden="true" />
          </IonButton>
        </IonButtons>
      </IonToolbar>
    </IonFooter>
  )
}
