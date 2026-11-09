import { IonItem, IonLabel, IonList, IonNote, IonToggle } from '@ionic/react'
import { setPersonHidden } from '../../data/repo'
import { dayLabel } from '../../domain/format'
import type { PersonSummary } from '../../domain/person'
import type { Person } from '../../domain/types'
import { useSave } from '../../hooks/useSave'
import { FRIENDS_COPY } from './copy'
import { sinceLabel } from './sinceLabel'

interface PersonSummaryListProps {
  person: Person
  summary: PersonSummary
}

export function PersonSummaryList({ person, summary }: PersonSummaryListProps) {
  const save = useSave()
  const { history, lastDate, usualGap, initiated } = summary
  const initiatorRecords = initiated.me + initiated.them
  const gapText = usualGap === null ? FRIENDS_COPY.notEnoughMeetups : FRIENDS_COPY.usualGap(sinceLabel(usualGap))

  return (
    <IonList inset>
      <IonItem>
        <IonLabel>{FRIENDS_COPY.meetupCount}</IonLabel>
        <IonNote slot="end">{history.length}</IonNote>
      </IonItem>
      {lastDate && (
        <IonItem>
          <IonLabel>{FRIENDS_COPY.lastMeetup}</IonLabel>
          <IonNote slot="end">{dayLabel(lastDate)}</IonNote>
        </IonItem>
      )}
      <IonItem>
        <IonLabel>{gapText}</IonLabel>
      </IonItem>
      {initiatorRecords > 0 && (
        <IonItem>
          <IonLabel>{FRIENDS_COPY.initiated(initiated.me, initiatorRecords)}</IonLabel>
        </IonItem>
      )}
      <IonItem>
        <IonToggle
          checked={!person.hidden}
          onIonChange={(event) => void save(setPersonHidden(person.id, !event.detail.checked))}
        >
          {FRIENDS_COPY.showInOrbit}
        </IonToggle>
      </IonItem>
    </IonList>
  )
}
