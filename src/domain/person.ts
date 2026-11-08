import { usualGap } from './rhythm'
import type { Initiator, Meetup } from './types'

export interface PersonSummary {
  history: Meetup[]
  lastDate: string | null
  usualGap: number | null
  initiated: Record<Initiator, number>
}

export const newestFirst = (meetups: Meetup[]) =>
  [...meetups].sort((first, second) => second.date.localeCompare(first.date) || second.createdAt - first.createdAt)

export function personSummary(personId: string, meetups: Meetup[]): PersonSummary {
  const history = newestFirst(meetups.filter((meetup) => meetup.personIds.includes(personId)))
  const initiated = { me: 0, them: 0 }

  for (const { initiator } of history) {
    if (initiator) {
      initiated[initiator] += 1
    }
  }

  return {
    history,
    lastDate: history[0]?.date ?? null,
    usualGap: usualGap(history.map((meetup) => meetup.date)),
    initiated,
  }
}
