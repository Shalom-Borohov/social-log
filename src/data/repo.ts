import { COMMON_COPY } from '../copy/common'
import { isUnused } from '../domain/person'
import type { Group, Meetup, MeetupDraft, Person } from '../domain/types'
import { db } from './db'

const newId = () => crypto.randomUUID()

export function cleanDraft({ activities, initiator, note, groupId, ...required }: MeetupDraft): MeetupDraft {
  const trimmedNote = note?.trim()
  const trimmedActivities = activities?.map((activity) => activity.trim()).filter(Boolean)

  return {
    ...required,
    place: required.place.trim(),
    ...(groupId ? { groupId } : {}),
    ...(trimmedActivities?.length ? { activities: trimmedActivities } : {}),
    ...(initiator ? { initiator } : {}),
    ...(trimmedNote ? { note: trimmedNote } : {}),
  }
}

export async function addPerson(name: string): Promise<Person> {
  const trimmed = name.trim()

  return db.transaction('rw', db.people, async () => {
    const existing = await db.people.where('name').equals(trimmed).first()

    if (existing) {
      return existing
    }

    const person: Person = { id: newId(), name: trimmed, hidden: false, createdAt: Date.now() }

    await db.people.add(person)

    return person
  })
}

export async function forgetUnusedPeople(ids: string[]) {
  await db.transaction('rw', db.people, db.groups, db.meetups, async () => {
    const groups = await db.groups.toArray()

    for (const id of ids) {
      const meetups = await db.meetups.where('personIds').equals(id).toArray()

      if (isUnused(id, meetups, groups)) {
        await db.people.delete(id)
      }
    }
  })
}

export async function setPersonHidden(id: string, hidden: boolean) {
  await db.people.update(id, { hidden })
}

export class NameTakenError extends Error {
  constructor(name: string) {
    super(COMMON_COPY.nameTaken(name))
  }
}

export async function renamePerson(id: string, name: string) {
  const trimmed = name.trim()

  if (!trimmed) {
    return
  }

  await db.transaction('rw', db.people, async () => {
    const namesake = await db.people.where('name').equals(trimmed).first()

    if (namesake && namesake.id !== id) {
      throw new NameTakenError(trimmed)
    }

    await db.people.update(id, { name: trimmed })
  })
}

export async function renameGroup(id: string, name: string) {
  const trimmed = name.trim()

  if (trimmed) {
    await db.groups.update(id, { name: trimmed })
  }
}

export async function deleteGroup(id: string) {
  await db.groups.delete(id)
}

export async function saveGroup(name: string, memberIds: string[]): Promise<Group> {
  const group: Group = { id: newId(), name: name.trim(), memberIds }

  await db.groups.add(group)

  return group
}

export async function addMeetup(draft: MeetupDraft): Promise<string> {
  const meetup: Meetup = { ...cleanDraft(draft), id: newId(), createdAt: Date.now() }

  await db.meetups.add(meetup)

  return meetup.id
}

export async function updateMeetup(id: string, draft: MeetupDraft) {
  await db.transaction('rw', db.meetups, async () => {
    const existing = await db.meetups.get(id)

    if (existing) {
      await db.meetups.put({ ...cleanDraft(draft), id, createdAt: existing.createdAt })
    }
  })
}

export async function deleteMeetup(id: string) {
  await db.meetups.delete(id)
}

export const allPeople = () => db.people.orderBy('name').toArray()

export const allGroups = () => db.groups.toArray()

export const allMeetups = () => db.meetups.orderBy('date').toArray()
