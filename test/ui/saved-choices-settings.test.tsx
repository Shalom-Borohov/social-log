import { fireEvent, screen, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'
import { allMeetups } from '../../src/data/repo'
import { saveChoices } from '../../src/data/savedChoices'
import { freezeDate } from '../helpers/clock'
import { resetDb } from '../helpers/db'
import { store } from '../helpers/friends'
import { ionElement } from '../helpers/ionic'
import { ACTIVITY_PRESETS, aMeetup, aPerson } from '../helpers/meetups'
import {
  actionSheetPresented,
  alertShown,
  clickAlertButton,
  clickSheetButton,
  clickToastButton,
  sheetButtons,
  sheetHeader,
  toastPresented,
  toasts,
  typeInAlert,
} from '../helpers/overlays'
import { renderAt } from '../helpers/renderAt'

const SETTINGS_PAGE = '/tabs/calendar/settings'

const noam = aPerson({ id: 'noam', name: 'נועם' })

const FIRST_LOAD_TIMEOUT_MS = 4000

function sectionRows(header: string) {
  const list = screen.getByText(header).closest('ion-list-header')?.nextElementSibling

  if (!list) {
    throw new Error(`no list under ${header}`)
  }

  return Array.from(list.querySelectorAll('ion-item ion-label'), (label) => label.textContent)
}

const expectRows = (header: string, names: string[]) =>
  waitFor(() => expect(sectionRows(header)).toEqual(names), { timeout: FIRST_LOAD_TIMEOUT_MS })

async function openActions(name: string) {
  const presented = actionSheetPresented()

  fireEvent.click(await screen.findByText(name, { selector: 'ion-item ion-label' }, { timeout: FIRST_LOAD_TIMEOUT_MS }))
  await presented
}

async function chooseAndConfirm(action: string, confirm: () => void) {
  const shown = alertShown()

  clickSheetButton(action)
  await shown
  confirm()
}

async function chooseDelete() {
  const presented = toastPresented()

  clickSheetButton('מחיקה')
  await presented
}

describe('saved places and activities in הגדרות', () => {
  beforeEach(resetDb)
  freezeDate(new Date(2026, 10, 8, 10).getTime())

  it('lists the saved places, most recently used first, and the saved activities', async () => {
    await store({
      meetups: [
        aMeetup({ date: '2026-11-01', place: 'בפלורנטין' }),
        aMeetup({ date: '2026-11-05', place: 'בים' }),
        aMeetup({ date: '2026-11-06', place: 'בטיילת' }),
      ],
    })
    await saveChoices('place', ['בפארק', 'בפלורנטין', 'בים'])
    await saveChoices('activity', ['טיול'])
    renderAt(SETTINGS_PAGE)

    await expectRows('מקומות שמורים', ['בים', 'בפלורנטין', 'בפארק'])
    await expectRows('פעילויות שמורות', [...ACTIVITY_PRESETS,'טיול'])
  })

  it('shows no places section before a place is saved', async () => {
    await store({ meetups: [aMeetup({ place: 'בפלורנטין' })] })
    renderAt(SETTINGS_PAGE)

    await expectRows('פעילויות שמורות', ACTIVITY_PRESETS)

    expect(screen.queryByText('מקומות שמורים')).not.toBeInTheDocument()
  })

  it('offers to rename or delete a saved place', async () => {
    await saveChoices('place', ['בים'])
    renderAt(SETTINGS_PAGE)

    await openActions('בים')

    expect(sheetHeader()).toBe('בים')
    expect(sheetButtons()).toEqual(['שינוי שם', 'מחיקה', 'ביטול'])
  })

  it('renames a saved place, and a past meetup there now shows the new name', async () => {
    await store({ people: [noam], meetups: [aMeetup({ date: '2026-11-05', place: 'בים', minutes: 60 })] })
    await saveChoices('place', ['בים'])
    renderAt(SETTINGS_PAGE)

    await openActions('בים')
    await chooseAndConfirm('שינוי שם', () => {
      typeInAlert('בחוף')
      clickAlertButton('שמירה')
    })

    await expectRows('מקומות שמורים', ['בחוף'])

    fireEvent.click(await ionElement('ion-back-button'))

    expect(await screen.findByText('בחוף · שעה', {}, { timeout: FIRST_LOAD_TIMEOUT_MS })).toBeInTheDocument()
  })

  it('renames a saved activity, in its place on the list and in past meetups', async () => {
    await store({ meetups: [aMeetup({ id: 'morning', activities: ['קפה', 'הליכה'] })] })
    renderAt(SETTINGS_PAGE)

    await openActions('קפה')
    await chooseAndConfirm('שינוי שם', () => {
      typeInAlert('בית קפה')
      clickAlertButton('שמירה')
    })

    await expectRows('פעילויות שמורות', ['אוכל', 'בית קפה', 'הליכה', 'בבית', 'ספורט', 'הופעה/סרט'])
    expect((await allMeetups()).map(({ activities }) => activities)).toEqual([['בית קפה', 'הליכה']])
  })

  it('keeps a place when its new name is already saved, and says so', async () => {
    await store({ meetups: [aMeetup({ place: 'בים' })] })
    await saveChoices('place', ['בים', 'בחוף'])
    renderAt(SETTINGS_PAGE)

    await openActions('בים')
    await chooseAndConfirm('שינוי שם', () => {
      typeInAlert('בחוף')
      clickAlertButton('שמירה')
    })

    await waitFor(() => expect(toasts()).toEqual(['כבר יש מקום בשם „בחוף”']))
    await expectRows('מקומות שמורים', ['בים', 'בחוף'])
    expect((await allMeetups()).map(({ place }) => place)).toEqual(['בים'])
  })

  it('deletes a saved place without asking, keeps its meetups, and ביטול brings it back', async () => {
    await store({ meetups: [aMeetup({ place: 'בים' })] })
    await saveChoices('place', ['בים', 'בחוף'])
    renderAt(SETTINGS_PAGE)

    await openActions('בים')
    await chooseDelete()

    await expectRows('מקומות שמורים', ['בחוף'])
    expect(toasts()).toEqual(['המקום „בים” הוסר מהמקומות השמורים'])
    expect((await allMeetups()).map(({ place }) => place)).toEqual(['בים'])

    clickToastButton('ביטול')

    await expectRows('מקומות שמורים', ['בים', 'בחוף'])
  })

  it('puts a deleted activity back in its old spot on ביטול', async () => {
    renderAt(SETTINGS_PAGE)

    await openActions('קפה')
    await chooseDelete()

    await expectRows('פעילויות שמורות', ['אוכל', 'הליכה', 'בבית', 'ספורט', 'הופעה/סרט'])
    expect(toasts()).toEqual(['הפעילות „קפה” הוסרה מהפעילויות השמורות'])

    clickToastButton('ביטול')

    await expectRows('פעילויות שמורות', ACTIVITY_PRESETS)
  })
})
