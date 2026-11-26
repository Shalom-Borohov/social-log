import { fireEvent, screen, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'
import { db } from '../../src/data/db'
import { saveChoices } from '../../src/data/savedChoices'
import { freezeDate } from '../helpers/clock'
import { resetDb } from '../helpers/db'
import { findButton, pressed, slot, tap, tapSlot, typeInto } from '../helpers/log'
import { aMeetup, aPerson } from '../helpers/meetups'
import { alertHeader, alertMessage, alertShown, clickAlertButton } from '../helpers/overlays'
import { renderAt } from '../helpers/renderAt'

async function openPlace() {
  renderAt('/log')
  await tap('תמר')
  await tap('המשך')
}

async function pickThenComeBack(place: string) {
  await openPlace()
  await tap(place)
  await tapSlot('איפה')
}

async function submitPlace() {
  fireEvent.submit(await screen.findByLabelText('מקום'))
}

async function finishAndSave() {
  await tap('שעה')
  await tap('טוב')
  await tap('שמירה')
}

const storedMeetup = async () => (await db.meetups.toArray())[0]

describe('several places', () => {
  beforeEach(async () => {
    await resetDb()
    await db.people.put(aPerson({ id: 'tamar', name: 'תמר' }))
    await saveChoices('place', ['בטיילת', 'בים'])
  })
  freezeDate(new Date(2026, 10, 8, 10).getTime())

  it('adds a second saved place back on איפה and stays there until המשך', async () => {
    await pickThenComeBack('בטיילת')

    await tap('בים')

    expect(await slot('איפה')).toHaveAccessibleName('איפה: בטיילת ובים')
    expect(await slot('איפה')).toHaveAttribute('aria-current', 'step')
    expect(await pressed('בים')).toBe('true')

    await tap('המשך')

    expect(await slot('כמה זמן')).toHaveAttribute('aria-current', 'step')
  })

  it('saves the places in the order they were picked', async () => {
    await pickThenComeBack('בים')
    await tap('בטיילת')
    await tap('המשך')
    await finishAndSave()

    await waitFor(async () => expect(await storedMeetup()).toEqual(expect.objectContaining({ place: 'בים', laterPlaces: ['בטיילת'] })))
  })

  it('takes a place out when it is tapped again, and needs one to move on', async () => {
    await pickThenComeBack('בטיילת')

    await tap('בטיילת')

    expect(await slot('איפה')).toHaveAccessibleName('איפה: לא מולא')
    expect(await findButton('המשך')).toBeDisabled()
  })

  it('offers to split typed places on adding the first, then moves on', async () => {
    await openPlace()
    await typeInto('מקום', 'בפארק ובבית')
    const shown = alertShown()

    await submitPlace()
    await shown

    expect(alertHeader()).toBe('להוסיף בנפרד?')
    expect(alertMessage()).toBe('בפארק · בבית')

    clickAlertButton('פיצול ל־2')

    await waitFor(async () => expect(await slot('כמה זמן')).toHaveAttribute('aria-current', 'step'))
    expect(await slot('איפה')).toHaveAccessibleName('איפה: בפארק ובבית')

    await finishAndSave()

    await waitFor(async () => expect(await storedMeetup()).toEqual(expect.objectContaining({ place: 'בפארק', laterPlaces: ['בבית'] })))
  })

  it('keeps typed places as one on להשאיר כמו שכתוב', async () => {
    await openPlace()
    await typeInto('מקום', 'בפארק ובבית')
    const shown = alertShown()

    await submitPlace()
    await shown
    clickAlertButton('להשאיר כמו שכתוב')

    await waitFor(async () => expect(await slot('כמה זמן')).toHaveAttribute('aria-current', 'step'))
    await finishAndSave()

    await waitFor(async () => expect(await storedMeetup()).toEqual(expect.objectContaining({ place: 'בפארק ובבית' })))
    expect(await storedMeetup()).not.toHaveProperty('laterPlaces')
  })

  it('adds a typed place after a picked one and stays, offering to save it', async () => {
    await pickThenComeBack('בטיילת')

    await typeInto('מקום', 'בבית')
    await submitPlace()

    await waitFor(async () => expect(await slot('איפה')).toHaveAccessibleName('איפה: בטיילת ובבית'))
    expect(await slot('איפה')).toHaveAttribute('aria-current', 'step')
    expect(await pressed('בבית')).toBe('true')
    expect(await findButton('שמירת „בבית” לפעם הבאה')).toBeInTheDocument()
    expect(screen.getByLabelText('מקום')).toHaveValue('')
  })

  it('keeps a typed place when leaving איפה another way', async () => {
    await pickThenComeBack('בטיילת')

    await typeInto('מקום', 'בבית')
    await tapSlot('כמה זמן')
    await finishAndSave()

    await waitFor(async () => expect(await storedMeetup()).toEqual(expect.objectContaining({ place: 'בטיילת', laterPlaces: ['בבית'] })))
  })

  it('puts ✕ in עריכה only on saved places that are not picked', async () => {
    await pickThenComeBack('בטיילת')

    await tap('עריכה')

    expect(await findButton('הסרה: בים')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'הסרה: בטיילת' })).not.toBeInTheDocument()
    expect(await findButton('בטיילת')).toBeDisabled()
  })
})

describe('editing a meetup with several places', () => {
  beforeEach(async () => {
    await resetDb()
    await db.people.put(aPerson({ id: 'tamar', name: 'תמר' }))
    await db.meetups.put(aMeetup({ id: 'evening', personIds: ['tamar'], place: 'בטיילת', laterPlaces: ['בים'] }))
  })
  freezeDate(new Date(2026, 10, 8, 10).getTime())

  it('shows every place and saves one taken out', async () => {
    renderAt('/log/evening')

    expect(await slot('איפה')).toHaveAccessibleName('איפה: בטיילת ובים')

    await tapSlot('איפה')
    await tap('בים')
    await tap('המשך')
    await tap('שמירה')

    await waitFor(async () => expect(await storedMeetup()).not.toHaveProperty('laterPlaces'))
    expect(await storedMeetup()).toEqual(expect.objectContaining({ place: 'בטיילת' }))
  })
})
