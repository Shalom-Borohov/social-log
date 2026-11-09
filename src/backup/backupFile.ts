import { type Backup, parseBackup, restoreBackup } from '../data/backup'
import { toIsoDate } from '../domain/logicalDay'
import { saveLastBackup } from './lastBackup'

const BACKUP_FILE_PREFIX = 'social-log-backup-'

const BACKUP_EXTENSION = '.json'

const BACKUP_MIME_TYPE = 'application/json'

export const BACKUP_FILE_ACCEPT = [BACKUP_MIME_TYPE, BACKUP_EXTENSION].join(',')

export async function shareBackup(fileText: string, exportedAt: number): Promise<void> {
  const fileName = `${BACKUP_FILE_PREFIX}${toIsoDate(new Date(exportedAt))}${BACKUP_EXTENSION}`
  const file = new File([fileText], fileName, { type: BACKUP_MIME_TYPE })

  if (navigator.canShare?.({ files: [file] })) {
    await navigator.share({ files: [file] })

    return
  }

  const url = URL.createObjectURL(file)
  const link = document.createElement('a')

  link.href = url
  link.download = file.name
  link.click()
  setTimeout(() => URL.revokeObjectURL(url))
}

export async function readBackup(file: File): Promise<Backup> {
  return parseBackup(await file.text())
}

export function recordBackupTimeIfStorageAllows(exportedAt: number) {
  try {
    saveLastBackup(exportedAt)
  } catch {
    return
  }
}

export async function restoreFromBackup(backup: Backup): Promise<void> {
  await restoreBackup(backup)
  recordBackupTimeIfStorageAllows(backup.exportedAt)
}

export const isShareCancel = (error: unknown) => error instanceof DOMException && error.name === 'AbortError'
