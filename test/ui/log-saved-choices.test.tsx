import { fireEvent, screen, waitFor, within } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'
import { db } from '../../src/data/db'
import { saveChoices } from '../../src/data/savedChoices'
import { freezeDate } from '../helpers/clock'
import { resetDb } from '../helpers/db'
import { ionElement } from '../helpers/ionic'
import { fillRequiredSlots, findButton, pressed, tap, typeInto } from '../helpers/log'
import { ACTIVITY_PRESETS, aPerson } from '../helpers/meetups'
import { clickToastButton, toasts } from '../helpers/overlays'
import { currentPath, renderAt } from '../helpers/renderAt'

async function openPlace() {
  renderAt('/log')
  await tap('תמר')
  await tap('המשך')
}

async function openExtras() {
  renderAt('/log')
  await fillRequiredSlots({ people: ['תמר'], place: 'בטיילת', duration: 'שעה', rating: 'טוב' })
}

const chipsIn = async (group: string) =>
  within(await screen.findByRole('group', { name: group }))
    .getAllByRole('button')
    .map((button) => button.textContent)

const saveButton = (name: string) => screen.queryByRole('button', { name: `שמירת „${name}” לפעם הבאה` })

describe('saving a place for next time', () => {
  beforeEach(async () => {
    await resetDb()
    await db.people.put(aPerson({ id: 'tamar', name: 'תמר' }))
  })
  freezeDate(new Date(2026, 10, 8, 10).getTime())

  it('saves the typed place from its button, which then goes away', async () => {
    await saveChoices('place', ['בים'])
    await openPlace()

    expect(saveButton('בים')).not.toBeInTheDocument()

    await typeInto('מקום', ' בטיילת ')
    await tap('שמירת „בטיילת” לפעם הבאה')

    await waitFor(async () => expect(await chipsIn('מקומות שמורים')).toContain('בטיילת'))
    expect(saveButton('בטיילת')).not.toBeInTheDocument()
  })

  it('offers no save button for an empty place or a saved one', async () => {
    await saveChoices('place', ['בים'])
    await openPlace()

    await typeInto('מקום', '  ')

    expect(screen.queryByRole('button', { name: /לפעם הבאה/ })).not.toBeInTheDocument()

    await typeInto('מקום', 'בים')

    expect(saveButton('בים')).not.toBeInTheDocument()
  })

  it('keeps סיום after removing the last saved place, so a place saved next can be picked', async () => {
    await saveChoices('place', ['בים'])
    await openPlace()

    await tap('עריכה')
    await tap('הסרה: בים')
    await tap('סיום')
    await typeInto('מקום', 'בטיילת')
    await tap('שמירת „בטיילת” לפעם הבאה')

    expect(await findButton('בטיילת')).toBeInTheDocument()
  })
})

describe('saving a meetup', () => {
  beforeEach(async () => {
    await resetDb()
    await db.people.put(aPerson({ id: 'tamar', name: 'תמר' }))
  })
  freezeDate(new Date(2026, 10, 8, 10).getTime())

  it('adds no chip for its new place or activity the next time the sentence opens', async () => {
    await openExtras()
    await typeInto('פעילות אחרת', 'שש-בש')
    await tap('הוספה')
    await tap('שמירה')
    await waitFor(() => expect(currentPath()).toBe('/tabs/calendar'))

    fireEvent.click(await ionElement('.new-meetup-button'))
    await waitFor(() => expect(currentPath()).toBe('/log'))
    await tap('תמר')
    await tap('המשך')

    expect(await screen.findByLabelText('מקום')).toBeInTheDocument()
    expect(screen.queryByRole('group', { name: 'מקומות שמורים' })).not.toBeInTheDocument()

    await typeInto('מקום', 'בים')
    await tap('המשך')
    await tap('שעה')
    await tap('טוב')

    expect(await chipsIn('מה עשינו')).toEqual(ACTIVITY_PRESETS)
  })
})

describe('saved activities', () => {
  beforeEach(async () => {
    await resetDb()
    await db.people.put(aPerson({ id: 'tamar', name: 'תמר' }))
    await openExtras()
  })
  freezeDate(new Date(2026, 10, 8, 10).getTime())

  it('saves an added activity from its button, which then goes away', async () => {
    await tap('קפה')
    await typeInto('פעילות אחרת', 'שש-בש')
    await tap('הוספה')

    expect(saveButton('קפה')).not.toBeInTheDocument()

    await tap('שמירת „שש-בש” לפעם הבאה')
    await waitFor(() => expect(saveButton('שש-בש')).not.toBeInTheDocument())
    await tap('שש-בש')

    expect(await pressed('שש-בש')).toBe('false')
    expect(await chipsIn('מה עשינו')).toEqual([...ACTIVITY_PRESETS,'שש-בש'])
  })

  it('removes an unpicked saved activity in עריכה, and ביטול brings it back in its place', async () => {
    await tap('עריכה')
    await tap('הסרה: הליכה')
    await waitFor(() => expect(toasts()).toContain('הפעילות „הליכה” הוסרה מהפעילויות השמורות'))
    await tap('סיום')

    expect(await chipsIn('מה עשינו')).toEqual(['אוכל', 'קפה', 'בבית', 'ספורט', 'הופעה/סרט'])

    clickToastButton('ביטול')

    await waitFor(async () => expect(await chipsIn('מה עשינו')).toEqual(ACTIVITY_PRESETS))
  })

  it('locks the picked activities, saved or not, while עריכה is on', async () => {
    await tap('קפה')
    await typeInto('פעילות אחרת', 'שש-בש')
    await tap('הוספה')

    await tap('עריכה')

    expect(await findButton('קפה')).toBeDisabled()
    expect(await findButton('שש-בש')).toBeDisabled()
    expect(screen.queryByRole('button', { name: 'הסרה: קפה' })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'הסרה: שש-בש' })).not.toBeInTheDocument()

    await tap('סיום')

    expect(await findButton('קפה')).toBeEnabled()
  })

  it('offers עריכה only while a saved activity is left unpicked', async () => {
    for (const preset of ACTIVITY_PRESETS.slice(0, -1)) {
      await tap(preset)
    }

    expect(await findButton('עריכה')).toBeInTheDocument()

    await tap('הופעה/סרט')

    expect(screen.queryByRole('button', { name: 'עריכה' })).not.toBeInTheDocument()
  })
})
