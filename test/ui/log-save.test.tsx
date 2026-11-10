import { fireEvent, screen, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'
import { expectTitle, store } from '../helpers/calendar'
import { freezeDate } from '../helpers/clock'
import { resetDb } from '../helpers/db'
import { ionElement } from '../helpers/ionic'
import { fillRequiredSlots, tap, typeInto } from '../helpers/log'
import { aPerson } from '../helpers/meetups'
import { currentPath, renderAt } from '../helpers/renderAt'

const CALENDAR = '/tabs/calendar'

const CALENDAR_TITLE = '5 השבועות האחרונים'

async function openFilledSentenceFromCalendar() {
  renderAt(CALENDAR)
  fireEvent.click(await ionElement('.new-meetup-button'))
  await waitFor(() => expect(currentPath()).toBe('/log'))
  await fillRequiredSlots({ people: ['תמר'], place: 'בטיילת', duration: 'שעה', rating: 'טוב' })
}

async function saveAndReturn() {
  await tap('שמירה')
  await waitFor(() => expect(currentPath()).toBe(CALENDAR))
}

describe('saving a meetup', () => {
  beforeEach(async () => {
    await resetDb()
    await store({ people: [aPerson({ id: 'tamar', name: 'תמר' })] })
  })
  freezeDate(new Date(2026, 10, 8, 10).getTime())

  it('closes the keyboard before going back to the calendar', async () => {
    await openFilledSentenceFromCalendar()
    const activityField = await screen.findByLabelText('פעילות אחרת')

    activityField.focus()
    await typeInto('פעילות אחרת', 'שש-בש')
    await tap('הוספה')
    await saveAndReturn()

    await expectTitle(CALENDAR_TITLE)
    expect(document.activeElement).not.toBe(activityField)
  })

  it('keeps שמירה disabled once the meetup is saved, so a second tap logs nothing', async () => {
    await openFilledSentenceFromCalendar()
    await saveAndReturn()

    const [closedSaveButton] = screen.getAllByRole('button', { name: 'שמירה', hidden: true })

    expect(closedSaveButton).toBeDisabled()
  })
})
