import { useLiveQuery } from 'dexie-react-hooks'
import { allGroups, allMeetups, allPeople } from './repo'

export const useMeetups = () => useLiveQuery(allMeetups)

export const usePeople = () => useLiveQuery(allPeople)

export const useGroups = () => useLiveQuery(allGroups)
