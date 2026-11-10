import { useId, useState } from 'react'
import { addPerson, setPersonHidden } from '../../data/repo'
import { GROUP_MINIMUM, groupSuggestion } from '../../domain/groupSuggestion'
import { peopleLabel, sameMembers } from '../../domain/sentence'
import type { Group, Meetup, Person } from '../../domain/types'
import { useRemoveWithUndo } from '../../hooks/useRemoveWithUndo'
import { useSave } from '../../hooks/useSave'
import { LOG_COPY } from './copy'
import { type DraftFields, toggledIn } from './meetupDraft'
import { AddField } from './AddField'
import { Chip, ChipGroup, EditToggle, MainAction, Panel, RemoveChip } from './Panel'
import { useChipEditing } from './useChipEditing'
import { useGroupPrompt } from './useGroupPrompt'
import { useSplitPrompt } from './useSplitPrompt'

async function addInOrder(names: string[]) {
  const ids: string[] = []

  for (const name of names) {
    ids.push((await addPerson(name)).id)
  }

  return [...new Set(ids)]
}

type PeopleChoice = Pick<DraftFields, 'personIds' | 'groupId'>

interface PeoplePanelProps {
  choice: PeopleChoice
  meetupId?: string
  people: Person[]
  groups: Group[]
  meetups: Meetup[]
  onChange: (choice: Partial<PeopleChoice>) => void
  onNewPerson: (personId: string) => void
  onNext: () => void
}

export function PeoplePanel({ choice, meetupId, people, groups, meetups, onChange, onNewPerson, onNext }: PeoplePanelProps) {
  const { personIds, groupId } = choice
  const [newName, setNewName] = useState('')
  const hintId = useId()
  const together = groupSuggestion(personIds, meetups, groups, meetupId)
  const suggestGroup = together > 0
  const save = useSave()
  const askGroupName = useGroupPrompt((group) => onChange({ groupId: group.id }))
  const askSplit = useSplitPrompt()
  const { editing, toggleEditing } = useChipEditing()
  const hideWithUndo = useRemoveWithUndo()
  const shownPeople = people.filter((person) => !person.hidden || personIds.includes(person.id))
  const anyUnpicked = shownPeople.some((person) => !personIds.includes(person.id))

  const hide = (person: Person) =>
    hideWithUndo(
      () => setPersonHidden(person.id, true),
      () => setPersonHidden(person.id, false),
      LOG_COPY.personHidden(person.name),
    )

  async function addPeople(names: string[]) {
    const added = await save(
      addInOrder(names).then((addedIds) => {
        for (const id of addedIds) {
          if (!people.some((person) => person.id === id)) {
            onNewPerson(id)
          }
        }

        onChange({ personIds: [...new Set([...personIds, ...addedIds])] })
      }),
    )

    if (added) {
      setNewName('')
    }
  }

  const addNewName = () =>
    askSplit({
      text: newName,
      header: LOG_COPY.splitAddHeader,
      onParts: (parts) => void addPeople(parts),
      onWhole: (text) => void addPeople([text]),
    })

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
              disabled={editing}
              onClick={() => onChange({ personIds: group.memberIds, groupId: group.id })}
            />
          ))}
        </ChipGroup>
      )}
      {(anyUnpicked || editing) && <EditToggle editing={editing} onToggle={toggleEditing} />}
      <ChipGroup label={LOG_COPY.people}>
        {shownPeople.map((person) => {
          const picked = personIds.includes(person.id)

          return editing && !picked ? (
            <RemoveChip
              key={person.id}
              label={person.name}
              removeLabel={LOG_COPY.hideChip(person.name)}
              onRemove={() => void hide(person)}
            />
          ) : (
            <Chip
              key={person.id}
              label={person.name}
              pressed={picked}
              disabled={editing}
              onClick={() => onChange({ personIds: toggledIn(personIds, person.id) })}
            />
          )
        })}
      </ChipGroup>
      <AddField label={LOG_COPY.newName} value={newName} onChange={setNewName} onAdd={addNewName} />
      {suggestGroup && (
        <p id={hintId} className="log-group-hint">
          {LOG_COPY.togetherBefore(together, peopleLabel(personIds, people, groups))}
        </p>
      )}
      {personIds.length >= GROUP_MINIMUM && (
        <button
          type="button"
          className="log-quiet-action"
          aria-describedby={suggestGroup ? hintId : undefined}
          onClick={() => askGroupName(personIds)}
        >
          {LOG_COPY.saveAsGroup}
        </button>
      )}
    </Panel>
  )
}
