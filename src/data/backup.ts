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
import { initialSavedLists } from '../domain/choices'
import { isIsoDate, logicalToday, MINUTES_PER_HOUR } from '../domain/logicalDay'
import { type Circle, type Group, INITIATORS, type Meetup, type Person, RATINGS, type SavedChoice } from '../domain/types'
import { db } from './db'

export type Backup = {
  version: 1
  exportedAt: number
  people: Person[]
  groups: Group[]
  meetups: Meetup[]
  hiddenPlaces?: string[]
  savedPlaces?: SavedChoice[]
  savedActivities?: SavedChoice[]
  circles?: Circle[]
}

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

const circleSchema = object({ id: string(), name: string(), memberIds: array(string()) })

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

const savedChoiceSchema = object({ name: pipe(string(), minLength(1)), savedAt: number() })

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
    hiddenPlaces: optional(array(string())),
    savedPlaces: optional(array(savedChoiceSchema)),
    savedActivities: optional(array(savedChoiceSchema)),
    circles: optional(array(circleSchema)),
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
  const [people, groups, meetups, savedPlaces, savedActivities, circles] = await Promise.all([
    db.people.toArray(),
    db.groups.toArray(),
    db.meetups.orderBy('date').toArray(),
    db.savedPlaces.toArray(),
    db.savedActivities.toArray(),
    db.circles.toArray(),
  ])


  return { version: 1, exportedAt: now, people, groups, meetups, savedPlaces, savedActivities, circles }
}

const countInvalid = (records: unknown[], schema: GenericSchema) =>
  records.filter((record) => !safeParse(schema, record).success).length

export function countBadRecords(fileText: string): number {
  const { people, groups, meetups, savedPlaces = [], savedActivities = [], circles = [] } = JSON.parse(fileText)

  return (
    countInvalid(people, personSchema) +
    countInvalid(groups, groupSchema) +
    countInvalid(meetups, meetupSchema) +
    countInvalid(savedPlaces, savedChoiceSchema) +
    countInvalid(savedActivities, savedChoiceSchema) +
    countInvalid(circles, circleSchema)
  )
}

export async function restoreBackup(backup: Backup): Promise<void> {
  const { people, groups, meetups, hiddenPlaces = [], savedPlaces, savedActivities, circles = [] } = backup
  const chipsTheFileShowed = initialSavedLists(meetups, hiddenPlaces)
  const tables = [db.people, db.groups, db.meetups, db.savedPlaces, db.savedActivities, db.circles]

  await db.transaction('rw', tables, async () => {
    await Promise.all(tables.map((table) => table.clear()))
    await Promise.all([
      db.people.bulkPut(people),
      db.groups.bulkPut(groups),
      db.meetups.bulkPut(meetups),
      db.savedPlaces.bulkPut(savedPlaces ?? chipsTheFileShowed.places),
      db.savedActivities.bulkPut(savedActivities ?? chipsTheFileShowed.activities),
      db.circles.bulkPut(circles),
    ])
  })
}
