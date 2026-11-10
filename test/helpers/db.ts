import { db } from '../../src/data/db'
import { initialSavedLists } from '../../src/domain/choices'

export async function resetDb() {
  const { places, activities } = initialSavedLists([], [])

  await Promise.all(db.tables.map((table) => table.clear()))
  await Promise.all([db.savedPlaces.bulkAdd(places), db.savedActivities.bulkAdd(activities)])
}
