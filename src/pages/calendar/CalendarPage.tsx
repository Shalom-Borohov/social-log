import { IonContent, IonHeader, IonPage, IonTitle, IonToolbar } from '@ionic/react'
import { useState } from 'react'
import { PeriodNav } from '../../components/PeriodNav'
import { SettingsButton } from '../../components/SettingsButton'
import { useGroups, useMeetups, usePeople } from '../../data/hooks'
import { gregorianLabel } from '../../domain/format'
import { rollingWeeks, WEEKS_SHOWN } from '../../domain/weeks'
import { usePeriodSwipe } from '../../hooks/usePeriodSwipe'
import { useToday } from '../../hooks/useToday'
import { BackupReminderRow } from './BackupReminderRow'
import { CalendarRange } from './CalendarRange'
import { CALENDAR_COPY } from './copy'
import { useTappedDay } from './useTappedDay'
import './calendar.css'

const THIS_PAGE = 0

export function CalendarPage() {
  const today = useToday()
  const meetups = useMeetups()
  const people = usePeople()
  const groups = useGroups()
  const { forgetTappedDay } = useTappedDay()
  const [pagesBack, setPagesBack] = useState(THIS_PAGE)
  const range = rollingWeeks(today, pagesBack)

  const title =
    pagesBack === THIS_PAGE
      ? CALENDAR_COPY.lastWeeks(WEEKS_SHOWN)
      : CALENDAR_COPY.range(gregorianLabel(range.from), gregorianLabel(range.to))

  const pageBy = (pages: number) => {
    forgetTappedDay()
    setPagesBack((current) => current + pages)
  }

  const period = {
    onPrevious: () => pageBy(1),
    onNext: () => pageBy(-1),
    nextDisabled: pagesBack === THIS_PAGE,
  }

  const { areaRef, paneRef } = usePeriodSwipe({ ...period, periodKey: range.from })

  return (
    <IonPage className="calendar-page">
      <IonHeader>
        <IonToolbar>
          <IonTitle>{title}</IonTitle>
          <SettingsButton />
        </IonToolbar>
      </IonHeader>
      <IonContent ref={areaRef} fullscreen>
        <IonHeader collapse="condense">
          <IonToolbar>
            <IonTitle size="large">{title}</IonTitle>
          </IonToolbar>
        </IonHeader>
        {meetups && <BackupReminderRow meetups={meetups} today={today} />}
        <div ref={paneRef} className="calendar-pane">
          {meetups && people && groups && (
            <CalendarRange range={range} meetups={meetups} people={people} groups={groups} />
          )}
        </div>
      </IonContent>
      <PeriodNav
        previousLabel={CALENDAR_COPY.previousWeeks(WEEKS_SHOWN)}
        nextLabel={CALENDAR_COPY.nextWeeks(WEEKS_SHOWN)}
        {...period}
      />
    </IonPage>
  )
}
