import { useState } from 'react'
import { APP_UPDATE_COPY } from '../appUpdate/copy'
import { useAppUpdate } from '../appUpdate/useAppUpdate'
import { type ExportResult, useBackupShare } from '../backup/useBackupShare'
import { COMMON_COPY } from '../copy/common'
import { RECOVERY_COPY } from './copy'
import { RecoveryImport } from './RecoveryImport'
import { clearFailedPage, reloadAtStart } from './reloadAtStart'
import './recovery.css'

export function RecoveryScreen() {
  const [result, setResult] = useState<ExportResult>({ failed: false, badRecords: 0 })
  const exportData = useBackupShare(setResult)
  const { updateWaiting, applyUpdate } = useAppUpdate()

  function updateAtStart() {
    clearFailedPage()
    applyUpdate()
  }

  return (
    <main className="recovery">
      <h1>{RECOVERY_COPY.title}</h1>
      <p>{RECOVERY_COPY.explanation}</p>
      <button type="button" className="recovery-primary" onClick={exportData}>
        {COMMON_COPY.exportBackup}
      </button>
      <div role="status">
        {result.failed && <p>{COMMON_COPY.actionFailed}</p>}
        {result.badRecords > 0 && <p>{COMMON_COPY.badRecordsInBackup(result.badRecords)}</p>}
      </div>
      <RecoveryImport />
      <div role="status">{updateWaiting && <p>{APP_UPDATE_COPY.newVersionReady}</p>}</div>
      <button type="button" onClick={updateWaiting ? updateAtStart : reloadAtStart}>
        {updateWaiting ? APP_UPDATE_COPY.update : RECOVERY_COPY.reload}
      </button>
    </main>
  )
}
