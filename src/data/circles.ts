import { COMMON_COPY } from '../copy/common'
import { isFamilyCircle } from '../domain/circles'
import type { Circle } from '../domain/types'
import { db } from './db'
import { newId } from './repo'

export class FamilyNameTakenError extends Error {
  constructor() {
    super(COMMON_COPY.familyCircleTaken)
  }
}

function refuseTheFamilyName(name: string) {
  if (name === COMMON_COPY.family) {
    throw new FamilyNameTakenError()
  }
}

export async function saveCircle(name: string): Promise<Circle> {
  const circle: Circle = { id: newId(), name: name.trim(), memberIds: [] }

  refuseTheFamilyName(circle.name)
  await db.circles.add(circle)

  return circle
}

export async function renameCircle(id: string, name: string) {
  const trimmed = name.trim()

  refuseTheFamilyName(trimmed)

  if (trimmed) {
    await db.circles.update(id, { name: trimmed })
  }
}

export async function deleteCircle(id: string) {
  await db.circles.delete(id)
}

const editMembers = (id: string, edit: (memberIds: string[]) => string[]) =>
  db.circles
    .where('id')
    .equals(id)
    .modify((circle) => {
      circle.memberIds = edit(circle.memberIds)
    })

export async function joinCircle(id: string, personIds: string[]) {
  await editMembers(id, (memberIds) => [...new Set([...memberIds, ...personIds])])
}

export async function setCircleMember(id: string, personId: string, member: boolean) {
  if (member) {
    await joinCircle(id, [personId])

    return
  }

  await editMembers(id, (memberIds) => memberIds.filter((memberId) => memberId !== personId))
}

export async function allCircles() {
  const circles = await db.circles.toArray()

  const othersByName = circles
    .filter((circle) => !isFamilyCircle(circle))
    .sort((first, second) => first.name.localeCompare(second.name, 'he'))

  return [...circles.filter(isFamilyCircle), ...othersByName]
}
