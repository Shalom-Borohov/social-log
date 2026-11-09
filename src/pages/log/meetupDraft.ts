import type { Initiator, Meetup, MeetupDraft, Rating } from '../../domain/types'

export const SLOTS = ['date', 'people', 'place', 'duration', 'rating'] as const

export type Slot = (typeof SLOTS)[number]

export const EXTRAS = 'extras'

export type Step = Slot | typeof EXTRAS

export interface DraftFields {
  date: string
  personIds: string[]
  groupId?: string
  place: string
  minutes?: number
  rating?: Rating
  activities: string[]
  initiator?: Initiator
  note: string
}

export const toggledIn = (items: string[], item: string) =>
  items.includes(item) ? items.filter((existing) => existing !== item) : [...items, item]

export function emptyDraft(today: string): DraftFields {
  return { date: today, personIds: [], place: '', activities: [], note: '' }
}

export function draftFromMeetup({ id: _id, createdAt: _createdAt, activities, note, ...fields }: Meetup): DraftFields {
  return { ...fields, activities: activities ?? [], note: note ?? '' }
}

const FILLED: Record<Slot, (draft: DraftFields) => boolean> = {
  date: (draft) => draft.date !== '',
  people: (draft) => draft.personIds.length > 0,
  place: (draft) => draft.place.trim() !== '',
  duration: (draft) => draft.minutes !== undefined,
  rating: (draft) => draft.rating !== undefined,
}

export const isFilled = (slot: Slot, draft: DraftFields) => FILLED[slot](draft)

export const firstEmptyStep = (draft: DraftFields): Step => SLOTS.find((slot) => !isFilled(slot, draft)) ?? EXTRAS

export function completeDraft({ minutes, rating, ...fields }: DraftFields): MeetupDraft | null {
  if (minutes === undefined || rating === undefined || firstEmptyStep({ ...fields, minutes, rating }) !== EXTRAS) {
    return null
  }

  return { ...fields, minutes, rating }
}
