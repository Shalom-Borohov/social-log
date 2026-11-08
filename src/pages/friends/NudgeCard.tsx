import { dayLabel } from '../../domain/format'
import type { Meetup, Person } from '../../domain/types'
import { FRIENDS_COPY } from './copy'
import { sinceLabel } from './sinceLabel'

interface NudgeCardProps {
  person: Person
  daysSince: number
  lastMeetup: Meetup
  onOpen: (personId: string) => void
}

export function NudgeCard({ person, daysSince, lastMeetup, onOpen }: NudgeCardProps) {
  return (
    <button type="button" className="nudge-card" onClick={() => onOpen(person.id)}>
      <span className="nudge-title">{FRIENDS_COPY.notSeenSince(person.name, sinceLabel(daysSince))}</span>
      <span className="nudge-detail">{FRIENDS_COPY.lastTime(lastMeetup.place, dayLabel(lastMeetup.date))}</span>
    </button>
  )
}
