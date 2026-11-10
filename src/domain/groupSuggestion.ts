import { sameMembers, samePeople } from './sentence'
import type { Group, Meetup } from './types'

export const GROUP_MINIMUM = 2

const REPEAT_MINIMUM = 2

export function groupSuggestion(personIds: string[], meetups: Meetup[], groups: Group[], meetupId?: string): number {
  if (personIds.length < GROUP_MINIMUM || groups.some((group) => sameMembers(personIds, group))) {
    return 0
  }

  const together = meetups.filter((meetup) => meetup.id !== meetupId && samePeople(meetup.personIds, personIds)).length

  return together >= REPEAT_MINIMUM ? together : 0
}
