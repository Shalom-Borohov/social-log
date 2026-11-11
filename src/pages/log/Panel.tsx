import { type ReactNode, useId } from 'react'
import { LOG_COPY } from './copy'

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
  disabled?: boolean
  onClick: () => void
}

export function Chip({ label, pressed, disabled = false, onClick }: ChipProps) {
  return (
    <button type="button" className="log-chip" aria-pressed={pressed} disabled={disabled} onClick={onClick}>
      {label}
    </button>
  )
}

interface RemoveChipProps {
  label: string
  removeLabel: string
  onRemove: () => void
}

export function RemoveChip({ label, removeLabel, onRemove }: RemoveChipProps) {
  return (
    <button type="button" className="log-chip log-chip-remove" aria-label={removeLabel} onClick={onRemove}>
      {label}
      <span aria-hidden="true">✕</span>
    </button>
  )
}

interface EditToggleProps {
  editing: boolean
  onToggle: () => void
}

export function EditToggle({ editing, onToggle }: EditToggleProps) {
  return (
    <button type="button" className="log-edit-toggle" onClick={onToggle}>
      {editing ? LOG_COPY.doneEditing : LOG_COPY.edit}
    </button>
  )
}

interface ChipGroupProps {
  label: string
  children: ReactNode
}

interface SaveForNextTimeProps {
  name: string
  onSave: () => void
}

export function SaveForNextTime({ name, onSave }: SaveForNextTimeProps) {
  return (
    <button type="button" className="log-quiet-action" onClick={onSave}>
      {LOG_COPY.saveForNextTime(name)}
    </button>
  )
}

export function ChipGroup({ label, children }: ChipGroupProps) {
  return (
    <div className="log-chip-group" role="group" aria-label={label}>
      {children}
    </div>
  )
}

export function LabelledChipGroup({ label, children }: ChipGroupProps) {
  const labelId = useId()

  return (
    <div className="log-labelled-chips" role="group" aria-labelledby={labelId}>
      <p id={labelId} className="log-chip-group-label">
        {label}
      </p>
      <div className="log-chip-group">{children}</div>
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
