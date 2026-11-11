import { fireEvent, screen, waitFor, within } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'
import { allCircles, joinCircle, saveCircle } from '../../src/data/circles'
import { db } from '../../src/data/db'
import { dayButton, openCalendar, store } from '../helpers/calendar'
import { freezeDate } from '../helpers/clock'
import { resetDb } from '../helpers/db'
import { ionElement } from '../helpers/ionic'
import { findButton, pressed, slot, tap, tapSlot, typeInto } from '../helpers/log'
import { aGroup, aMeetup, aPerson } from '../helpers/meetups'
import { alertShown, clickAlertButton } from '../helpers/overlays'
import { currentPath, renderAt } from '../helpers/renderAt'

const CIRCLE_ROW = 'מעגל'

const circleChip = async (name: string) =>
  within(await screen.findByRole('group', { name: CIRCLE_ROW })).getByRole('button', { name })

async function tapCircle(name: string) {
  fireEvent.click(await circleChip(name))
}

const personChips = async () =>
  within(await screen.findByRole('group', { name: 'חברים' }))
    .getAllByRole('button')
    .map((button) => button.textContent)

async function storeWorkCircle() {
  const work = await saveCircle('עבודה')

  await joinCircle(work.id, ['tamar', 'noam'])
}

async function circleMemberNames(circleName: string) {
  const people = await db.people.toArray()
  const circle = (await allCircles()).find(({ name }) => name === circleName)

  return people
    .filter((person) => circle?.memberIds.includes(person.id))
    .map(({ name }) => name)
    .sort()
}

describe('narrowing מי to a circle', () => {
  beforeEach(async () => {
    await resetDb()
    await db.people.bulkPut([
      aPerson({ id: 'tamar', name: 'תמר' }),
      aPerson({ id: 'maya', name: 'מאיה' }),
      aPerson({ id: 'noam', name: 'נועם' }),
    ])
  })
  freezeDate(new Date(2026, 10, 8, 10).getTime())

  it('names the קבוצות and מעגל rows on screen, since a group picks people and a circle only narrows them', async () => {
    await storeWorkCircle()
    await db.groups.add(aGroup({ name: 'החבר׳ה', memberIds: ['tamar', 'maya'] }))
    renderAt('/log')

    const groupsRow = await screen.findByRole('group', { name: 'קבוצות' })
    const circleRow = await screen.findByRole('group', { name: CIRCLE_ROW })

    expect(within(groupsRow).getByText('קבוצות')).toBeVisible()
    expect(within(circleRow).getByText(CIRCLE_ROW)).toBeVisible()
    expect(within(await screen.findByRole('group', { name: 'חברים' })).queryByText('חברים')).toBeNull()
  })

  it('shows only the circle’s people once the circle is tapped', async () => {
    await storeWorkCircle()
    renderAt('/log')

    expect(await circleChip('כולם')).toHaveAttribute('aria-pressed', 'true')

    await tapCircle('עבודה')

    await waitFor(async () => expect(await personChips()).toEqual(['נועם', 'תמר']))
    expect(await circleChip('עבודה')).toHaveAttribute('aria-pressed', 'true')
    expect(await circleChip('כולם')).toHaveAttribute('aria-pressed', 'false')
  })

  it('shows no circle row when there are no circles', async () => {
    renderAt('/log')

    await waitFor(async () => expect(await personChips()).toEqual(['מאיה', 'נועם', 'תמר']))
    expect(screen.queryByRole('group', { name: CIRCLE_ROW })).not.toBeInTheDocument()
  })

  it('keeps people picked outside the circle on screen and picked', async () => {
    await storeWorkCircle()
    renderAt('/log')

    await tap('מאיה')
    await tapCircle('עבודה')

    await waitFor(async () => expect(await personChips()).toEqual(['מאיה', 'נועם', 'תמר']))
    expect(await pressed('מאיה')).toBe('true')
    expect(await pressed('תמר')).toBe('false')
  })

  it('shows everyone again on כולם', async () => {
    await storeWorkCircle()
    renderAt('/log')

    await tapCircle('עבודה')
    await waitFor(async () => expect(await personChips()).toEqual(['נועם', 'תמר']))
    await tapCircle('כולם')

    await waitFor(async () => expect(await personChips()).toEqual(['מאיה', 'נועם', 'תמר']))
    expect(await circleChip('כולם')).toHaveAttribute('aria-pressed', 'true')
  })

  it('leaves the picks and the group as they were when a circle is tapped', async () => {
    await storeWorkCircle()
    await db.groups.put(aGroup({ id: 'trio', name: 'השלישייה', memberIds: ['tamar', 'maya', 'noam'] }))
    renderAt('/log')

    await tap('השלישייה')
    await tapCircle('עבודה')
    await tapCircle('עבודה')

    expect(await circleChip('עבודה')).toHaveAttribute('aria-pressed', 'true')
    expect(await pressed('השלישייה')).toBe('true')
    expect(await slot('מי')).toHaveAccessibleName('מי: השלישייה')
  })

  it('still narrows while עריכה is on', async () => {
    await storeWorkCircle()
    renderAt('/log')

    await tap('עריכה')
    await tapCircle('עבודה')

    await waitFor(() => expect(screen.queryByRole('button', { name: 'הסתרה: מאיה' })).not.toBeInTheDocument())
    expect(await findButton('הסתרה: נועם')).toBeInTheDocument()
    expect(await findButton('הסתרה: תמר')).toBeInTheDocument()
  })
})

describe('the circle filter when the sentence opens again', () => {
  beforeEach(async () => {
    await resetDb()
    await store({
      people: [aPerson({ id: 'tamar', name: 'תמר' }), aPerson({ id: 'maya', name: 'מאיה' })],
      meetups: [aMeetup({ id: 'walk', date: '2026-11-05', personIds: ['maya'] })],
    })
    await storeWorkCircle()
  })
  freezeDate(new Date(2026, 10, 8, 10).getTime())

  async function narrowAndClose() {
    fireEvent.click(await ionElement('.new-meetup-button'))
    await waitFor(() => expect(currentPath()).toBe('/log'))
    await tapCircle('עבודה')
    await waitFor(async () => expect(await personChips()).toEqual(['תמר']))
    await tap('סגירה')
    await waitFor(() => expect(currentPath()).toBe('/tabs/calendar'))
  }

  it('is back on כולם for the next new meetup', async () => {
    await openCalendar()
    await narrowAndClose()

    fireEvent.click(await ionElement('.new-meetup-button'))
    await waitFor(() => expect(currentPath()).toBe('/log'))

    expect(await circleChip('כולם')).toHaveAttribute('aria-pressed', 'true')
    expect(await personChips()).toEqual(['מאיה', 'תמר'])
  })

  it('is back on כולם when a meetup is opened to edit', async () => {
    await openCalendar()
    await narrowAndClose()

    fireEvent.click(await dayButton('יום חמישי 5.11'))
    fireEvent.click(await ionElement('.calendar-meetups ion-item'))
    await waitFor(() => expect(currentPath()).toBe('/log/walk'))
    await tapSlot('מי')

    expect(await circleChip('כולם')).toHaveAttribute('aria-pressed', 'true')
    expect(await personChips()).toEqual(['מאיה', 'תמר'])
  })
})

describe('adding names while a circle is selected', () => {
  beforeEach(async () => {
    await resetDb()
    await db.people.bulkPut([aPerson({ id: 'tamar', name: 'תמר' }), aPerson({ id: 'maya', name: 'מאיה' })])
  })
  freezeDate(new Date(2026, 10, 8, 10).getTime())

  it('puts a typed new name in the circle', async () => {
    await storeWorkCircle()
    renderAt('/log')

    await tapCircle('עבודה')
    await typeInto('שם חדש', 'דני')
    await tap('הוספה')

    await waitFor(async () => expect(await pressed('דני')).toBe('true'))
    await waitFor(async () => expect(await circleMemberNames('עבודה')).toEqual(['דני', 'תמר']))
  })

  it('puts a typed existing name in the circle', async () => {
    await storeWorkCircle()
    renderAt('/log')

    await tapCircle('עבודה')
    await typeInto('שם חדש', 'מאיה')
    await tap('הוספה')

    expect(await pressed('מאיה')).toBe('true')
    await waitFor(async () => expect(await circleMemberNames('עבודה')).toEqual(['מאיה', 'תמר']))
  })

  it('puts every part of a split entry in the circle', async () => {
    await storeWorkCircle()
    renderAt('/log')

    await tapCircle('עבודה')
    await typeInto('שם חדש', 'דני ורוני')
    const shown = alertShown()

    await tap('הוספה')
    await shown
    clickAlertButton('פיצול ל־2')

    await waitFor(async () => expect(await circleMemberNames('עבודה')).toEqual(['דני', 'רוני', 'תמר']))
    expect(await personChips()).toEqual(['דני', 'רוני', 'תמר'])
  })

  it('puts a typed name in no circle while כולם is selected', async () => {
    await storeWorkCircle()
    renderAt('/log')

    await typeInto('שם חדש', 'דני')
    await tap('הוספה')

    expect(await pressed('דני')).toBe('true')
    expect(await circleMemberNames('עבודה')).toEqual(['תמר'])
  })
})
