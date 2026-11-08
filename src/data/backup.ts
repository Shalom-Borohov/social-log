import {
  array,
  boolean,
  check,
  type GenericSchema,
  integer,
  literal,
  maxValue,
  minLength,
  minValue,
  number,
  object,
  optional,
  picklist,
  pipe,
  safeParse,
  string,
} from 'valibot'
import { APP_COPY } from '../copy/app'
import { isIsoDate, logicalToday, MINUTES_PER_HOUR } from '../domain/logicalDay'
import { type Group, INITIATORS, type Meetup, type Person, RATINGS } from '../domain/types'
import { db } from './db'

export type Backup = { version: 1; exportedAt: number; people: Person[]; groups: Group[]; meetups: Meetup[] }

const isNotInTheFuture = (date: string) => date <= logicalToday(Date.now())

const HOURS_PER_DAY = 24

const MINUTES_PER_DAY = HOURS_PER_DAY * MINUTES_PER_HOUR

export class InvalidBackupError extends Error {
  constructor() {
    super(APP_COPY.invalidBackup)
  }
}

const personSchema = object({ id: string(), name: string(), hidden: boolean(), createdAt: number() })

const groupSchema = object({ id: string(), name: string(), memberIds: array(string()) })

const meetupSchema = object({
  id: string(),
  date: pipe(string(), check(isIsoDate), check(isNotInTheFuture)),
  personIds: pipe(array(string()), minLength(1)),
  groupId: optional(string()),
  place: pipe(string(), minLength(1)),
  minutes: pipe(number(), integer(), minValue(1), maxValue(MINUTES_PER_DAY)),
  rating: picklist(RATINGS),
  activities: optional(array(string())),
  initiator: optional(picklist(INITIATORS)),
  note: optional(string()),
  createdAt: number(),
})

const everyoneIsKnown = ({ people, meetups }: Backup) => {
  const personIds = new Set(people.map(({ id }) => id))

  return meetups.every((meetup) => meetup.personIds.every((personId) => personIds.has(personId)))
}

const backupSchema = pipe(
  object({
    version: literal(1),
    exportedAt: number(),
    people: array(personSchema),
    groups: array(groupSchema),
    meetups: array(meetupSchema),
  }),
  check(everyoneIsKnown),
)

function parseJson(text: string) {
  try {
    return JSON.parse(text)
  } catch {
    return null
  }
}

export function parseBackup(text: string): Backup {
  const result = safeParse(backupSchema, parseJson(text))

  if (!result.success) {
    throw new InvalidBackupError()
  }

  return result.output
}

export async function exportBackup(now: number): Promise<Backup> {
  const [people, groups, meetups] = await Promise.all([
    db.people.toArray(),
    db.groups.toArray(),
    db.meetups.orderBy('date').toArray(),
  ])


  return { version: 1, exportedAt: now, people, groups, meetups }
}

const countInvalid = (records: unknown[], schema: GenericSchema) =>
  records.filter((record) => !safeParse(schema, record).success).length

export function countBadRecords(fileText: string): number {
  const { people, groups, meetups } = JSON.parse(fileText)

  return countInvalid(people, personSchema) + countInvalid(groups, groupSchema) + countInvalid(meetups, meetupSchema)
}

export async function restoreBackup(backup: Backup): Promise<void> {
  await db.transaction('rw', db.people, db.groups, db.meetups, async () => {
    await Promise.all([db.people.clear(), db.groups.clear(), db.meetups.clear()])
    await Promise.all([db.people.bulkPut(backup.people), db.groups.bulkPut(backup.groups), db.meetups.bulkPut(backup.meetups)])
  })
}
