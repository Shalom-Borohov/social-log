import { useLiveQuery } from 'dexie-react-hooks'
import { allGroups, allHiddenPlaces, allMeetups, allPeople } from './repo'

export const useMeetups = () => useLiveQuery(allMeetups)

export const usePeople = () => useLiveQuery(allPeople)

export const useGroups = () => useLiveQuery(allGroups)

export const useHiddenPlaces = () => useLiveQuery(allHiddenPlaces)
