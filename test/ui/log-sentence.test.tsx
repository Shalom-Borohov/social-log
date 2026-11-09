import { screen, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'
import { db } from '../../src/data/db'
import { freezeDate } from '../helpers/clock'
import { resetDb } from '../helpers/db'
import { fillRequiredSlots, findButton, slot, tap, tapSlot, typeInto } from '../helpers/log'
import { aPerson } from '../helpers/meetups'
import { currentPath, renderAt } from '../helpers/renderAt'

const tamar = aPerson({ id: 'tamar', name: 'תמר' })

const maya = aPerson({ id: 'maya', name: 'מאיה' })

describe('logging a new meetup', () => {
  beforeEach(async () => {
    await resetDb()
    await db.people.bulkPut([tamar, maya])
  })
  freezeDate(new Date(2026, 10, 8, 10).getTime())

  it('starts on today with מי waiting', async () => {
    renderAt('/log')

    expect(await slot('מתי')).toHaveAccessibleName('מתי: היום')
    expect(await slot('מי')).toHaveAttribute('aria-current', 'step')
    expect(await slot('איפה')).toHaveTextContent('איפה?')
    expect(screen.queryByRole('button', { name: 'שמירה' })).not.toBeInTheDocument()
  })

  it('fills the sentence one slot at a time and saves the meetup', async () => {
    renderAt('/log')

    await tap('תמר')
    await tap('מאיה')
    await tap('המשך')

    expect(await slot('מי')).toHaveAccessibleName('מי: תמר ומאיה')
    expect(await slot('איפה')).toHaveAttribute('aria-current', 'step')

    await typeInto('מקום', 'בטיילת')
    await tap('המשך')

    expect(await slot('כמה זמן')).toHaveAttribute('aria-current', 'step')

    await tap('שעה וחצי')

    expect(await slot('איך')).toHaveAttribute('aria-current', 'step')

    await tap('מעולה')

    expect(await slot('איך')).toHaveAccessibleName('איך: מעולה')

    await tap('שמירה')

    await waitFor(() => expect(currentPath()).toBe('/tabs/calendar'))
    expect(await db.meetups.toArray()).toEqual([
      expect.objectContaining({
        date: '2026-11-08',
        personIds: ['tamar', 'maya'],
        place: 'בטיילת',
        minutes: 90,
        rating: 4,
      }),
    ])
  })

  it('moves on only once someone is picked and a place is typed', async () => {
    renderAt('/log')

    expect(await findButton('המשך')).toBeDisabled()

    await tap('תמר')
    await tap('המשך')

    expect(await findButton('המשך')).toBeDisabled()

    await typeInto('מקום', '   ')

    expect(await findButton('המשך')).toBeDisabled()
  })

  it('reopens a filled slot and then returns to the next empty one', async () => {
    renderAt('/log')

    await tap('תמר')
    await tap('המשך')
    await tapSlot('מי')
    await tap('מאיה')
    await tap('המשך')

    expect(await slot('מי')).toHaveAccessibleName('מי: תמר ומאיה')
    expect(await slot('איפה')).toHaveAttribute('aria-current', 'step')
  })

  it('shows the extras and שמירה once every slot is filled', async () => {
    renderAt('/log')

    await fillRequiredSlots({ people: ['תמר'], place: 'אצל נועם', duration: 'שעתיים', rating: 'סביר' })

    expect(await findButton('שמירה')).toBeEnabled()
    expect(await screen.findByLabelText('הערה')).toBeInTheDocument()
    expect(await slot('כמה זמן')).toHaveAccessibleName('כמה זמן: שעתיים')
  })

  it('goes back to the calendar on X without saving', async () => {
    renderAt('/log')

    await tap('תמר')
    await tap('סגירה')

    await waitFor(() => expect(currentPath()).toBe('/tabs/calendar'))
    expect(await db.meetups.count()).toBe(0)
  })
})

describe('the date', () => {
  beforeEach(resetDb)
  freezeDate(new Date(2026, 10, 8, 10).getTime())

  it('offers היום, אתמול and שלשום, and a date field that stops at today', async () => {
    renderAt('/log')
    await tapSlot('מתי')

    await tap('אתמול')

    expect(await slot('מתי')).toHaveAccessibleName('מתי: אתמול')
    expect(await slot('מי')).toHaveAttribute('aria-current', 'step')

    await tapSlot('מתי')

    expect(await screen.findByLabelText('תאריך אחר')).toHaveAttribute('max', '2026-11-08')
  })

  it('takes an older date from the date field and ignores a future one', async () => {
    renderAt('/log')
    await tapSlot('מתי')

    await typeInto('תאריך אחר', '2026-11-05')

    expect(await slot('מתי')).toHaveAccessibleName('מתי: ביום חמישי 5.11')

    await typeInto('תאריך אחר', '2026-11-09')

    expect(await slot('מתי')).toHaveAccessibleName('מתי: ביום חמישי 5.11')
  })
})

describe('the day rollover', () => {
  beforeEach(resetDb)
  freezeDate(new Date(2026, 10, 8, 1).getTime())

  it('dates a meetup logged at 01:00 to the evening before', async () => {
    renderAt('/log')
    await tapSlot('מתי')

    expect(await screen.findByLabelText('תאריך אחר')).toHaveValue('2026-11-07')
    expect(await slot('מתי')).toHaveAccessibleName('מתי: היום')
  })
})
