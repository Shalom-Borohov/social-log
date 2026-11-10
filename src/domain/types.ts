export const RATINGS = [4, 3, 2, 1] as const

export type Rating = (typeof RATINGS)[number]

export const GREAT: Rating = 4

export const INITIATORS = ['me', 'them'] as const

export type Initiator = (typeof INITIATORS)[number]

export interface Person {
  id: string
  name: string
  hidden: boolean
  createdAt: number
}

export interface Group {
  id: string
  name: string
  memberIds: string[]
}

export interface Meetup {
  id: string
  date: string
  personIds: string[]
  groupId?: string
  place: string
  minutes: number
  rating: Rating
  activities?: string[]
  initiator?: Initiator
  note?: string
  createdAt: number
}

export interface HiddenPlace {
  place: string
}

export type MeetupDraft = Omit<Meetup, 'id' | 'createdAt'>
