import { IonList } from '@ionic/react'
import { MeetupRow } from '../../components/MeetupRow'
import { durationLabel, peopleLabel } from '../../domain/sentence'
import type { Group, Meetup, Person } from '../../domain/types'
import { CALENDAR_COPY } from './copy'

interface DayMeetupsProps {
  meetups: Meetup[]
  people: Person[]
  groups: Group[]
}

export function DayMeetups({ meetups, people, groups }: DayMeetupsProps) {
  if (meetups.length === 0) {
    return <p className="calendar-quiet">{CALENDAR_COPY.noMeetupsThatDay}</p>
  }

  return (
    <IonList inset className="calendar-meetups">
      {meetups.map((meetup) => (
        <MeetupRow
          key={meetup.id}
          meetup={meetup}
          title={peopleLabel(meetup.personIds, people, groups, meetup.groupId)}
          details={CALENDAR_COPY.meetupDetails(meetup.place, durationLabel(meetup.minutes))}
        />
      ))}
    </IonList>
  )
}
