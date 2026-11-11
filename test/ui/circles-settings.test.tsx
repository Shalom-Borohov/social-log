import { fireEvent, screen, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'
import { db } from '../../src/data/db'
import type { Circle } from '../../src/domain/types'
import { expectTitle } from '../helpers/calendar'
import { resetDb } from '../helpers/db'
import { store } from '../helpers/friends'
import { expectInOrder, ionElement, ionEvent } from '../helpers/ionic'
import { aPerson } from '../helpers/meetups'
import {
  alertDismissed,
  alertHeader,
  alertMessage,
  alertShown,
  clickAlertButton,
  typeInAlert,
} from '../helpers/overlays'
import { currentPath, renderAt } from '../helpers/renderAt'

const SETTINGS_PAGE = '/tabs/calendar/settings'

const CIRCLES_PAGE = '/tabs/calendar/settings/circles'

const CIRCLE_EXPLAINED = 'מעגל מקבץ אנשים מאותו עולם, כמו עבודה או צבא. בשלב מי בוחרים מעגל ורואים רק את האנשים שבו.'

const people = [aPerson({ id: 'noam', name: 'נועם' }), aPerson({ id: 'dana', name: 'דנה', hidden: true })]

const work: Circle = { id: 'work', name: 'עבודה', memberIds: ['noam'] }

const army: Circle = { id: 'army', name: 'צבא', memberIds: [] }

const WORK_PAGE = `${CIRCLES_PAGE}/work`

async function checkboxOf(name: string) {
  const checkbox = (await screen.findByText(name)).closest('ion-checkbox')

  if (!checkbox) {
    throw new Error(`no checkbox for ${name}`)
  }

  return checkbox
}

async function goBackToCircles() {
  fireEvent.click(await ionElement('ion-back-button'))
  await waitFor(() => expect(currentPath()).toBe(CIRCLES_PAGE))
  await expectTitle('מעגלים')
}

describe('the circles row in הגדרות', () => {
  beforeEach(resetDb)

  it('is hidden before anyone exists', async () => {
    renderAt(SETTINGS_PAGE)

    await screen.findByText('גיבוי')

    expect(screen.queryByText('מעגלים')).not.toBeInTheDocument()
  })

  it('shows how many circles there are and opens the circles page', async () => {
    await store({ people })
    await db.circles.bulkPut([work, army])
    renderAt(SETTINGS_PAGE)

    const row = (await screen.findByText('מעגלים')).closest('ion-item')

    expect(row).toHaveTextContent('2')

    fireEvent.click(await screen.findByText('מעגלים'))

    await waitFor(() => expect(currentPath()).toBe('/tabs/calendar/settings/circles'))
  })
})

describe('the circles page', () => {
  beforeEach(async () => {
    await resetDb()
    await store({ people })
  })

  it('lists the circles by name with how many people are in each', async () => {
    await db.circles.bulkPut([army, work])
    renderAt(CIRCLES_PAGE)

    await expectInOrder(['עבודה', 'צבא'])
    expect(screen.getByText('אדם אחד')).toBeInTheDocument()
    expect(screen.getByText('0 אנשים')).toBeInTheDocument()
    expect(screen.queryByText(CIRCLE_EXPLAINED)).not.toBeInTheDocument()
  })

  it('explains what a circle is for before there are any', async () => {
    renderAt(CIRCLES_PAGE)

    expect(await screen.findByText(CIRCLE_EXPLAINED)).toBeInTheDocument()
  })

  it('has a back button to הגדרות', async () => {
    renderAt(CIRCLES_PAGE)

    expect(await ionElement('ion-back-button')).toHaveAttribute('text', 'הגדרות')
  })

  it('creates a circle by name and opens its page', async () => {
    renderAt(CIRCLES_PAGE)

    const shown = alertShown()

    fireEvent.click(await screen.findByText('מעגל חדש'))
    await shown

    expect(alertHeader()).toBe('מעגל חדש')

    typeInAlert(' שכונה ')
    clickAlertButton('שמירה')

    await waitFor(() => expect(currentPath()).toMatch(/^\/tabs\/calendar\/settings\/circles\/.+/))
    await expectTitle('שכונה')
  })
})

describe('a circle page', () => {
  beforeEach(async () => {
    await resetDb()
    await store({ people })
    await db.circles.bulkPut([work])
  })

  it('lists everyone by name, ticks the members and marks hidden people', async () => {
    renderAt(WORK_PAGE)

    await expectTitle('עבודה')
    await expectInOrder(['דנה', 'נועם'])
    expect(await checkboxOf('נועם')).toHaveProperty('checked', true)
    expect(await checkboxOf('דנה')).toHaveProperty('checked', false)
    expect(await checkboxOf('דנה')).toHaveProperty('helperText', 'מוסתר מהמסלול')
    expect(await checkboxOf('נועם')).toHaveProperty('helperText', undefined)
  })

  it('has a back button to מעגלים', async () => {
    renderAt(WORK_PAGE)

    expect(await ionElement('ion-back-button')).toHaveAttribute('text', 'מעגלים')
  })

  it('adds and removes people as they are ticked and unticked', async () => {
    renderAt(CIRCLES_PAGE)

    fireEvent.click(await screen.findByText('עבודה'))
    await expectTitle('עבודה')

    ionEvent(await checkboxOf('דנה'), 'ionChange', { checked: true })
    await goBackToCircles()
    expect(await screen.findByText('2 אנשים')).toBeInTheDocument()

    fireEvent.click(await screen.findByText('עבודה'))
    await expectTitle('עבודה')

    ionEvent(await checkboxOf('נועם'), 'ionChange', { checked: false })
    ionEvent(await checkboxOf('דנה'), 'ionChange', { checked: false })
    await goBackToCircles()
    expect(await screen.findByText('0 אנשים')).toBeInTheDocument()
  })

  it('renames the circle', async () => {
    renderAt(WORK_PAGE)
    await expectTitle('עבודה')

    const shown = alertShown()

    fireEvent.click(await screen.findByText('שינוי שם'))
    await shown
    typeInAlert('המשרד')
    clickAlertButton('שמירה')

    await expectTitle('המשרד')
  })

  it('deletes the circle after confirming, keeps its people and goes back to the list', async () => {
    renderAt(CIRCLES_PAGE)

    fireEvent.click(await screen.findByText('עבודה'))
    await expectTitle('עבודה')

    const shown = alertShown()

    fireEvent.click(await screen.findByText('מחיקה'))
    await shown

    expect(alertHeader()).toBe('למחוק את המעגל עבודה?')
    expect(alertMessage()).toBe('האנשים שבו לא יימחקו.')

    clickAlertButton('מחיקה')

    await waitFor(() => expect(currentPath()).toBe(CIRCLES_PAGE))
    expect(await screen.findByText(CIRCLE_EXPLAINED)).toBeInTheDocument()
    expect(await db.people.count()).toBe(2)
  })

  it('keeps the circle when the delete is cancelled', async () => {
    renderAt(WORK_PAGE)
    await expectTitle('עבודה')

    const shown = alertShown()

    fireEvent.click(await screen.findByText('מחיקה'))
    await shown

    const dismissed = alertDismissed()

    clickAlertButton('ביטול')
    await dismissed

    expect(currentPath()).toBe(WORK_PAGE)
    expect(await db.circles.get('work')).toBeDefined()
  })

  it('goes back to the list when the circle does not exist', async () => {
    renderAt(`${CIRCLES_PAGE}/nowhere`)

    await waitFor(() => expect(currentPath()).toBe(CIRCLES_PAGE))
  })
})
