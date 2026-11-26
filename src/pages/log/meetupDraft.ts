import { isLoggableDate } from '../../domain/logicalDay'
import { meetupPlaces, storedPlaces } from '../../domain/places'
import type { Initiator, Meetup, MeetupDraft, Rating } from '../../domain/types'

export const SLOTS = ['date', 'people', 'place', 'duration', 'rating'] as const

export type Slot = (typeof SLOTS)[number]

export const EXTRAS = 'extras'

export type Step = Slot | typeof EXTRAS

export interface DraftFields {
  date: string
  personIds: string[]
  groupId?: string
  places: string[]
  placeText: string
  minutes?: number
  rating?: Rating
  activities: string[]
  initiator?: Initiator
  note: string
}

export const toggledIn = (items: string[], item: string) =>
  items.includes(item) ? items.filter((existing) => existing !== item) : [...items, item]

export function emptyDraft(date: string): DraftFields {
  return { date, personIds: [], places: [], placeText: '', activities: [], note: '' }
}

export const draftPlaces = ({ places, placeText }: Pick<DraftFields, 'places' | 'placeText'>) =>
  [...places, placeText.trim()].filter((place) => place !== '')

export const newMeetupDate = (requested: string | null, today: string) =>
  requested !== null && isLoggableDate(requested, today) ? requested : today

export function draftFromMeetup({
  id: _id,
  createdAt: _createdAt,
  activities,
  note,
  place,
  laterPlaces,
  ...fields
}: Meetup): DraftFields {
  return {
    ...fields,
    places: meetupPlaces({ place, laterPlaces }),
    placeText: '',
    activities: activities ?? [],
    note: note ?? '',
  }
}

const FILLED: Record<Slot, (draft: DraftFields) => boolean> = {
  date: (draft) => draft.date !== '',
  people: (draft) => draft.personIds.length > 0,
  place: (draft) => draftPlaces(draft).length > 0,
  duration: (draft) => draft.minutes !== undefined,
  rating: (draft) => draft.rating !== undefined,
}

export const isFilled = (slot: Slot, draft: DraftFields) => FILLED[slot](draft)

export const firstEmptyStep = (draft: DraftFields): Step => SLOTS.find((slot) => !isFilled(slot, draft)) ?? EXTRAS

export function completeDraft({ minutes, rating, places, placeText, ...fields }: DraftFields): MeetupDraft | null {
  const [firstPlace, ...laterPlaces] = draftPlaces({ places, placeText })

  if (
    minutes === undefined ||
    rating === undefined ||
    firstPlace === undefined ||
    firstEmptyStep({ ...fields, places, placeText, minutes, rating }) !== EXTRAS
  ) {
    return null
  }

  return { ...fields, ...storedPlaces(firstPlace, laterPlaces), minutes, rating }
}
