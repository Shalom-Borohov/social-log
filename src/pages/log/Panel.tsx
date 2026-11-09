import type { ReactNode } from 'react'

interface PanelProps {
  heading: string
  children: ReactNode
  action?: ReactNode
}

export function Panel({ heading, children, action }: PanelProps) {
  return (
    <section className="log-panel" aria-label={heading}>
      <h2>{heading}</h2>
      <div className="log-panel-body">{children}</div>
      {action}
    </section>
  )
}

interface ChipProps {
  label: string
  pressed: boolean
  onClick: () => void
}

export function Chip({ label, pressed, onClick }: ChipProps) {
  return (
    <button type="button" className="log-chip" aria-pressed={pressed} onClick={onClick}>
      {label}
    </button>
  )
}

interface ChipGroupProps {
  label: string
  children: ReactNode
}

export function ChipGroup({ label, children }: ChipGroupProps) {
  return (
    <div className="log-chip-group" role="group" aria-label={label}>
      {children}
    </div>
  )
}

interface MainActionProps {
  label: string
  disabled?: boolean
  onClick: () => void
}

export function MainAction({ label, disabled = false, onClick }: MainActionProps) {
  return (
    <button type="button" className="log-main-action" disabled={disabled} onClick={onClick}>
      {label}
    </button>
  )
}
