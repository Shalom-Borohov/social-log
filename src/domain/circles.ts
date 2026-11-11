import type { Circle, Person } from './types'

export const chipPeople = (people: Person[], personIds: string[], circle: Circle | undefined) =>
  people.filter((person) => {
    const picked = personIds.includes(person.id)
    const inCircle = circle === undefined || circle.memberIds.includes(person.id)

    return picked || (!person.hidden && inCircle)
  })
