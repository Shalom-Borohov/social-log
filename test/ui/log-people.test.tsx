import { screen, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'
import { db } from '../../src/data/db'
import { freezeDate } from '../helpers/clock'
import { resetDb } from '../helpers/db'
import { findButton, pressed, slot, tap, typeInto } from '../helpers/log'
import { aGroup, aMeetup, aPerson } from '../helpers/meetups'
import { alertShown, clickAlertButton, clickToastButton, toasts, typeInAlert } from '../helpers/overlays'
import { renderAt } from '../helpers/renderAt'

const tamar = aPerson({ id: 'tamar', name: 'תמר' })

const maya = aPerson({ id: 'maya', name: 'מאיה' })

const noam = aPerson({ id: 'noam', name: 'נועם' })

const army = aGroup({ id: 'army', name: 'החבר׳ה מהצבא', memberIds: ['tamar', 'maya', 'noam'] })

describe('מי', () => {
  beforeEach(async () => {
    await resetDb()
    await db.people.bulkPut([tamar, maya, noam])
  })
  freezeDate(new Date(2026, 10, 8, 10).getTime())

  it('fills a group’s members and words the sentence with its name', async () => {
    await db.groups.put(army)
    renderAt('/log')

    await tap('החבר׳ה מהצבא')

    expect(await pressed('תמר')).toBe('true')
    expect(await pressed('מאיה')).toBe('true')
    expect(await pressed('נועם')).toBe('true')
    expect(await slot('מי')).toHaveAccessibleName('מי: החבר׳ה מהצבא')
  })

  it('names who came when someone from the group was missing', async () => {
    await db.groups.put(army)
    renderAt('/log')

    await tap('החבר׳ה מהצבא')
    await tap('נועם')

    expect(await pressed('החבר׳ה מהצבא')).toBe('false')
    expect(await slot('מי')).toHaveAccessibleName('מי: תמר ומאיה')
  })

  it('clears the group and its people when the picked group is tapped again', async () => {
    await db.groups.put(army)
    renderAt('/log')

    await tap('החבר׳ה מהצבא')
    await tap('החבר׳ה מהצבא')

    expect(await pressed('החבר׳ה מהצבא')).toBe('false')
    expect(await pressed('תמר')).toBe('false')
    expect(await pressed('מאיה')).toBe('false')
    expect(await pressed('נועם')).toBe('false')
    expect(await findButton('המשך')).toBeDisabled()
  })

  it('picks the whole group again when tapped after someone from it was dropped', async () => {
    await db.groups.put(army)
    renderAt('/log')

    await tap('החבר׳ה מהצבא')
    await tap('נועם')
    await tap('החבר׳ה מהצבא')

    expect(await pressed('נועם')).toBe('true')
    expect(await pressed('החבר׳ה מהצבא')).toBe('true')
    expect(await slot('מי')).toHaveAccessibleName('מי: החבר׳ה מהצבא')
  })

  it('shows favourites first in the names', async () => {
    await db.people.update('noam', { favourite: true })
    renderAt('/log')

    await findButton('נועם')

    const names = screen
      .getAllByRole('button')
      .map((button) => button.textContent)
      .filter((name) => name === 'תמר' || name === 'מאיה' || name === 'נועם')

    expect(names).toEqual(['נועם', 'מאיה', 'תמר'])
  })

  it('toggles people on and off', async () => {
    renderAt('/log')

    await tap('נועם')
    await tap('תמר')
    await tap('נועם')

    expect(await pressed('נועם')).toBe('false')
    expect(await slot('מי')).toHaveAccessibleName('מי: תמר')
  })

  it('adds a new person by name and picks them', async () => {
    renderAt('/log')

    expect(await findButton('הוספה')).toBeDisabled()

    await typeInto('שם חדש', ' איתי ')
    await tap('הוספה')

    expect(await pressed('איתי')).toBe('true')
    expect(await screen.findByLabelText('שם חדש')).toHaveValue('')
    expect((await db.people.toArray()).map((person) => person.name)).toContain('איתי')
  })

  it('forgets a new name when the sentence is closed without saving', async () => {
    renderAt('/log')

    await typeInto('שם חדש', 'איתי')
    await tap('הוספה')
    await pressed('איתי')
    await tap('סגירה')

    await waitFor(async () => expect((await db.people.toArray()).map((person) => person.name)).not.toContain('איתי'))
    expect(await db.people.count()).toBe(3)
  })

  it('keeps a new name that was saved as part of a group', async () => {
    renderAt('/log')

    await tap('תמר')
    await typeInto('שם חדש', 'איתי')
    await tap('הוספה')
    await pressed('איתי')

    const shown = alertShown()

    await tap('שמירה כקבוצה')
    await shown
    typeInAlert('חדשים')
    clickAlertButton('שמירה')
    await waitFor(async () => expect(await db.groups.count()).toBe(1))
    await tap('סגירה')

    await waitFor(() => expect(screen.queryByLabelText('שם חדש')).not.toBeInTheDocument())
    expect((await db.people.toArray()).map((person) => person.name)).toContain('איתי')
  })

  it('picks the existing person when a known name is typed again', async () => {
    renderAt('/log')

    await typeInto('שם חדש', 'תמר')
    await tap('הוספה')

    await waitFor(async () => expect(await pressed('תמר')).toBe('true'))
    expect(await db.people.count()).toBe(3)
  })

  it('offers people hidden from Orbit only once they are picked', async () => {
    await db.people.put(aPerson({ id: 'dana', name: 'דנה', hidden: true }))
    renderAt('/log')
    await findButton('תמר')

    expect(screen.queryByRole('button', { name: 'דנה' })).not.toBeInTheDocument()

    await typeInto('שם חדש', 'דנה')
    await tap('הוספה')

    expect(await pressed('דנה')).toBe('true')
  })

  it('hides an unpicked person from the chips in עריכה, and ביטול brings them back', async () => {
    await db.meetups.put(aMeetup({ personIds: ['noam'] }))
    renderAt('/log')
    await tap('תמר')

    await tap('עריכה')

    expect(await findButton('סיום')).not.toHaveAttribute('aria-pressed')
    expect(await pressed('תמר')).toBe('true')
    expect(await findButton('תמר')).toBeDisabled()
    expect(screen.queryByRole('button', { name: 'הסתרה: תמר' })).not.toBeInTheDocument()

    await tap('הסתרה: נועם')

    await waitFor(() => expect(screen.queryByRole('button', { name: 'הסתרה: נועם' })).not.toBeInTheDocument())
    expect((await db.people.get('noam'))?.hidden).toBe(true)
    await waitFor(() => expect(toasts()).toContain('הסתרת את נועם מהרשימה ומהמסלול'))

    clickToastButton('ביטול')

    expect(await findButton('הסתרה: נועם')).toBeInTheDocument()
    expect((await db.people.get('noam'))?.hidden).toBe(false)
  })

  it('hides someone in a group rather than deleting them', async () => {
    await db.groups.put(army)
    renderAt('/log')
    await tap('עריכה')

    await tap('הסתרה: נועם')

    await waitFor(async () => expect((await db.people.get('noam'))?.hidden).toBe(true))
  })

  it('deletes someone in no meetup and no group in עריכה, and ביטול brings them back with their circles', async () => {
    const favouriteNoam = { ...noam, favourite: true }

    await db.people.put(favouriteNoam)
    await db.circles.put({ id: 'work', name: 'עבודה', memberIds: ['tamar', 'noam'] })
    renderAt('/log')
    await tap('עריכה')

    expect(screen.queryByRole('button', { name: 'הסתרה: נועם' })).not.toBeInTheDocument()

    await tap('מחיקה: נועם')

    await waitFor(() => expect(screen.queryByRole('button', { name: 'מחיקה: נועם' })).not.toBeInTheDocument())
    expect(await db.people.get('noam')).toBeUndefined()
    expect((await db.circles.get('work'))?.memberIds).toEqual(['tamar'])
    await waitFor(() => expect(toasts()).toContain('מחקת את נועם'))

    clickToastButton('ביטול')

    expect(await findButton('מחיקה: נועם')).toBeInTheDocument()
    expect(await db.people.get('noam')).toEqual(favouriteNoam)
    expect((await db.circles.get('work'))?.memberIds).toEqual(['tamar', 'noam'])
  })

  it('offers עריכה only while someone is left unpicked', async () => {
    renderAt('/log')
    await tap('תמר')
    await tap('מאיה')

    expect(await findButton('עריכה')).not.toHaveAttribute('aria-pressed')

    await tap('נועם')

    expect(screen.queryByRole('button', { name: 'עריכה' })).not.toBeInTheDocument()
  })

  it('keeps סיום after the last unpicked person is hidden, and unlocks the picked chips with it', async () => {
    await db.meetups.put(aMeetup({ personIds: ['noam'] }))
    renderAt('/log')
    await tap('תמר')
    await tap('מאיה')
    await tap('עריכה')

    await tap('הסתרה: נועם')
    await waitFor(() => expect(screen.queryByRole('button', { name: 'הסתרה: נועם' })).not.toBeInTheDocument())

    expect(await findButton('תמר')).toBeDisabled()

    await tap('סיום')

    expect(await findButton('תמר')).toBeEnabled()
  })

  it('locks the group chips while עריכה is on', async () => {
    await db.groups.put(army)
    renderAt('/log')
    await tap('תמר')

    await tap('עריכה')

    expect(await findButton('החבר׳ה מהצבא')).toBeDisabled()
  })

  it('offers no עריכה before anyone was added', async () => {
    await resetDb()
    renderAt('/log')

    expect(await screen.findByLabelText('שם חדש')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'עריכה' })).not.toBeInTheDocument()
  })

  it('offers שמירה כקבוצה from two people and saves the group with its name', async () => {
    renderAt('/log')

    await tap('תמר')

    expect(screen.queryByRole('button', { name: 'שמירה כקבוצה' })).not.toBeInTheDocument()

    await tap('מאיה')
    const shown = alertShown()

    await tap('שמירה כקבוצה')
    await shown
    typeInAlert('האחיות')
    clickAlertButton('שמירה')

    await waitFor(async () =>
      expect(await db.groups.toArray()).toEqual([expect.objectContaining({ name: 'האחיות', memberIds: ['tamar', 'maya'] })]),
    )
    expect(await pressed('האחיות')).toBe('true')
    expect(await slot('מי')).toHaveAccessibleName('מי: האחיות')
  })

  it('saves no group when the name is left empty', async () => {
    renderAt('/log')

    await tap('תמר')
    await tap('מאיה')
    const shown = alertShown()

    await tap('שמירה כקבוצה')
    await shown
    clickAlertButton('שמירה')

    expect(await db.groups.count()).toBe(0)
  })
})
