import { fireEvent, screen, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'
import { db } from '../../src/data/db'
import { resetDb } from '../helpers/db'
import { store } from '../helpers/friends'
import { expectInOrder, ionElement } from '../helpers/ionic'
import { aGroup, aMeetup, aPerson } from '../helpers/meetups'
import {
  actionSheetPresented,
  alertDismissed,
  alertHeader,
  alertShown,
  clickAlertButton,
  clickSheetButton,
  sheetButtons,
  sheetHeader,
} from '../helpers/overlays'
import { renderAt } from '../helpers/renderAt'

const FRIENDS_SETTINGS = '/tabs/calendar/settings/friends'

const people = [
  aPerson({ id: 'noam', name: 'נועם' }),
  aPerson({ id: 'dana', name: 'דנה', hidden: true }),
  aPerson({ id: 'ori', name: 'אורי' }),
  aPerson({ id: 'typo', name: 'נעם' }),
]

const groups = [aGroup({ id: 'army', memberIds: ['ori', 'dana'] })]

const meetups = [aMeetup({ personIds: ['noam'] })]

async function openSheetOf(name: string) {
  const presented = actionSheetPresented()

  fireEvent.click(await screen.findByText(name))
  await presented
}

async function chooseAndAnswer(action: string, answer: string) {
  const shown = alertShown()

  clickSheetButton(action)
  await shown

  const header = alertHeader()
  const dismissed = alertDismissed()

  clickAlertButton(answer)
  await dismissed

  return header
}

describe('the friends page in הגדרות', () => {
  beforeEach(async () => {
    await resetDb()
    await store({ people, groups, meetups })
  })

  it('lists everyone by name and marks people hidden from the orbit', async () => {
    renderAt(FRIENDS_SETTINGS)

    await expectInOrder(['אורי', 'דנה', 'נועם', 'נעם'])
    expect(screen.getAllByText('מוסתר מהמסלול')).toHaveLength(1)
  })

  it('hides someone from the orbit from their sheet', async () => {
    renderAt(FRIENDS_SETTINGS)
    await openSheetOf('נועם')

    expect(sheetHeader()).toBe('נועם')
    expect(sheetButtons()).toEqual(['הסתרה מהמסלול', 'ביטול'])

    clickSheetButton('הסתרה מהמסלול')

    await waitFor(async () => expect((await db.people.get('noam'))?.hidden).toBe(true))
    await waitFor(() => expect(screen.getAllByText('מוסתר מהמסלול')).toHaveLength(2))
  })

  it('shows a hidden person in the orbit again', async () => {
    renderAt(FRIENDS_SETTINGS)
    await openSheetOf('דנה')

    clickSheetButton('הצגה במסלול')

    await waitFor(async () => expect((await db.people.get('dana'))?.hidden).toBe(false))
    await waitFor(() => expect(screen.queryByText('מוסתר מהמסלול')).not.toBeInTheDocument())
  })

  it('offers no delete to someone in a group', async () => {
    renderAt(FRIENDS_SETTINGS)
    await openSheetOf('אורי')

    expect(sheetButtons()).toEqual(['הסתרה מהמסלול', 'ביטול'])
  })

  it('deletes someone in no meetup and no group after asking', async () => {
    renderAt(FRIENDS_SETTINGS)
    await openSheetOf('נעם')

    expect(sheetButtons()).toEqual(['הסתרה מהמסלול', 'מחיקה', 'ביטול'])

    expect(await chooseAndAnswer('מחיקה', 'מחיקה')).toBe('למחוק את נעם?')
    await waitFor(async () => expect(await db.people.get('typo')).toBeUndefined())
    await waitFor(() => expect(screen.queryByText('נעם')).not.toBeInTheDocument())
  })

  it('keeps them when the delete is cancelled', async () => {
    renderAt(FRIENDS_SETTINGS)
    await openSheetOf('נעם')
    await chooseAndAnswer('מחיקה', 'ביטול')

    expect(await db.people.get('typo')).toBeDefined()
    expect(screen.getByText('נעם')).toBeInTheDocument()
  })

  it('explains who can be deleted', async () => {
    renderAt(FRIENDS_SETTINGS)

    expect(await screen.findByText('אפשר למחוק רק מי שלא מופיע באף מפגש או קבוצה.')).toBeInTheDocument()
  })

  it('has a back button to הגדרות', async () => {
    renderAt(FRIENDS_SETTINGS)

    expect(await ionElement('ion-back-button')).toHaveAttribute('text', 'הגדרות')
  })
})
