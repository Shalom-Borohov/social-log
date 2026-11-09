import { fireEvent, screen, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'
import { saveLastBackup } from '../../src/backup/lastBackup'
import { stubShare } from '../helpers/backupFile'
import { dayButton, openCalendar, store } from '../helpers/calendar'
import { freezeDate } from '../helpers/clock'
import { resetDb } from '../helpers/db'
import { buttonByLabel } from '../helpers/ionic'
import { aMeetup } from '../helpers/meetups'
import { toasts } from '../helpers/overlays'

const NEVER_LABEL = 'עדיין לא נעשה גיבוי'

const SIBLING_LAST_BACKUP_KEY = 'last-backup-at'

const logged = [aMeetup({ date: '2026-10-28' }), aMeetup({ date: '2026-11-03' })]

const overlaysSettled = () => new Promise((resolve) => setTimeout(resolve, 50))

beforeEach(resetDb)
freezeDate(new Date(2026, 10, 5, 10).getTime())

describe('the backup reminder', () => {
  it('says when there has never been a backup', async () => {
    await store({ meetups: logged })
    await openCalendar()

    expect(await screen.findByText(NEVER_LABEL)).toBeVisible()
  })

  it('ignores a backup a sibling app recorded on the same origin', async () => {
    localStorage.setItem(SIBLING_LAST_BACKUP_KEY, String(new Date(2026, 10, 4, 10).getTime()))
    await store({ meetups: logged })
    await openCalendar()

    expect(await screen.findByText(NEVER_LABEL)).toBeVisible()
  })

  it('sits above the calendar', async () => {
    await store({ meetups: logged })
    await openCalendar()

    const row = await screen.findByText(NEVER_LABEL)

    expect(row.compareDocumentPosition(await dayButton('יום ראשון 4.10'))).toBe(Node.DOCUMENT_POSITION_FOLLOWING)
  })

  it('says how long ago the last backup was', async () => {
    await store({ meetups: logged })
    saveLastBackup(new Date(2026, 9, 28, 9).getTime())
    await openCalendar()

    expect(await screen.findByText('הגיבוי האחרון לפני 8 ימים')).toBeVisible()
  })

  it('stays away after a recent backup', async () => {
    await store({ meetups: logged })
    saveLastBackup(new Date(2026, 10, 1, 9).getTime())
    await openCalendar()

    expect(screen.queryByText(/גיבוי/)).not.toBeInTheDocument()
  })

  it('waits a week after the first meetup', async () => {
    await store({ meetups: [aMeetup({ date: '2026-10-30' })] })
    await openCalendar()

    expect(screen.queryByText(NEVER_LABEL)).not.toBeInTheDocument()
  })

  it('stays away on an empty app', async () => {
    await openCalendar()

    expect(screen.queryByText(NEVER_LABEL)).not.toBeInTheDocument()
  })

  it('shares the backup when tapped, then goes away', async () => {
    await store({ meetups: logged })

    const share = stubShare(() => Promise.resolve())

    await openCalendar()
    fireEvent.click(await screen.findByText(NEVER_LABEL))

    await waitFor(() => expect(share).toHaveBeenCalledOnce())
    expect(share.mock.calls[0][0].files).toHaveLength(1)
    await waitFor(() => expect(screen.queryByText(NEVER_LABEL)).not.toBeInTheDocument())
  })

  it('stays, with no message, when the share is cancelled', async () => {
    await store({ meetups: logged })

    const share = stubShare(() => Promise.reject(new DOMException('cancelled', 'AbortError')))

    await openCalendar()
    fireEvent.click(await screen.findByText(NEVER_LABEL))
    await waitFor(() => expect(share).toHaveBeenCalledOnce())
    await overlaysSettled()

    expect(screen.getByText(NEVER_LABEL)).toBeInTheDocument()
    expect(toasts()).toEqual([])
  })

  it('stays and says so in Hebrew when the share fails', async () => {
    await store({ meetups: logged })
    stubShare(() => Promise.reject(new Error('The request is not allowed')))

    await openCalendar()
    fireEvent.click(await screen.findByText(NEVER_LABEL))

    await waitFor(() => expect(toasts()).toEqual(['הפעולה נכשלה']))
    expect(screen.getByText(NEVER_LABEL)).toBeInTheDocument()
  })

  it('opens one share sheet when tapped twice', async () => {
    await store({ meetups: logged })

    const share = stubShare(() => Promise.resolve())

    await openCalendar()

    const row = await screen.findByText(NEVER_LABEL)

    fireEvent.click(row)
    fireEvent.click(row)
    await waitFor(() => expect(screen.queryByText(NEVER_LABEL)).not.toBeInTheDocument())

    expect(share).toHaveBeenCalledOnce()
  })

  it('goes away when the backup is exported from הגדרות', async () => {
    await store({ meetups: logged })
    stubShare(() => Promise.resolve())

    await openCalendar()
    await screen.findByText(NEVER_LABEL)
    fireEvent.click(await buttonByLabel('הגדרות'))

    const exportRow = await screen.findByText('ייצוא גיבוי')

    expect(screen.getAllByText(NEVER_LABEL, { selector: 'ion-label' })).toHaveLength(1)

    fireEvent.click(exportRow)

    await waitFor(() => expect(screen.queryAllByText(NEVER_LABEL, { selector: 'ion-label' })).toEqual([]))
  })
})
