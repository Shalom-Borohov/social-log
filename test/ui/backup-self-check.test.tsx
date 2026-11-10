import { fireEvent, screen, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { readLastBackup } from '../../src/backup/lastBackup'
import { db } from '../../src/data/db'
import { stubShare } from '../helpers/backupFile'
import { resetDb } from '../helpers/db'
import { aMeetup, aPerson } from '../helpers/meetups'
import { alertMessage, alertShown, toasts } from '../helpers/overlays'
import { renderAt } from '../helpers/renderAt'

const unratedMeetup = JSON.parse(
  '{"id":"unrated","date":"2026-11-02","personIds":["noam"],"place":"בים","minutes":60,"rating":9,"createdAt":0}',
)

const namelessPerson = JSON.parse('{"id":"nameless","hidden":false,"createdAt":0}')

const ONE_BAD = 'בגיבוי יש רשומה פגומה אחת, וייבוא הקובץ ייכשל'

async function openExport() {
  renderAt('/tabs/calendar/settings')

  return screen.findByText('ייצוא גיבוי')
}

async function exportUntilAlert() {
  const button = await openExport()
  const shown = alertShown()

  fireEvent.click(button)
  await shown
}

describe('exporting a backup', () => {
  beforeEach(resetDb)

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('still produces the file and says it holds a bad record', async () => {
    await db.meetups.bulkPut([aMeetup(), unratedMeetup])
    const share = stubShare(() => Promise.resolve())

    await exportUntilAlert()

    expect(share).toHaveBeenCalledOnce()
    expect(alertMessage()).toBe(ONE_BAD)
  })

  it('counts bad records across people and meetups', async () => {
    await db.meetups.put(unratedMeetup)
    await db.people.put(namelessPerson)
    stubShare(() => Promise.resolve())

    await exportUntilAlert()

    expect(alertMessage()).toBe('בגיבוי יש 2 רשומות פגומות, וייבוא הקובץ ייכשל')
  })

  it('says so even when the share is cancelled', async () => {
    await db.meetups.put(unratedMeetup)
    stubShare(() => Promise.reject(new DOMException('cancelled', 'AbortError')))

    await exportUntilAlert()

    expect(alertMessage()).toBe(ONE_BAD)
    expect(toasts()).not.toContain('הפעולה נכשלה')
    expect(readLastBackup()).toBeNull()
  })

  it('counts a file with a bad record as a backup', async () => {
    await db.meetups.put(unratedMeetup)
    stubShare(() => Promise.resolve())

    await exportUntilAlert()

    expect(readLastBackup()).not.toBeNull()
  })

  it('says nothing about a file with only sound records', async () => {
    await db.people.put(aPerson({ id: 'noam' }))
    await db.meetups.put(aMeetup())
    const share = stubShare(() => Promise.resolve())

    fireEvent.click(await openExport())
    await waitFor(() => expect(share).toHaveBeenCalledOnce())
    await waitFor(() => expect(readLastBackup()).not.toBeNull())

    expect(document.querySelector('ion-alert')).toBeNull()
  })
})
