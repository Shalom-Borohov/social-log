import { IonLabel, IonList, IonListHeader } from '@ionic/react'
import { MeetupRow } from '../../components/MeetupRow'
import { dayLabel, LIST_SEPARATOR } from '../../domain/format'
import { peopleLabel } from '../../domain/sentence'
import type { Group, Meetup, Person } from '../../domain/types'
import { FRIENDS_COPY } from './copy'

interface MeetupHistoryProps {
  history: Meetup[]
  people: Person[]
  groups: Group[]
}

export function MeetupHistory({ history, people, groups }: MeetupHistoryProps) {
  if (history.length === 0) {
    return null
  }

  return (
    <>
      <IonListHeader>
        <IonLabel>{FRIENDS_COPY.history}</IonLabel>
      </IonListHeader>
      <IonList inset>
        {history.map((meetup) => (
          <MeetupRow
            key={meetup.id}
            meetup={meetup}
            title={dayLabel(meetup.date)}
            details={[peopleLabel(meetup.personIds, people, groups, meetup.groupId), meetup.place].join(LIST_SEPARATOR)}
          />
        ))}
      </IonList>
    </>
  )
}
