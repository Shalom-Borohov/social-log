import { IonItem, IonLabel } from '@ionic/react'
import { MEETUP_COPY } from '../copy/meetup'
import type { Meetup } from '../domain/types'
import { editMeetupPath } from '../navigation/paths'
import { RatingChip } from './RatingChip'

interface MeetupRowProps {
  meetup: Meetup
  title: string
  details: string
}

export function MeetupRow({ meetup, title, details }: MeetupRowProps) {
  return (
    <IonItem button routerLink={editMeetupPath(meetup.id)}>
      <IonLabel>
        <h2 className="meetup-row-title">{title}</h2>
        <p>{details}</p>
      </IonLabel>
      <span slot="end" className="rating-tag">
        <RatingChip rating={meetup.rating} />
        {MEETUP_COPY.ratings[meetup.rating]}
      </span>
    </IonItem>
  )
}
