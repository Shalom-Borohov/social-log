import { fireEvent, screen } from '@testing-library/react'
import { vi } from 'vitest'

export function stubShare(share: (data: ShareData) => Promise<void>) {
  const stub = vi.fn(share)

  Object.assign(navigator, { share: stub, canShare: () => true })

  return stub
}

const backupFile = (text: string) => new File([text], 'backup.json', { type: 'application/json' })

const chooseFile = (file: File) => fireEvent.change(screen.getByLabelText('קובץ גיבוי'), { target: { files: [file] } })

export function chooseBackupFile(text: string) {
  chooseFile(backupFile(text))
}

export function chooseUnreadableBackupFile(browserMessage: string) {
  const unreadable = () => Promise.reject(new Error(browserMessage))

  chooseFile(Object.assign(backupFile(''), { text: unreadable }))
}
