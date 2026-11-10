import { MEETUP_COPY } from '../copy/meetup'
import { newestFirst } from './person'
import { ownActivities, recentPlaces } from './recentChoices'
import type { ChoiceKind, Meetup, SavedChoice } from './types'

const inOrder = (names: readonly string[]): SavedChoice[] => names.map((name, savedAt) => ({ name, savedAt }))

export function initialSavedLists(meetups: Meetup[], hiddenPlaces: string[]) {
  const presets = MEETUP_COPY.activityPresets

  return {
    places: inOrder(recentPlaces(meetups, hiddenPlaces)),
    activities: inOrder([...presets, ...ownActivities(meetups, presets)]),
  }
}

export const inSavedOrder = (saved: SavedChoice[]) => [...saved].sort((first, second) => first.savedAt - second.savedAt)

export function placesByLastUse(saved: SavedChoice[], meetups: Meetup[]): SavedChoice[] {
  const lastUsed = [...new Set(newestFirst(meetups).map(({ place }) => place))]
  const used = saved.filter(({ name }) => lastUsed.includes(name))
  const unused = inSavedOrder(saved.filter(({ name }) => !lastUsed.includes(name))).reverse()

  return [...used.sort((first, second) => lastUsed.indexOf(first.name) - lastUsed.indexOf(second.name)), ...unused]
}

export const orderedChoices = (kind: ChoiceKind, saved: SavedChoice[], meetups: Meetup[]) =>
  kind === 'place' ? placesByLastUse(saved, meetups) : inSavedOrder(saved)
