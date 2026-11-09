import { fireEvent, screen, waitFor } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { readLastBackup } from '../../src/backup/lastBackup'
import { db } from '../../src/data/db'
import { chooseBackupFile, chooseUnreadableBackupFile } from '../helpers/backupFile'
import { aMeetup, aPerson } from '../helpers/meetups'
import { missingPeople, openRecoveryScreen, prepareRecoveryScreen } from '../helpers/recovery'

const WARNING = 'הייבוא יחליף את כל הנתונים. כדאי לייצא גיבוי קודם.'

const EARLIER_BACKUP_AT = new Date(2026, 9, 30, 8, 0).getTime()

const restoredDay = aMeetup({ id: 'restored', date: '2026-10-29' })

const earlierBackup = JSON.stringify({
  version: 1,
  exportedAt: EARLIER_BACKUP_AT,
  people: [aPerson({ id: 'noam' })],
  groups: [],
  meetups: [restoredDay],
})

describe('importing a backup from the recovery screen', () => {
  prepareRecoveryScreen()

  it('warns about a valid file and changes nothing until confirmed', async () => {
    await openRecoveryScreen()

    chooseBackupFile(earlierBackup)

    expect((await screen.findByText(WARNING)).closest('[role="status"]')).not.toBeNull()
    expect(screen.queryByRole('button', { name: 'ייבוא גיבוי' })).not.toBeInTheDocument()
    expect(await db.meetups.toArray()).toEqual([missingPeople])
  })

  it('goes back to the button with the data unchanged when cancelled', async () => {
    await openRecoveryScreen()

    chooseBackupFile(earlierBackup)
    fireEvent.click(await screen.findByRole('button', { name: 'ביטול' }))

    expect(await screen.findByRole('button', { name: 'ייבוא גיבוי' })).toBeVisible()
    expect(screen.queryByText(WARNING)).not.toBeInTheDocument()
    expect(await db.meetups.toArray()).toEqual([missingPeople])
  })

  it('replaces the data, records the backup time and opens at the start when confirmed', async () => {
    await openRecoveryScreen()

    chooseBackupFile(earlierBackup)
    fireEvent.click(await screen.findByRole('button', { name: 'ייבוא' }))

    await waitFor(() => expect(readLastBackup()).toBe(EARLIER_BACKUP_AT))
    expect(await db.meetups.toArray()).toEqual([restoredDay])
    expect(window.location.hash).toBe('')
  })

  it('says so when the file is not a valid backup', async () => {
    await openRecoveryScreen()

    chooseBackupFile('{"version":1}')

    expect(await screen.findByText('קובץ הגיבוי לא תקין')).toBeVisible()
    expect(await db.meetups.toArray()).toEqual([missingPeople])
  })

  it('never shows the browser message when the file cannot be read', async () => {
    await openRecoveryScreen()

    chooseUnreadableBackupFile('The requested file could not be read')

    expect(await screen.findByText('הפעולה נכשלה')).toBeVisible()
    expect(screen.queryByText('The requested file could not be read')).not.toBeInTheDocument()
    expect(await db.meetups.toArray()).toEqual([missingPeople])
  })

  it('keeps the data and says so when the restore fails', async () => {
    await openRecoveryScreen()

    chooseBackupFile(earlierBackup)

    const confirm = await screen.findByRole('button', { name: 'ייבוא' })

    vi.spyOn(db.meetups, 'bulkPut').mockRejectedValue(new Error('Connection lost'))
    fireEvent.click(confirm)

    expect(await screen.findByText('לא נשמר. אפשר לנסות שוב.')).toBeVisible()
    expect(screen.queryByText('Connection lost')).not.toBeInTheDocument()
    expect(await db.meetups.toArray()).toEqual([missingPeople])
    expect(readLastBackup()).toBeNull()
  })

  it('drops the failure message when the import is cancelled', async () => {
    await openRecoveryScreen()

    chooseBackupFile(earlierBackup)

    const confirm = await screen.findByRole('button', { name: 'ייבוא' })

    vi.spyOn(db.meetups, 'bulkPut').mockRejectedValue(new Error('Connection lost'))
    fireEvent.click(confirm)
    await screen.findByText('לא נשמר. אפשר לנסות שוב.')
    fireEvent.click(screen.getByRole('button', { name: 'ביטול' }))

    expect(await screen.findByRole('button', { name: 'ייבוא גיבוי' })).toBeVisible()
    expect(screen.queryByText('לא נשמר. אפשר לנסות שוב.')).not.toBeInTheDocument()
  })

  it('restores once and cannot be cancelled once confirmed', async () => {
    await openRecoveryScreen()

    chooseBackupFile(earlierBackup)

    const confirm = await screen.findByRole('button', { name: 'ייבוא' })
    const cancel = screen.getByRole('button', { name: 'ביטול' })
    const write = vi.spyOn(db.meetups, 'bulkPut')

    fireEvent.click(confirm)
    fireEvent.click(confirm)
    fireEvent.click(cancel)

    await waitFor(() => expect(readLastBackup()).toBe(EARLIER_BACKUP_AT))
    expect(write).toHaveBeenCalledOnce()
    expect(screen.queryByRole('button', { name: 'ייבוא גיבוי' })).not.toBeInTheDocument()
  })

  it('still opens at the start when the backup time cannot be stored', async () => {
    await openRecoveryScreen()

    chooseBackupFile(earlierBackup)

    const confirm = await screen.findByRole('button', { name: 'ייבוא' })

    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('Storage is full')
    })
    fireEvent.click(confirm)

    await waitFor(() => expect(window.location.hash).toBe(''))
    expect(await db.meetups.toArray()).toEqual([restoredDay])
    expect(screen.queryByText('לא נשמר. אפשר לנסות שוב.')).not.toBeInTheDocument()
  })

  it('offers the import again after a failed restore', async () => {
    await openRecoveryScreen()

    chooseBackupFile(earlierBackup)

    const confirm = await screen.findByRole('button', { name: 'ייבוא' })

    vi.spyOn(db.meetups, 'bulkPut').mockRejectedValue(new Error('Connection lost'))
    fireEvent.click(confirm)
    await screen.findByText('לא נשמר. אפשר לנסות שוב.')

    expect(confirm).toBeEnabled()
    expect(screen.getByRole('button', { name: 'ביטול' })).toBeEnabled()
  })
})
