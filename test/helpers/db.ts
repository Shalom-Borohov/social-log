import { db } from '../../src/data/db'

export async function resetDb() {
  await Promise.all([db.people.clear(), db.groups.clear(), db.meetups.clear()])
}
