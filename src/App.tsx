import { IonApp, IonRouterOutlet } from '@ionic/react'
import { IonReactHashRouter } from '@ionic/react-router'
import { Navigate, Route } from 'react-router-dom'
import { CALENDAR_PATH } from './navigation/paths'
import { LogPage } from './pages/log/LogPage'
import { RecoveryBoundary } from './recovery/RecoveryBoundary'
import { Tabs } from './Tabs'

export function AppRoutes() {
  return (
    <IonRouterOutlet>
      <Route path="/tabs/*" element={<Tabs />} />
      <Route path="/log" element={<LogPage />} />
      <Route path="/log/:meetupId" element={<LogPage />} />
      <Route path="/" element={<Navigate to={CALENDAR_PATH} replace />} />
    </IonRouterOutlet>
  )
}

export function App() {
  return (
    <RecoveryBoundary>
      <IonApp>
        <IonReactHashRouter>
          <AppRoutes />
        </IonReactHashRouter>
      </IonApp>
    </RecoveryBoundary>
  )
}
