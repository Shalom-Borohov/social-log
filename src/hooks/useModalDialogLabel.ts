import { useState } from 'react'

export function useModalDialogLabel(label: string) {
  const [attributesIonicMovesIntoTheDialog] = useState(() => ({ 'aria-label': label }))

  return attributesIonicMovesIntoTheDialog
}
