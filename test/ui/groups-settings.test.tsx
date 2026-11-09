import { fireEvent, screen, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'
import { db } from '../../src/data/db'
import { resetDb } from '../helpers/db'
import { store } from '../helpers/friends'
import { aGroup, aMeetup } from '../helpers/meetups'
import {
  actionSheetPresented,
  alertShown,
  clickAlertButton,
  clickSheetButton,
  sheetButtons,
  typeInAlert,
} from '../helpers/overlays'
import { renderAt } from '../helpers/renderAt'

const SETTINGS_PAGE = '/tabs/calendar/settings'

const army = aGroup({ id: 'army', name: 'החבר׳ה מהצבא', memberIds: ['noam', 'omer'] })

async function openGroupActions() {
  const presented = actionSheetPresented()

  fireEvent.click(await screen.findByText('החבר׳ה מהצבא'))
  await presented
}

async function chooseAndConfirm(action: string, confirm: () => void) {
  const shown = alertShown()

  clickSheetButton(action)
  await shown
  confirm()
}

describe('saved groups in הגדרות', () => {
  beforeEach(resetDb)

  it('lists the saved groups with how many people are in each', async () => {
    await store({ groups: [army] })
    renderAt(SETTINGS_PAGE)

    expect(await screen.findByText('קבוצות')).toBeInTheDocument()
    expect(screen.getByText('2 אנשים')).toBeInTheDocument()
  })

  it('shows no groups section before a group is saved', async () => {
    renderAt(SETTINGS_PAGE)

    await screen.findByText('גיבוי')

    expect(screen.queryByText('קבוצות')).not.toBeInTheDocument()
  })

  it('offers to rename or delete a group', async () => {
    await store({ groups: [army] })
    renderAt(SETTINGS_PAGE)

    await openGroupActions()

    expect(sheetButtons()).toEqual(['שינוי שם', 'מחיקה', 'ביטול'])
  })

  it('renames a group', async () => {
    await store({ groups: [army] })
    renderAt(SETTINGS_PAGE)

    await openGroupActions()
    await chooseAndConfirm('שינוי שם', () => {
      typeInAlert('מהצבא')
      clickAlertButton('שמירה')
    })

    await waitFor(async () => expect((await db.groups.get('army'))?.name).toBe('מהצבא'))
  })

  it('deletes a group after confirming and keeps its meetups', async () => {
    await store({ groups: [army], meetups: [aMeetup({ id: 'barbecue', personIds: ['noam', 'omer'], groupId: 'army' })] })
    renderAt(SETTINGS_PAGE)

    await openGroupActions()
    await chooseAndConfirm('מחיקה', () => clickAlertButton('מחיקה'))

    await waitFor(async () => expect(await db.groups.count()).toBe(0))
    expect(await db.meetups.get('barbecue')).toBeDefined()
  })
})
