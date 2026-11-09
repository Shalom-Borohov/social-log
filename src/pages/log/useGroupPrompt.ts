import { saveGroup } from '../../data/repo'
import type { Group } from '../../domain/types'
import { useNamePrompt } from '../../hooks/useNamePrompt'
import { useSave } from '../../hooks/useSave'
import { LOG_COPY } from './copy'

export function useGroupPrompt(onSaved: (group: Group) => void) {
  const promptName = useNamePrompt()
  const save = useSave()

  return (memberIds: string[]) =>
    promptName({
      header: LOG_COPY.saveAsGroup,
      label: LOG_COPY.groupName,
      onName: (name) => void save(saveGroup(name, memberIds).then(onSaved)),
    })
}
