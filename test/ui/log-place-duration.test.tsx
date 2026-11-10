import { screen, waitFor, within } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'
import { db } from '../../src/data/db'
import { saveChoices } from '../../src/data/savedChoices'
import { freezeDate } from '../helpers/clock'
import { resetDb } from '../helpers/db'
import { findButton, slot, tap, tapSlot } from '../helpers/log'
import { aMeetup, aPerson } from '../helpers/meetups'
import { clickToastButton, toasts } from '../helpers/overlays'
import { renderAt } from '../helpers/renderAt'

const tamar = aPerson({ id: 'tamar', name: 'תמר' })

async function openPlace() {
  renderAt('/log')
  await tap('תמר')
  await tap('המשך')
}

async function openDuration() {
  await openPlace()
  await tap('בטיילת')
}

const savedPlaces = async () =>
  within(await screen.findByRole('group', { name: 'מקומות שמורים' }))
    .getAllByRole('button')
    .map((button) => button.textContent)

describe('איפה', () => {
  beforeEach(async () => {
    await resetDb()
    await db.people.put(tamar)
  })
  freezeDate(new Date(2026, 10, 8, 10).getTime())

  it('offers every saved place, the last used first, then the newest saved', async () => {
    await saveChoices('place', ['א', 'ב', 'ג', 'ד', 'ה', 'ו', 'ז'].map((letter) => `מקום ${letter}`))
    await db.meetups.bulkPut([
      aMeetup({ date: '2026-10-01', place: 'מקום ד', personIds: ['tamar'] }),
      aMeetup({ date: '2026-11-01', place: 'מקום ב', personIds: ['tamar'] }),
      aMeetup({ date: '2026-11-05', place: 'אצל סבתא', personIds: ['tamar'] }),
    ])

    await openPlace()

    expect(await savedPlaces()).toEqual(['מקום ב', 'מקום ד', 'מקום ז', 'מקום ו', 'מקום ה', 'מקום ג', 'מקום א'])
  })

  it('removes a saved place in עריכה, and ביטול brings it back in its place', async () => {
    await saveChoices('place', ['מקום א', 'מקום ב'])
    await openPlace()

    await tap('עריכה')
    await tap('הסרה: מקום א')
    await waitFor(() => expect(toasts()).toContain('המקום „מקום א” הוסר מהמקומות השמורים'))
    await tap('סיום')

    expect(await savedPlaces()).toEqual(['מקום ב'])

    clickToastButton('ביטול')

    await waitFor(async () => expect(await savedPlaces()).toEqual(['מקום ב', 'מקום א']))
  })

  it('fills the place from a saved one and moves on', async () => {
    await saveChoices('place', ['בטיילת'])

    await openPlace()
    await tap('בטיילת')

    expect(await slot('איפה')).toHaveAccessibleName('איפה: בטיילת')
    expect(await slot('כמה זמן')).toHaveAttribute('aria-current', 'step')
  })

  it('offers no saved places before one is saved, even after a meetup', async () => {
    await db.meetups.put(aMeetup({ place: 'בטיילת', personIds: ['tamar'] }))

    await openPlace()

    expect(await screen.findByLabelText('מקום')).toBeInTheDocument()
    expect(screen.queryByRole('group', { name: 'מקומות שמורים' })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'עריכה' })).not.toBeInTheDocument()
  })
})

describe('כמה זמן', () => {
  beforeEach(async () => {
    await resetDb()
    await db.people.put(tamar)
    await saveChoices('place', ['בטיילת'])
  })
  freezeDate(new Date(2026, 10, 8, 10).getTime())

  it('offers the six length chips and אחר', async () => {
    await openDuration()

    const chips = within(await screen.findByRole('group', { name: 'כמה זמן הייתם יחד?' }))
      .getAllByRole('button')
      .map((button) => button.textContent)

    expect(chips).toEqual(['חצי שעה', 'שעה', 'שעה וחצי', 'שעתיים', '3 שעות', '4 שעות', 'אחר'])
  })

  it('takes hours and quarter hours from אחר', async () => {
    await openDuration()
    await tap('אחר')

    expect(await findButton('אישור')).toBeDisabled()

    for (let hour = 0; hour < 5; hour++) {
      await tap('עוד שעה')
    }

    await tap('עוד רבע שעה')
    await tap('עוד רבע שעה')
    await tap('עוד רבע שעה')
    await tap('פחות רבע שעה')

    expect(screen.getByRole('status', { name: 'שעות' })).toHaveTextContent('5')
    expect(screen.getByRole('status', { name: 'דקות' })).toHaveTextContent('30')

    await tap('אישור')

    expect(await slot('כמה זמן')).toHaveAccessibleName('כמה זמן: 5 שעות וחצי')
    expect(await slot('איך')).toHaveAttribute('aria-current', 'step')
  })

  it('stops the minutes at 45', async () => {
    await openDuration()
    await tap('אחר')

    await tap('עוד רבע שעה')
    await tap('עוד רבע שעה')
    await tap('עוד רבע שעה')

    expect(await findButton('עוד רבע שעה')).toBeDisabled()
    expect(await findButton('פחות שעה')).toBeDisabled()

    await tap('אישור')

    expect(await slot('כמה זמן')).toHaveAccessibleName('כמה זמן: 45 דקות')
  })

  it('never takes the minutes below zero for a stored length off the quarter hours', async () => {
    await db.meetups.put(aMeetup({ id: 'odd', minutes: 50, personIds: ['tamar'] }))
    renderAt('/log/odd')
    await tapSlot('כמה זמן')

    await tap('פחות רבע שעה')
    await tap('פחות רבע שעה')
    await tap('פחות רבע שעה')

    expect(screen.getByRole('status', { name: 'דקות' })).toHaveTextContent('5')
    expect(await findButton('פחות רבע שעה')).toBeDisabled()
  })

  it('reopens a custom length on אחר with its hours and minutes', async () => {
    await openDuration()
    await tap('אחר')
    await tap('עוד שעה')
    await tap('עוד רבע שעה')
    await tap('אישור')
    await tapSlot('כמה זמן')

    expect(await findButton('אחר')).toHaveAttribute('aria-pressed', 'true')
    expect(screen.getByRole('status', { name: 'שעות' })).toHaveTextContent('1')
    expect(screen.getByRole('status', { name: 'דקות' })).toHaveTextContent('15')
  })
})
