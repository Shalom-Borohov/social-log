import { screen, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { db } from '../../src/data/db'
import { chooseBackupFile } from '../helpers/backupFile'
import { freezeDate } from '../helpers/clock'
import { resetDb } from '../helpers/db'
import { fillRequiredSlots, slot, tap, typeInto } from '../helpers/log'
import { aMeetup, aPerson } from '../helpers/meetups'
import { alertShown, clickAlertButton, toasts } from '../helpers/overlays'
import { currentPath, renderAt } from '../helpers/renderAt'

const SAVE_FAILED = 'לא נשמר. אפשר לנסות שוב.'

const LOST_CONNECTION = new DOMException('Connection to Indexed Database server lost', 'UnknownError')

const saveFailureShown = () => waitFor(() => expect(toasts()).toContain(SAVE_FAILED))

const tamar = aPerson({ id: 'tamar', name: 'תמר' })

async function fillSentence() {
  renderAt('/log')
  await fillRequiredSlots({ people: ['תמר'], place: 'בטיילת', duration: 'שעה', rating: 'מעולה' })
  await typeInto('הערה', 'היה כיף')
}

describe('a save that fails', () => {
  beforeEach(async () => {
    await resetDb()
    await db.people.put(tamar)
  })
  freezeDate(new Date(2026, 10, 8, 10).getTime())

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('says so and keeps the whole sentence on screen', async () => {
    await fillSentence()
    const write = vi.spyOn(db.meetups, 'add').mockRejectedValue(LOST_CONNECTION)

    await tap('שמירה')
    await saveFailureShown()

    expect(write).toHaveBeenCalled()
    expect(currentPath()).toBe('/log')
    expect(await slot('מי')).toHaveAccessibleName('מי: תמר')
    expect(await slot('איך')).toHaveAccessibleName('איך: מעולה')
    expect(screen.getByLabelText('הערה')).toHaveValue('היה כיף')
    expect(await db.meetups.count()).toBe(0)
  })

  it('saves on a second try once the write works again', async () => {
    await fillSentence()
    vi.spyOn(db.meetups, 'add').mockRejectedValueOnce(LOST_CONNECTION)

    await tap('שמירה')
    await saveFailureShown()
    await tap('שמירה')

    await waitFor(() => expect(currentPath()).toBe('/tabs/calendar'))
    expect(await db.meetups.count()).toBe(1)
  })

  it('stays on the meetup when deleting it fails', async () => {
    await db.meetups.put(aMeetup({ id: 'walk', personIds: ['tamar'] }))
    renderAt('/log/walk')
    const shown = alertShown()

    await tap('מחיקה')
    await shown
    vi.spyOn(db.meetups, 'delete').mockRejectedValue(LOST_CONNECTION)
    clickAlertButton('מחיקה')
    await saveFailureShown()

    expect(currentPath()).toBe('/log/walk')
    expect(await slot('מי')).toHaveAccessibleName('מי: תמר')
  })

  it('keeps a new name that could not be added', async () => {
    renderAt('/log')
    await screen.findByRole('button', { name: 'תמר' })
    vi.spyOn(db.people, 'add').mockRejectedValue(LOST_CONNECTION)

    await typeInto('שם חדש', 'איתי')
    await tap('הוספה')
    await saveFailureShown()

    expect(screen.getByLabelText('שם חדש')).toHaveValue('איתי')
    expect(await slot('מי')).toHaveTextContent('מי?')
  })

  it('says so in Hebrew when restoring a backup fails', async () => {
    renderAt('/tabs/calendar/settings')
    await screen.findByText('ייבוא גיבוי')
    const shown = alertShown()

    chooseBackupFile(JSON.stringify({ version: 1, exportedAt: 1000, people: [], groups: [], meetups: [] }))
    await shown
    vi.spyOn(db.meetups, 'clear').mockRejectedValue(LOST_CONNECTION)
    clickAlertButton('ייבוא')

    await waitFor(() => expect(toasts()).toEqual([SAVE_FAILED]))
  })
})
