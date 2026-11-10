import { fireEvent, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'
import { db } from '../../src/data/db'
import { dayButton, expectTitle, openCalendar, selectedDays, store } from '../helpers/calendar'
import { freezeDate } from '../helpers/clock'
import { resetDb } from '../helpers/db'
import { buttonByLabel, ionElement, visibleAll } from '../helpers/ionic'
import { fillRequiredSlots, pressed, slot, tap, typeInto } from '../helpers/log'
import { aMeetup, aPerson } from '../helpers/meetups'
import { currentPath, renderAt } from '../helpers/renderAt'
import { leaveAndComeBackAt } from '../helpers/visibility'

const tamar = aPerson({ id: 'tamar', name: 'תמר' })

const CALENDAR = '/tabs/calendar'

const THIS_PAGE_TITLE = '5 השבועות האחרונים'

async function pressNewMeetup() {
  fireEvent.click(await ionElement('.new-meetup-button'))
  await waitFor(() => expect(currentPath()).toBe('/log'))
}

async function expectEmptyFormOnToday() {
  expect(await slot('מתי')).toHaveAccessibleName('מתי: היום')
  expect(await slot('מי')).toHaveAttribute('aria-current', 'step')
  expect(await slot('מי')).toHaveTextContent('מי?')
  expect(await slot('איפה')).toHaveTextContent('איפה?')
}

describe('opening a new meetup again', () => {
  beforeEach(async () => {
    await resetDb()
    await store({ people: [tamar] })
  })
  freezeDate(new Date(2026, 10, 8, 10).getTime())

  it('starts empty on today after a meetup was saved', async () => {
    renderAt(CALENDAR)

    await pressNewMeetup()
    await fillRequiredSlots({ people: ['תמר'], place: 'בטיילת', duration: 'שעה וחצי', rating: 'מעולה' })
    await tap('שמירה')
    await waitFor(() => expect(currentPath()).toBe(CALENDAR))
    await pressNewMeetup()

    await expectEmptyFormOnToday()
  })

  it('starts empty after a half-filled sentence was closed', async () => {
    renderAt(CALENDAR)

    await pressNewMeetup()
    await tap('תמר')
    await tap('המשך')
    await tap('סגירה')
    await waitFor(() => expect(currentPath()).toBe(CALENDAR))
    await pressNewMeetup()

    await expectEmptyFormOnToday()
    expect(await pressed('תמר')).toBe('false')
  })

  it('keeps nothing of a new name that was added and abandoned', async () => {
    renderAt(CALENDAR)

    await pressNewMeetup()
    await typeInto('שם חדש', 'איתי')
    await tap('הוספה')
    await pressed('איתי')
    await tap('סגירה')
    await waitFor(() => expect(currentPath()).toBe(CALENDAR))
    await pressNewMeetup()
    await typeInto('שם חדש', 'דנה')
    await tap('הוספה')
    await waitFor(async () => expect(await pressed('דנה')).toBe('true'))
    await tap('המשך')

    expect(await slot('מי')).toHaveAccessibleName('מי: דנה')
    expect((await db.people.toArray()).map((person) => person.name)).not.toContain('איתי')
  })
})

describe('a new meetup from the calendar', () => {
  beforeEach(resetDb)
  freezeDate(new Date(2026, 10, 8, 10).getTime())

  it('starts on the day that was tapped', async () => {
    await openCalendar()

    fireEvent.click(await dayButton('יום חמישי 5.11'))
    await pressNewMeetup()

    expect(await slot('מתי')).toHaveAccessibleName('מתי: ביום חמישי 5.11')
  })

  it('keeps the tapped day for the next meetup after saving', async () => {
    await store({ people: [tamar] })
    await openCalendar()

    fireEvent.click(await dayButton('יום חמישי 5.11'))
    await pressNewMeetup()
    await fillRequiredSlots({ people: ['תמר'], place: 'בטיילת', duration: 'שעה וחצי', rating: 'מעולה' })
    await tap('שמירה')
    await waitFor(() => expect(currentPath()).toBe(CALENDAR))

    expect(await dayButton('יום חמישי 5.11')).toHaveAttribute('aria-pressed', 'true')

    await pressNewMeetup()

    expect(await slot('מתי')).toHaveAccessibleName('מתי: ביום חמישי 5.11')
    expect(await slot('מי')).toHaveTextContent('מי?')
  })

  it('starts on today when no day was tapped, even with an older day selected', async () => {
    await store({ people: [tamar], meetups: [aMeetup({ date: '2026-11-05', personIds: ['tamar'] })] })
    await openCalendar()

    expect(await dayButton('יום חמישי 5.11')).toHaveAttribute('aria-pressed', 'true')

    await pressNewMeetup()

    expect(await slot('מתי')).toHaveAccessibleName('מתי: היום')
  })

  it('starts on today when opened from another tab', async () => {
    await openCalendar()

    fireEvent.click(await dayButton('יום חמישי 5.11'))
    fireEvent.click(await ionElement('ion-tab-button[tab="friends"]'))
    await waitFor(() => expect(currentPath()).toBe('/tabs/friends'))
    await pressNewMeetup()

    expect(await slot('מתי')).toHaveAccessibleName('מתי: היום')
  })

  it('forgets the tapped day once the calendar pages away and back', async () => {
    await openCalendar()

    fireEvent.click(await dayButton('יום חמישי 5.11'))
    fireEvent.click(await buttonByLabel('5 השבועות הקודמים'))
    await waitFor(() => expect(visibleAll('ion-title')[0]).not.toHaveTextContent(THIS_PAGE_TITLE))
    fireEvent.click(await buttonByLabel('5 השבועות הבאים'))
    await expectTitle(THIS_PAGE_TITLE)

    expect(selectedDays()).toHaveLength(0)

    await pressNewMeetup()

    expect(await slot('מתי')).toHaveAccessibleName('מתי: היום')
  })

  it('forgets the tapped day when the day rolls over at 03:00', async () => {
    await store({ people: [tamar], meetups: [aMeetup({ date: '2026-11-03', personIds: ['tamar'] })] })
    await openCalendar()

    fireEvent.click(await dayButton('יום חמישי 5.11'))
    await leaveAndComeBackAt(new Date(2026, 10, 9, 3, 30).getTime())

    expect(await dayButton('יום שלישי 3.11')).toHaveAttribute('aria-pressed', 'true')

    await pressNewMeetup()

    expect(await slot('מתי')).toHaveAccessibleName('מתי: היום')
  })
})
