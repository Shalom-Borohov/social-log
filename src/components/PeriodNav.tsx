import { IonButton } from '@ionic/react'
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
    <div className="period-nav visually-hidden-focusable">
      <IonButton fill="clear" aria-label={previousLabel} onClick={onPrevious}>
        {previousLabel}
      </IonButton>
      <IonButton fill="clear" aria-label={nextLabel} disabled={nextDisabled} onClick={onNext}>
        {nextLabel}
      </IonButton>
    </div>
  )
}
