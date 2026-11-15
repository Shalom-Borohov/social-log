import { useId, useState } from 'react'
import { joinCircle } from '../../data/circles'
import { addPerson } from '../../data/repo'
import { chipPeople } from '../../domain/circles'
import { GROUP_MINIMUM, groupSuggestion } from '../../domain/groupSuggestion'
import { peopleLabel, sameMembers } from '../../domain/sentence'
import type { Circle, Group, Meetup, Person } from '../../domain/types'
import { useSave } from '../../hooks/useSave'
import { LOG_COPY } from './copy'
import { type DraftFields, toggledIn } from './meetupDraft'
import { AddField } from './AddField'
import { CircleFilter } from './CircleFilter'
import { Chip, ChipGroup, EditToggle, LabelledChipGroup, MainAction, Panel, RemoveChip } from './Panel'
import { useChipEditing } from './useChipEditing'
import { usePersonChipRemoval } from './usePersonChipRemoval'
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
  circles: Circle[]
  meetups: Meetup[]
  onChange: (choice: Partial<PeopleChoice>) => void
  onNewPerson: (personId: string) => void
  onNext: () => void
}

export function PeoplePanel({
  choice,
  meetupId,
  people,
  groups,
  circles,
  meetups,
  onChange,
  onNewPerson,
  onNext,
}: PeoplePanelProps) {
  const { personIds, groupId } = choice
  const [newName, setNewName] = useState('')
  const [circleId, setCircleId] = useState<string>()
  const circle = circles.find(({ id }) => id === circleId)
  const hintId = useId()
  const together = groupSuggestion(personIds, meetups, groups, meetupId)
  const suggestGroup = together > 0
  const save = useSave()
  const askGroupName = useGroupPrompt((group) => onChange({ groupId: group.id }))
  const askSplit = useSplitPrompt()
  const { editing, toggleEditing } = useChipEditing()
  const { removeLabel, remove } = usePersonChipRemoval(meetups, groups, circles)
  const shownPeople = chipPeople(people, personIds, circle)
  const anyUnpicked = shownPeople.some((person) => !personIds.includes(person.id))

  async function addPeople(names: string[]) {
    const added = await save(
      addInOrder(names).then(async (addedIds) => {
        if (circle) {
          await joinCircle(circle.id, addedIds)
        }

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
        <LabelledChipGroup label={LOG_COPY.groups}>
          {groups.map((group) => {
            const groupPicked = group.id === groupId && sameMembers(personIds, group)

            return (
              <Chip
                key={group.id}
                label={group.name}
                pressed={groupPicked}
                disabled={editing}
                onClick={() =>
                  onChange(
                    groupPicked ? { personIds: [], groupId: undefined } : { personIds: group.memberIds, groupId: group.id },
                  )
                }
              />
            )
          })}
        </LabelledChipGroup>
      )}
      <CircleFilter circles={circles} selectedId={circle?.id} onSelect={setCircleId} />
      {(anyUnpicked || editing) && <EditToggle editing={editing} onToggle={toggleEditing} />}
      <ChipGroup label={LOG_COPY.people}>
        {shownPeople.map((person) => {
          const picked = personIds.includes(person.id)

          return editing && !picked ? (
            <RemoveChip
              key={person.id}
              label={person.name}
              removeLabel={removeLabel(person)}
              onRemove={() => void remove(person)}
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
