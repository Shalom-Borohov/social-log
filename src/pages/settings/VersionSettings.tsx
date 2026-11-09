import { IonItem, IonLabel, IonList } from '@ionic/react'
import { useState } from 'react'
import { CHANGELOG } from '../../appUpdate/changelog'
import { newestFirst } from '../../appUpdate/releases'
import { WhatsNewSheet } from '../../appUpdate/WhatsNewSheet'
import { LIST_SEPARATOR, dateTimeLabel } from '../../domain/format'
import { SETTINGS_COPY } from './copy'

const versionLine = [
  SETTINGS_COPY.version(__APP_VERSION__),
  SETTINGS_COPY.updated(dateTimeLabel(Date.parse(__APP_BUILT_AT__))),
].join(LIST_SEPARATOR)

const ALL_RELEASES = newestFirst(CHANGELOG)

export function VersionSettings() {
  const [open, setOpen] = useState(false)

  return (
    <>
      <IonList inset>
        <IonItem button onClick={() => setOpen(true)}>
          <IonLabel>{versionLine}</IonLabel>
        </IonItem>
      </IonList>
      <WhatsNewSheet isOpen={open} releases={ALL_RELEASES} onClose={() => setOpen(false)} />
    </>
  )
}
