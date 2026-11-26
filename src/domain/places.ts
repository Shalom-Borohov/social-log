import { fullList } from './sentence'
import type { Meetup } from './types'

type StoredPlaces = Pick<Meetup, 'place' | 'laterPlaces'>

export const meetupPlaces = ({ place, laterPlaces = [] }: StoredPlaces): [string, ...string[]] => [place, ...laterPlaces]

export const placesLabel = (places: string[]) => fullList(places)

export const meetupPlacesLabel = (meetup: StoredPlaces) => placesLabel(meetupPlaces(meetup))

export function storedPlaces(place: string, laterPlaces: string[] = []): StoredPlaces {
  const first = place.trim()
  const later = [...new Set(laterPlaces.map((name) => name.trim()))].filter((name) => name !== '' && name !== first)

  return later.length > 0 ? { place: first, laterPlaces: later } : { place: first }
}
