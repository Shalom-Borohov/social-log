import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'
import { App } from '../../src/App'
import { db } from '../../src/data/db'
import { readLastBackup } from '../../src/backup/lastBackup'
import { stubShare } from '../helpers/backupFile'
import { resetDb } from '../helpers/db'
import { aMeetup, aPerson } from '../helpers/meetups'
import { missingPeople, openRecoveryScreen, prepareRecoveryScreen } from '../helpers/recovery'

const RECOVERY_HEADING = 'משהו השתבש'

const EXPORT_BUTTON = 'ייצוא גיבוי'

const goodDay = aMeetup({ id: 'good', date: '2026-11-01' })

async function sharedFileText(share: ReturnType<typeof stubShare>) {
  const [data] = share.mock.calls[0]
  const [file] = data.files ?? []

  return file.text()
}

async function openOnStoredRecords() {
  await db.people.put(aPerson({ id: 'noam' }))

  return openRecoveryScreen([goodDay])
}

describe('a malformed stored record', () => {
  prepareRecoveryScreen()

  it('shows the recovery screen instead of a blank page', async () => {
    expect(await openOnStoredRecords()).toBeVisible()
  })

  it('exports every stored record from the recovery screen, the bad one included', async () => {
    const share = stubShare(() => Promise.resolve())

    await openOnStoredRecords()
    fireEvent.click(screen.getByRole('button', { name: EXPORT_BUTTON }))
    await waitFor(() => expect(share).toHaveBeenCalledOnce())

    const exported = JSON.parse(await sharedFileText(share))

    expect(exported.meetups.map((stored: { date: string }) => stored.date)).toEqual(['2026-11-01', '2026-11-02'])
  })

  it('says at export time that the file holds a record that cannot be restored', async () => {
    stubShare(() => Promise.resolve())

    await openOnStoredRecords()
    fireEvent.click(screen.getByRole('button', { name: EXPORT_BUTTON }))

    expect(await screen.findByText('בגיבוי יש רשומה פגומה אחת, וייבוא הקובץ ייכשל')).toBeVisible()
  })

  it('reports a failed export on the recovery screen', async () => {
    stubShare(() => Promise.reject(new Error('share failed')))

    await openOnStoredRecords()
    fireEvent.click(screen.getByRole('button', { name: EXPORT_BUTTON }))

    expect(await screen.findByText('הפעולה נכשלה')).toBeVisible()
  })

  it('does not count the file with the bad record as a backup', async () => {
    stubShare(() => Promise.resolve())

    await openOnStoredRecords()
    fireEvent.click(screen.getByRole('button', { name: EXPORT_BUTTON }))

    expect(await screen.findByText('בגיבוי יש רשומה פגומה אחת, וייבוא הקובץ ייכשל')).toBeVisible()
    expect(readLastBackup()).toBeNull()
  })

  it('never changes what is stored', async () => {
    await openOnStoredRecords()

    expect(await db.meetups.toArray()).toEqual([missingPeople, goodDay])
  })

  it('offers a reload', async () => {
    await openOnStoredRecords()

    expect(screen.getByRole('button', { name: 'טעינה מחדש' })).toBeVisible()
  })

  it('reloads at the start, so the page that could not draw does not open again', async () => {
    await openOnStoredRecords()
    fireEvent.click(screen.getByRole('button', { name: 'טעינה מחדש' }))

    expect(window.location.hash).toBe('')
  })
})

describe('the app with sound records', () => {
  beforeEach(resetDb)

  it('does not show the recovery screen', async () => {
    await db.meetups.put(goodDay)
    window.location.hash = '#/tabs/friends'
    render(<App />)

    expect(await screen.findAllByText('מי קרוב אליך עכשיו')).not.toHaveLength(0)
    expect(screen.queryByRole('heading', { name: RECOVERY_HEADING })).not.toBeInTheDocument()
  })
})
