import { IonButton, IonIcon, IonLabel, IonRouterOutlet, IonTabBar, IonTabButton, IonTabs } from '@ionic/react'
import { add } from 'ionicons/icons'
import { Navigate, Route } from 'react-router-dom'
import { UpdateBar } from './appUpdate/UpdateBar'
import { useWhatsNew } from './appUpdate/useWhatsNew'
import { WhatsNewSheet } from './appUpdate/WhatsNewSheet'
import { COMMON_COPY } from './copy/common'
import { CALENDAR_PATH, FAMILY_PATH, FRIENDS_PATH } from './navigation/paths'
import { CalendarPage } from './pages/calendar/CalendarPage'
import { TappedDayProvider } from './pages/calendar/TappedDayProvider'
import { useNewMeetupPath } from './pages/calendar/useTappedDay'
import { AllFriendsPage } from './pages/friends/AllFriendsPage'
import { FriendsPage } from './pages/friends/FriendsPage'
import { PersonPage } from './pages/friends/PersonPage'
import { CircleSettingsPage } from './pages/settings/CircleSettingsPage'
import { CirclesSettingsPage } from './pages/settings/CirclesSettingsPage'
import { FriendsSettingsPage } from './pages/settings/FriendsSettingsPage'
import { SettingsPage } from './pages/settings/SettingsPage'
import './tabs.css'

function NewMeetupButton() {
  return (
    <IonButton className="new-meetup-button" routerLink={useNewMeetupPath()} aria-label={COMMON_COPY.newMeetup}>
      <IonIcon slot="icon-only" icon={add} aria-hidden="true" />
    </IonButton>
  )
}

export function Tabs() {
  const whatsNew = useWhatsNew()

  return (
    <TappedDayProvider>
      <IonTabs>
        <IonRouterOutlet>
          <Route path="calendar" element={<CalendarPage />} />
          <Route path="calendar/settings" element={<SettingsPage />} />
          <Route path="calendar/settings/friends" element={<FriendsSettingsPage />} />
          <Route path="calendar/settings/circles" element={<CirclesSettingsPage />} />
          <Route path="calendar/settings/circles/:circleId" element={<CircleSettingsPage />} />
          <Route path="friends" element={<FriendsPage tab="friends" />} />
          <Route path="friends/all" element={<AllFriendsPage tab="friends" />} />
          <Route path="friends/person/:personId" element={<PersonPage tab="friends" />} />
          <Route path="family" element={<FriendsPage tab="family" />} />
          <Route path="family/all" element={<AllFriendsPage tab="family" />} />
          <Route path="family/person/:personId" element={<PersonPage tab="family" />} />
          <Route index element={<Navigate to="calendar" replace />} />
        </IonRouterOutlet>
        <UpdateBar />
        <IonTabBar slot="bottom" className="pill-tab-bar">
          <IonTabButton tab="calendar" href={CALENDAR_PATH}>
            <IonLabel>{COMMON_COPY.calendar}</IonLabel>
          </IonTabButton>
          <IonTabButton tab="friends" href={FRIENDS_PATH}>
            <IonLabel>{COMMON_COPY.friends}</IonLabel>
          </IonTabButton>
          <IonTabButton tab="family" href={FAMILY_PATH}>
            <IonLabel>{COMMON_COPY.family}</IonLabel>
          </IonTabButton>
        </IonTabBar>
        <NewMeetupButton />
        <WhatsNewSheet {...whatsNew} />
      </IonTabs>
    </TappedDayProvider>
  )
}
