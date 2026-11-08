import type { FormEvent } from 'react'
import { LOG_COPY } from './copy'

interface AddFieldProps {
  label: string
  value: string
  onChange: (value: string) => void
  onAdd: () => void
}

export function AddField({ label, value, onChange, onAdd }: AddFieldProps) {
  function submit(event: FormEvent) {
    event.preventDefault()
    onAdd()
  }

  return (
    <form className="log-add-field" onSubmit={submit}>
      <input
        aria-label={label}
        placeholder={label}
        enterKeyHint="done"
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
      <button type="submit" disabled={value.trim() === ''}>
        {LOG_COPY.add}
      </button>
    </form>
  )
}
