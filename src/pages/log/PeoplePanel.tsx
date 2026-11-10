import { useId, useState } from 'react'
import { addPerson, setPersonHidden } from '../../data/repo'
import { GROUP_MINIMUM, groupSuggestion } from '../../domain/groupSuggestion'
import { peopleLabel, sameMembers } from '../../domain/sentence'
import type { Group, Meetup, Person } from '../../domain/types'
import { useSave } from '../../hooks/useSave'
import { LOG_COPY } from './copy'
import { type DraftFields, toggledIn } from './meetupDraft'
import { AddField } from './AddField'
import { Chip, ChipGroup, EditToggle, MainAction, Panel, RemoveChip } from './Panel'
import { useChipEditing } from './useChipEditing'
import { useGroupPrompt } from './useGroupPrompt'

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
  const { editing, toggleEditing, hideWithUndo } = useChipEditing()
  const shownPeople = people.filter((person) => !person.hidden || personIds.includes(person.id))
  const anyUnpicked = shownPeople.some((person) => !personIds.includes(person.id))

  const hide = (person: Person) =>
    hideWithUndo(
      () => setPersonHidden(person.id, true),
      () => setPersonHidden(person.id, false),
      LOG_COPY.personHidden(person.name),
    )

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
            <RemoveChip key={person.id} label={person.name} onRemove={() => void hide(person)} />
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
      <AddField label={LOG_COPY.newName} value={newName} onChange={setNewName} onAdd={() => void addNewPerson()} />
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
