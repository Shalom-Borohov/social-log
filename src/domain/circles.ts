import { COMMON_COPY } from '../copy/common'
import type { Circle, Person } from './types'

export const FAMILY_CIRCLE_ID = 'family'

export const isFamilyCircle = ({ id }: Circle) => id === FAMILY_CIRCLE_ID

export const circlesToOffer = (circles: Circle[]) =>
  circles.filter((circle) => !isFamilyCircle(circle) || circle.memberIds.length > 0)

export type PeopleTab = 'friends' | 'family'

const isFamilyMember = (circles: Circle[], person: Person) =>
  circles.some((circle) => isFamilyCircle(circle) && circle.memberIds.includes(person.id))

export const peopleInTab = (people: Person[], circles: Circle[], tab: PeopleTab) =>
  people.filter((person) => isFamilyMember(circles, person) === (tab === 'family'))

export function withFamilyCircle(circles: Circle[]): Circle[] {
  if (circles.some(isFamilyCircle)) {
    return circles
  }

  const named = circles.find(({ name }) => name === COMMON_COPY.family)

  if (named) {
    return circles.map((circle) => (circle === named ? { ...named, id: FAMILY_CIRCLE_ID } : circle))
  }

  return [...circles, { id: FAMILY_CIRCLE_ID, name: COMMON_COPY.family, memberIds: [] }]
}

export const chipPeople = (people: Person[], personIds: string[], circle: Circle | undefined) =>
  people.filter((person) => {
    const picked = personIds.includes(person.id)
    const inCircle = circle === undefined || circle.memberIds.includes(person.id)

    return picked || (!person.hidden && inCircle)
  })
