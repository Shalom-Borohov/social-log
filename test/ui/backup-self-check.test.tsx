import { fireEvent, screen, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { readLastBackup, saveLastBackup } from '../../src/backup/lastBackup'
import { db } from '../../src/data/db'
import { stubShare } from '../helpers/backupFile'
import { freezeDate } from '../helpers/clock'
import { resetDb } from '../helpers/db'
import { aMeetup, aPerson } from '../helpers/meetups'
import { alertMessage, alertShown, overlaysSettled, toasts } from '../helpers/overlays'
import { renderAt } from '../helpers/renderAt'

const unratedMeetup = JSON.parse(
  '{"id":"unrated","date":"2026-11-02","personIds":["noam"],"place":"בים","minutes":60,"rating":9,"createdAt":0}',
)

const namelessPerson = JSON.parse('{"id":"nameless","hidden":false,"createdAt":0}')

const ONE_BAD = 'בגיבוי יש רשומה פגומה אחת, וייבוא הקובץ ייכשל'

const EARLIER_BACKUP_AT = new Date(2026, 10, 1, 9).getTime()

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
  freezeDate(new Date(2026, 10, 5, 10).getTime())

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('still produces the file and says it holds a bad record', async () => {
    await db.people.put(aPerson({ id: 'noam' }))
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

  it('does not count a file with a bad record as a backup', async () => {
    await db.meetups.put(unratedMeetup)
    stubShare(() => Promise.resolve())

    await exportUntilAlert()

    expect(readLastBackup()).toBeNull()
  })

  it('keeps the earlier backup time after a file with a bad record', async () => {
    saveLastBackup(EARLIER_BACKUP_AT)
    await db.meetups.put(unratedMeetup)
    stubShare(() => Promise.resolve())

    await exportUntilAlert()

    expect(readLastBackup()).toBe(EARLIER_BACKUP_AT)
  })

  it('says a meetup with someone not stored is a bad record, and does not count the file', async () => {
    await db.meetups.put(aMeetup({ personIds: ['stranger'] }))
    stubShare(() => Promise.resolve())

    await exportUntilAlert()

    expect(alertMessage()).toBe(ONE_BAD)
    expect(readLastBackup()).toBeNull()
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

  it('does not report a shared file as failed when the backup time cannot be stored', async () => {
    await db.people.put(aPerson({ id: 'noam' }))
    await db.meetups.put(aMeetup())
    const share = stubShare(() => Promise.resolve())
    const button = await openExport()

    const setItem = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('Storage is full')
    })

    fireEvent.click(button)
    await waitFor(() => expect(share).toHaveBeenCalledOnce())
    await waitFor(() => expect(setItem).toHaveBeenCalledWith('social-log:last-backup-at', expect.any(String)))
    await overlaysSettled()

    expect(toasts()).not.toContain('הפעולה נכשלה')
  })
})
