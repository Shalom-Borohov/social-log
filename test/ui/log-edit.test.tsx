import { fireEvent, screen, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'
import { db } from '../../src/data/db'
import { dayButton, openCalendar } from '../helpers/calendar'
import { freezeDate } from '../helpers/clock'
import { resetDb } from '../helpers/db'
import { ionElement } from '../helpers/ionic'
import { findButton, slot, tap, tapSlot } from '../helpers/log'
import { aMeetup, aPerson } from '../helpers/meetups'
import { alertDismissed, alertHeader, alertShown, clickAlertButton } from '../helpers/overlays'
import { currentPath, renderAt } from '../helpers/renderAt'

const walk = aMeetup({
  id: 'walk',
  date: '2026-11-05',
  personIds: ['tamar', 'maya'],
  place: 'בטיילת',
  minutes: 90,
  rating: 3,
  activities: ['הליכה'],
  initiator: 'them',
  note: 'היה קר',
  createdAt: 1000,
})

async function askToDelete() {
  const shown = alertShown()

  await tap('מחיקה')
  await shown
}

describe('editing a meetup', () => {
  beforeEach(async () => {
    await resetDb()
    await db.people.bulkPut([aPerson({ id: 'tamar', name: 'תמר' }), aPerson({ id: 'maya', name: 'מאיה' })])
    await db.meetups.put(walk)
  })
  freezeDate(new Date(2026, 10, 8, 10).getTime())

  it('opens with every slot filled and the extras showing', async () => {
    renderAt('/log/walk')

    expect(await slot('מתי')).toHaveAccessibleName('מתי: ביום חמישי 5.11')
    expect(await slot('מי')).toHaveAccessibleName('מי: תמר ומאיה')
    expect(await slot('איפה')).toHaveAccessibleName('איפה: בטיילת')
    expect(await slot('כמה זמן')).toHaveAccessibleName('כמה זמן: שעה וחצי')
    expect(await slot('איך')).toHaveAccessibleName('איך: טוב')
    expect(await findButton('הליכה')).toHaveAttribute('aria-pressed', 'true')
    expect(await findButton('הם')).toHaveAttribute('aria-pressed', 'true')
    expect(await screen.findByLabelText('הערה')).toHaveValue('היה קר')
  })

  it('saves the change over the same meetup', async () => {
    renderAt('/log/walk')

    await tapSlot('איך')
    await tap('מעולה')
    await tap('שמירה')

    await waitFor(() => expect(currentPath()).toBe('/tabs/calendar'))
    expect(await db.meetups.toArray()).toEqual([{ ...walk, rating: 4 }])
  })

  it('deletes the meetup after confirming', async () => {
    renderAt('/log/walk')

    await askToDelete()

    expect(alertHeader()).toBe('למחוק את המפגש?')

    clickAlertButton('מחיקה')

    await waitFor(() => expect(currentPath()).toBe('/tabs/calendar'))
    expect(await db.meetups.count()).toBe(0)
    expect(screen.queryByText('המפגש לא נמצא')).not.toBeInTheDocument()
  })

  it('never says the meetup is missing while leaving after a delete from the calendar', async () => {
    let notFoundShown = false

    const watcher = new MutationObserver(() => {
      notFoundShown ||= document.body.textContent?.includes('המפגש לא נמצא') ?? false
    })

    watcher.observe(document.body, { subtree: true, childList: true, characterData: true })
    await openCalendar()
    fireEvent.click(await dayButton('יום חמישי 5.11'))
    fireEvent.click(await ionElement('.calendar-meetups ion-item'))
    await waitFor(() => expect(currentPath()).toBe('/log/walk'))
    await askToDelete()
    clickAlertButton('מחיקה')
    await waitFor(() => expect(currentPath()).toBe('/tabs/calendar'))
    await waitFor(() => expect(document.querySelector('.log-screen')).toBeNull())
    watcher.disconnect()

    expect(notFoundShown).toBe(false)
  })

  it('keeps the meetup when the delete is cancelled', async () => {
    renderAt('/log/walk')

    await askToDelete()
    const dismissed = alertDismissed()

    clickAlertButton('ביטול')
    await dismissed

    expect(currentPath()).toBe('/log/walk')
    expect(await db.meetups.count()).toBe(1)
  })

  it('offers no מחיקה for a new meetup', async () => {
    renderAt('/log')
    await tap('תמר')

    expect(screen.queryByRole('button', { name: 'מחיקה' })).not.toBeInTheDocument()
  })

  it('says quietly when the meetup is not there', async () => {
    renderAt('/log/gone')

    expect(await screen.findByText('המפגש לא נמצא')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /^מי:/ })).not.toBeInTheDocument()

    await tap('סגירה')

    await waitFor(() => expect(currentPath()).toBe('/tabs/calendar'))
  })
})
