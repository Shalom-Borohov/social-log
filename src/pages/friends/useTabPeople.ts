import { useCircles, usePeople } from '../../data/hooks'
import { type PeopleTab, peopleInTab } from '../../domain/circles'

export function useTabPeople(tab: PeopleTab) {
  const people = usePeople()
  const circles = useCircles()

  return people && circles && peopleInTab(people, circles, tab)
}
