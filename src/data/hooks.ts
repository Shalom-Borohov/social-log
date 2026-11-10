import { useLiveQuery } from 'dexie-react-hooks'
import type { ChoiceKind } from '../domain/types'
import { allGroups, allMeetups, allPeople } from './repo'
import { allSavedChoices } from './savedChoices'

export const useMeetups = () => useLiveQuery(allMeetups)

export const usePeople = () => useLiveQuery(allPeople)

export const useGroups = () => useLiveQuery(allGroups)

export const useSavedChoices = (kind: ChoiceKind) => useLiveQuery(() => allSavedChoices(kind), [kind])
