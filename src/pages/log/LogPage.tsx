import { IonPage } from '@ionic/react'
import { useState } from 'react'
import { useLocation, useParams, useSearchParams } from 'react-router-dom'
import { MEETUP_DATE_PARAM, NEW_MEETUP_PATH } from '../../navigation/paths'
import { LogScreen } from './LogScreen'

export function LogPage() {
  const { meetupId } = useParams()
  const { key, pathname } = useLocation()
  const [searchParams] = useSearchParams()
  const [screenKey, setScreenKey] = useState(key)

  if (pathname.startsWith(NEW_MEETUP_PATH) && key !== screenKey) {
    setScreenKey(key)
  }

  return (
    <IonPage>
      <LogScreen key={screenKey} meetupId={meetupId} requestedDate={searchParams.get(MEETUP_DATE_PARAM)} />
    </IonPage>
  )
}
