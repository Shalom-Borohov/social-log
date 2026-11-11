import type { Circle } from '../domain/types'
import { db } from './db'
import { newId } from './repo'

export async function saveCircle(name: string): Promise<Circle> {
  const circle: Circle = { id: newId(), name: name.trim(), memberIds: [] }

  await db.circles.add(circle)

  return circle
}

export async function renameCircle(id: string, name: string) {
  const trimmed = name.trim()

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

export const allCircles = async () =>
  (await db.circles.toArray()).sort((first, second) => first.name.localeCompare(second.name, 'he'))
