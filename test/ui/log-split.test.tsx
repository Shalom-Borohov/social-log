import { screen, waitFor, within } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'
import { db } from '../../src/data/db'
import { freezeDate } from '../helpers/clock'
import { resetDb } from '../helpers/db'
import { fillRequiredSlots, pressed, tap, typeInto } from '../helpers/log'
import { aPerson } from '../helpers/meetups'
import { alertHeader, alertMessage, alertShown, clickAlertButton } from '../helpers/overlays'
import { renderAt } from '../helpers/renderAt'

const peopleNames = async () => (await db.people.toArray()).map(({ name }) => name).sort()

const savedPlaceChips = async () =>
  within(await screen.findByRole('group', { name: 'מקומות שמורים' }))
    .getAllByRole('button')
    .map((button) => button.textContent)

async function addAndAsk(label: string, text: string) {
  await typeInto(label, text)
  const shown = alertShown()

  await tap('הוספה')
  await shown
}

describe('splitting several people typed together', () => {
  beforeEach(async () => {
    await resetDb()
    await db.people.put(aPerson({ id: 'tamar', name: 'תמר' }))
  })
  freezeDate(new Date(2026, 10, 8, 10).getTime())

  it('asks before adding and shows the parts', async () => {
    renderAt('/log')

    await addAndAsk('שם חדש', 'דני ורוני')

    expect(alertHeader()).toBe('להוסיף בנפרד?')
    expect(alertMessage()).toBe('דני · רוני')
  })

  it('adds and picks each part on פיצול ל־2', async () => {
    renderAt('/log')

    await addAndAsk('שם חדש', 'דני ורוני')
    clickAlertButton('פיצול ל־2')

    await waitFor(async () => expect(await pressed('דני')).toBe('true'))
    expect(await pressed('רוני')).toBe('true')
    expect(await peopleNames()).toEqual(['דני', 'רוני', 'תמר'])
    expect(await screen.findByLabelText('שם חדש')).toHaveValue('')
  })

  it('adds one person on להשאיר כמו שכתוב', async () => {
    renderAt('/log')

    await addAndAsk('שם חדש', 'דני ורוני')
    clickAlertButton('להשאיר כמו שכתוב')

    expect(await pressed('דני ורוני')).toBe('true')
    expect(await peopleNames()).toEqual(['דני ורוני', 'תמר'])
  })

  it('adds a name with nothing to split without asking', async () => {
    renderAt('/log')

    await typeInto('שם חדש', 'דני')
    await tap('הוספה')

    expect(await pressed('דני')).toBe('true')
    expect(document.querySelector('ion-alert')).not.toBeInTheDocument()
  })

  it('drops a stray comma instead of adding it to the name', async () => {
    renderAt('/log')

    await typeInto('שם חדש', 'דני,')
    await tap('הוספה')

    expect(await pressed('דני')).toBe('true')
    expect(await peopleNames()).toEqual(['דני', 'תמר'])
  })
})

describe('splitting several places saved together', () => {
  beforeEach(async () => {
    await resetDb()
    await db.people.put(aPerson({ id: 'tamar', name: 'תמר' }))
    renderAt('/log')
    await tap('תמר')
    await tap('המשך')
    await typeInto('מקום', 'בטיילת ובים')
    const shown = alertShown()

    await tap('שמירת „בטיילת ובים” לפעם הבאה')
    await shown
  })
  freezeDate(new Date(2026, 10, 8, 10).getTime())

  it('saves each part on פיצול ל־2 and keeps the meetup’s place as typed', async () => {
    expect(alertHeader()).toBe('לשמור בנפרד?')
    expect(alertMessage()).toBe('בטיילת · בים')

    clickAlertButton('פיצול ל־2')

    await waitFor(async () => expect((await savedPlaceChips()).sort()).toEqual(['בטיילת', 'בים']))
    expect(screen.queryByRole('button', { name: 'שמירת „בטיילת ובים” לפעם הבאה' })).not.toBeInTheDocument()

    await tap('המשך')
    await tap('שעה')
    await tap('טוב')
    await tap('שמירה')

    await waitFor(async () => expect(await db.meetups.toArray()).toEqual([expect.objectContaining({ place: 'בטיילת ובים' })]))
  })

  it('saves the text as one place on להשאיר כמו שכתוב', async () => {
    clickAlertButton('להשאיר כמו שכתוב')

    await waitFor(async () => expect(await savedPlaceChips()).toEqual(['בטיילת ובים']))
  })
})

describe('splitting several activities typed together', () => {
  beforeEach(async () => {
    await resetDb()
    await db.people.put(aPerson({ id: 'tamar', name: 'תמר' }))
    renderAt('/log')
    await fillRequiredSlots({ people: ['תמר'], place: 'בטיילת', duration: 'שעה', rating: 'טוב' })
  })
  freezeDate(new Date(2026, 10, 8, 10).getTime())

  it('asks before adding, then adds each part once on פיצול ל־2', async () => {
    await tap('קפה')

    await addAndAsk('פעילות אחרת', 'קפה ושש-בש')

    expect(alertHeader()).toBe('להוסיף בנפרד?')
    expect(alertMessage()).toBe('קפה · שש-בש')

    clickAlertButton('פיצול ל־2')

    expect(await pressed('שש-בש')).toBe('true')
    expect(await screen.findByText('קפה · שש-בש')).toBeInTheDocument()
    expect(await screen.findByLabelText('פעילות אחרת')).toHaveValue('')
  })

  it('adds the text as one activity on להשאיר כמו שכתוב', async () => {
    await addAndAsk('פעילות אחרת', 'שש-בש ופינג פונג')
    clickAlertButton('להשאיר כמו שכתוב')

    expect(await pressed('שש-בש ופינג פונג')).toBe('true')
    expect(await screen.findByLabelText('פעילות אחרת')).toHaveValue('')
  })

  it('adds an activity with nothing to split without asking', async () => {
    await typeInto('פעילות אחרת', 'שש-בש')
    await tap('הוספה')

    expect(await pressed('שש-בש')).toBe('true')
    expect(document.querySelector('ion-alert')).not.toBeInTheDocument()
  })
})
