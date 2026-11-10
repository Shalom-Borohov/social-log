import { useState } from 'react'

export function useChipEditing() {
  const [editing, setEditing] = useState(false)

  return { editing, toggleEditing: () => setEditing(!editing) }
}
