import { IonIcon } from '@ionic/react'
import { add, remove } from 'ionicons/icons'

interface StepperProps {
  label: string
  value: number
  max: number
  step: number
  moreLabel: string
  fewerLabel: string
  onChange: (value: number) => void
}

export function Stepper({ label, value, max, step, moreLabel, fewerLabel, onChange }: StepperProps) {
  return (
    <div className="log-stepper" role="group" aria-label={label}>
      <span className="log-stepper-label">{label}</span>
      <button type="button" aria-label={fewerLabel} disabled={value - step < 0} onClick={() => onChange(value - step)}>
        <IonIcon icon={remove} aria-hidden="true" />
      </button>
      <output aria-label={label}>{value}</output>
      <button type="button" aria-label={moreLabel} disabled={value + step > max} onClick={() => onChange(value + step)}>
        <IonIcon icon={add} aria-hidden="true" />
      </button>
    </div>
  )
}
