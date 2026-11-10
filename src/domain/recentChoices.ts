import { newestFirst } from './person'
import type { Meetup } from './types'

export const RECENT_PLACES_LIMIT = 6

export function recentPlaces(meetups: Meetup[], hiddenPlaces: string[]): string[] {
  const places = new Set(newestFirst(meetups).map((meetup) => meetup.place))

  return [...places].filter((place) => !hiddenPlaces.includes(place)).slice(0, RECENT_PLACES_LIMIT)
}

export function ownActivities(meetups: Meetup[], presets: readonly string[]): string[] {
  const used = new Set(newestFirst(meetups).flatMap((meetup) => meetup.activities ?? []))

  return [...used].filter((activity) => !presets.includes(activity))
}
