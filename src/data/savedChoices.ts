import { COMMON_COPY } from '../copy/common'
import type { ChoiceKind, SavedChoice } from '../domain/types'
import { db } from './db'

const tableFor = (kind: ChoiceKind) => (kind === 'place' ? db.savedPlaces : db.savedActivities)

export class ChoiceTakenError extends Error {
  constructor(kind: ChoiceKind, name: string) {
    super(COMMON_COPY.choiceTaken[kind](name))
  }
}

export async function saveChoices(kind: ChoiceKind, names: string[]) {
  const table = tableFor(kind)
  const savedAt = Date.now()

  await db.transaction('rw', table, async () => {
    for (const [index, name] of names.map((name) => name.trim()).entries()) {
      if (!(await table.get(name))) {
        await table.add({ name, savedAt: savedAt + index })
      }
    }
  })
}

export async function removeChoice(kind: ChoiceKind, name: string) {
  await tableFor(kind).delete(name)
}

export async function restoreChoice(kind: ChoiceKind, choice: SavedChoice) {
  await tableFor(kind).put(choice)
}

function renameInMeetups(kind: ChoiceKind, from: string, to: string) {
  if (kind === 'place') {
    return db.meetups.filter(({ place }) => place === from).modify({ place: to })
  }

  return db.meetups
    .filter(({ activities = [] }) => activities.includes(from))
    .modify((meetup) => {
      meetup.activities = [...new Set(meetup.activities?.map((activity) => (activity === from ? to : activity)))]
    })
}

export async function renameChoice(kind: ChoiceKind, from: string, to: string) {
  const table = tableFor(kind)
  const trimmed = to.trim()

  await db.transaction('rw', table, db.meetups, async () => {
    const existing = await table.get(from)

    if (!existing || trimmed === from) {
      return
    }

    if (await table.get(trimmed)) {
      throw new ChoiceTakenError(kind, trimmed)
    }

    await table.delete(from)
    await table.add({ ...existing, name: trimmed })
    await renameInMeetups(kind, from, trimmed)
  })
}

export const allSavedChoices = (kind: ChoiceKind) => tableFor(kind).toArray()
