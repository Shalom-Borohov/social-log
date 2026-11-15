import { forgetUnusedPeople, restorePerson, setPersonHidden } from '../../data/repo'
import { isUnused } from '../../domain/person'
import type { Circle, Group, Meetup, Person } from '../../domain/types'
import { useRemoveWithUndo } from '../../hooks/useRemoveWithUndo'
import { LOG_COPY } from './copy'

export function usePersonChipRemoval(meetups: Meetup[], groups: Group[], circles: Circle[]) {
  const removeWithUndo = useRemoveWithUndo()
  const deletable = (person: Person) => isUnused(person.id, meetups, groups)

  const removeLabel = (person: Person) =>
    deletable(person) ? LOG_COPY.deleteChip(person.name) : LOG_COPY.hideChip(person.name)

  function remove(person: Person) {
    if (!deletable(person)) {
      return removeWithUndo(
        () => setPersonHidden(person.id, true),
        () => setPersonHidden(person.id, false),
        LOG_COPY.personHidden(person.name),
      )
    }

    const circleIds = circles.filter(({ memberIds }) => memberIds.includes(person.id)).map(({ id }) => id)

    return removeWithUndo(
      () => forgetUnusedPeople([person.id]),
      () => restorePerson(person, circleIds),
      LOG_COPY.personDeleted(person.name),
    )
  }

  return { removeLabel, remove }
}
