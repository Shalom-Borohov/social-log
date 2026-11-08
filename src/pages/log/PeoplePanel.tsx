import { useState } from 'react'
import { addPerson } from '../../data/repo'
import { sameMembers } from '../../domain/sentence'
import type { Group, Person } from '../../domain/types'
import { useSave } from '../../hooks/useSave'
import { LOG_COPY } from './copy'
import { type DraftFields, toggledIn } from './meetupDraft'
import { AddField } from './AddField'
import { Chip, ChipGroup, MainAction, Panel } from './Panel'
import { useGroupPrompt } from './useGroupPrompt'

const GROUP_MINIMUM = 2

type PeopleChoice = Pick<DraftFields, 'personIds' | 'groupId'>

interface PeoplePanelProps {
  choice: PeopleChoice
  people: Person[]
  groups: Group[]
  onChange: (choice: Partial<PeopleChoice>) => void
  onNewPerson: (personId: string) => void
  onNext: () => void
}

export function PeoplePanel({ choice, people, groups, onChange, onNewPerson, onNext }: PeoplePanelProps) {
  const { personIds, groupId } = choice
  const [newName, setNewName] = useState('')
  const save = useSave()
  const askGroupName = useGroupPrompt((group) => onChange({ groupId: group.id }))
  const shownPeople = people.filter((person) => !person.hidden || personIds.includes(person.id))

  async function addNewPerson() {
    const added = await save(
      addPerson(newName).then((person) => {
        if (!people.some(({ id }) => id === person.id)) {
          onNewPerson(person.id)
        }

        onChange({ personIds: personIds.includes(person.id) ? personIds : [...personIds, person.id] })
      }),
    )

    if (added) {
      setNewName('')
    }
  }

  return (
    <Panel
      heading={LOG_COPY.panelHeadings.people}
      action={<MainAction label={LOG_COPY.next} disabled={personIds.length === 0} onClick={onNext} />}
    >
      {groups.length > 0 && (
        <ChipGroup label={LOG_COPY.groups}>
          {groups.map((group) => (
            <Chip
              key={group.id}
              label={group.name}
              pressed={group.id === groupId && sameMembers(personIds, group)}
              onClick={() => onChange({ personIds: group.memberIds, groupId: group.id })}
            />
          ))}
        </ChipGroup>
      )}
      <ChipGroup label={LOG_COPY.people}>
        {shownPeople.map((person) => (
          <Chip
            key={person.id}
            label={person.name}
            pressed={personIds.includes(person.id)}
            onClick={() => onChange({ personIds: toggledIn(personIds, person.id) })}
          />
        ))}
      </ChipGroup>
      <AddField label={LOG_COPY.newName} value={newName} onChange={setNewName} onAdd={() => void addNewPerson()} />
      {personIds.length >= GROUP_MINIMUM && (
        <button type="button" className="log-quiet-action" onClick={() => askGroupName(personIds)}>
          {LOG_COPY.saveAsGroup}
        </button>
      )}
    </Panel>
  )
}
