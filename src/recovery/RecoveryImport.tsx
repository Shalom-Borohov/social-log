import { useState } from 'react'
import { restoreFromBackup } from '../backup/backupFile'
import { useBackupFile } from '../backup/useBackupFile'
import { COMMON_COPY } from '../copy/common'
import type { Backup } from '../data/backup'
import { RECOVERY_COPY } from './copy'
import { reloadAtStart } from './reloadAtStart'

export function RecoveryImport() {
  const [pending, setPending] = useState<Backup | null>(null)
  const [failure, setFailure] = useState<string | null>(null)
  const [restoring, setRestoring] = useState(false)

  const { pickFile, fileInputProps } = useBackupFile({
    onBackup(backup) {
      setFailure(null)
      setPending(backup)
    },
    onFailure: setFailure,
  })

  async function confirmImport(backup: Backup) {
    setFailure(null)
    setRestoring(true)

    try {
      await restoreFromBackup(backup)
      reloadAtStart()
    } catch {
      setFailure(COMMON_COPY.saveFailed)
      setRestoring(false)
    }
  }

  function cancelImport() {
    setFailure(null)
    setPending(null)
  }

  return (
    <>
      <div role="status">
        {pending && <p>{RECOVERY_COPY.importWarning}</p>}
        {failure && <p>{failure}</p>}
      </div>
      {pending ? (
        <>
          <button
            type="button"
            className="recovery-destructive"
            disabled={restoring}
            onClick={() => void confirmImport(pending)}
          >
            {COMMON_COPY.confirmImport}
          </button>
          <button type="button" disabled={restoring} onClick={cancelImport}>
            {COMMON_COPY.cancel}
          </button>
        </>
      ) : (
        <button type="button" onClick={pickFile}>
          {COMMON_COPY.importBackup}
        </button>
      )}
      <input {...fileInputProps} />
    </>
  )
}
