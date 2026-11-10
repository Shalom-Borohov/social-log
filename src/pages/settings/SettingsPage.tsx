import {
  IonBackButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonIcon,
  IonItem,
  IonLabel,
  IonList,
  IonListHeader,
  IonNote,
  IonPage,
  IonTitle,
  IonToolbar,
  useIonAlert,
} from '@ionic/react'
import { downloadOutline, shareOutline } from 'ionicons/icons'
import { restoreFromBackup } from '../../backup/backupFile'
import { useLastBackup } from '../../backup/lastBackup'
import { useBackupFile } from '../../backup/useBackupFile'
import { useExportBackup } from '../../backup/useExportBackup'
import { COMMON_COPY } from '../../copy/common'
import type { Backup } from '../../data/backup'
import { dateTimeLabel } from '../../domain/format'
import { useSave } from '../../hooks/useSave'
import { useToast } from '../../hooks/useToast'
import { CALENDAR_PATH } from '../../navigation/paths'
import { SETTINGS_COPY } from './copy'
import { FeedbackSettings } from './FeedbackSettings'
import { FriendsSettings } from './FriendsSettings'
import { GroupsSettings } from './GroupsSettings'
import { SavedChoicesSettings } from './SavedChoicesSettings'
import { VersionSettings } from './VersionSettings'

export function SettingsPage() {
  const [presentAlert] = useIonAlert()
  const { toast } = useToast()
  const save = useSave()
  const exportData = useExportBackup()
  const lastBackup = useLastBackup()

  async function restore(backup: Backup) {
    if (await save(restoreFromBackup(backup))) {
      void toast(SETTINGS_COPY.backupRestored)
    }
  }

  const { pickFile, fileInputProps } = useBackupFile({
    onBackup(backup) {
      presentAlert({
        header: COMMON_COPY.importBackup,
        message: COMMON_COPY.importWarning,
        buttons: [
          { text: COMMON_COPY.cancel, role: 'cancel' },
          { text: COMMON_COPY.confirmImport, role: 'destructive', handler: () => void restore(backup) },
        ],
      })
    },
    onFailure: (message) => void toast(message),
  })

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton defaultHref={CALENDAR_PATH} text={COMMON_COPY.calendar} />
          </IonButtons>
          <IonTitle>{COMMON_COPY.settings}</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent>
        <IonListHeader>
          <IonLabel>{SETTINGS_COPY.backup}</IonLabel>
        </IonListHeader>
        <IonList inset>
          <IonItem button detail={false} onClick={exportData}>
            <IonIcon slot="start" color="primary" icon={shareOutline} aria-hidden="true" />
            <IonLabel>{COMMON_COPY.exportBackup}</IonLabel>
          </IonItem>
          <IonItem button detail={false} onClick={pickFile}>
            <IonIcon slot="start" color="primary" icon={downloadOutline} aria-hidden="true" />
            <IonLabel>{COMMON_COPY.importBackup}</IonLabel>
          </IonItem>
        </IonList>
        <IonNote className="list-footer">
          {lastBackup === null ? COMMON_COPY.noBackupYet : SETTINGS_COPY.lastBackup(dateTimeLabel(lastBackup))}
        </IonNote>
        <IonNote className="list-footer">{SETTINGS_COPY.storageNote}</IonNote>
        <GroupsSettings />
        <SavedChoicesSettings kind="place" />
        <SavedChoicesSettings kind="activity" />
        <FriendsSettings />

        <FeedbackSettings />
        <VersionSettings />
        <input {...fileInputProps} />
      </IonContent>
    </IonPage>
  )
}
