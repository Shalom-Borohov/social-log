import { useRef } from 'react'
import { countBadRecords, exportBackup } from '../data/backup'
import { isShareCancel, recordBackupTimeIfStorageAllows, shareBackup } from './backupFile'

export interface ExportResult {
  failed: boolean
  badRecords: number
}

async function shareStoredData(now: number): Promise<ExportResult> {
  let badRecords = 0

  try {
    const fileText = JSON.stringify(await exportBackup(now))

    badRecords = countBadRecords(fileText)
    await shareBackup(fileText, now)

    const fileWouldImport = badRecords === 0

    if (fileWouldImport) {
      recordBackupTimeIfStorageAllows(now)
    }

    return { failed: false, badRecords }
  } catch (error) {
    return { failed: !isShareCancel(error), badRecords }
  }
}

export function useBackupShare(report: (result: ExportResult) => void) {
  const exporting = useRef(false)

  return async function exportData() {
    if (exporting.current) {
      return
    }

    exporting.current = true
    report(await shareStoredData(Date.now()))
    exporting.current = false
  }
}
