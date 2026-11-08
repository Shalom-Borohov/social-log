import { IonItem, IonLabel, IonList } from '@ionic/react'
import { useLastBackup } from '../../backup/lastBackup'
import { useExportBackup } from '../../backup/useExportBackup'
import { COMMON_COPY } from '../../copy/common'
import { type BackupReminder, backupReminder } from '../../domain/backupReminder'
import type { Meetup } from '../../domain/types'

const reminderLabel = (reminder: BackupReminder) =>
  reminder.kind === 'never' ? COMMON_COPY.noBackupYet : COMMON_COPY.backupDaysAgo(reminder.days)

export function BackupReminderRow({ meetups, today }: { meetups: Meetup[]; today: string }) {
  const reminder = backupReminder(meetups, useLastBackup(), today)
  const exportData = useExportBackup()

  if (reminder === null) {
    return null
  }

  return (
    <IonList inset className="calendar-backup">
      <IonItem button detail={false} onClick={exportData}>
        <IonLabel>{reminderLabel(reminder)}</IonLabel>
      </IonItem>
    </IonList>
  )
}
