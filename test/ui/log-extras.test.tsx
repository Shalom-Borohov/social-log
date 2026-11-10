import { screen, waitFor, within } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'
import { db } from '../../src/data/db'
import { saveChoices } from '../../src/data/savedChoices'
import { freezeDate } from '../helpers/clock'
import { resetDb } from '../helpers/db'
import { fillRequiredSlots, findButton, tap, typeInto } from '../helpers/log'
import { aMeetup, aPerson } from '../helpers/meetups'
import { currentPath, renderAt } from '../helpers/renderAt'

async function openExtras() {
  renderAt('/log')
  await fillRequiredSlots({ people: ['תמר'], place: 'בטיילת', duration: 'שעה', rating: 'טוב' })
}

const activityChips = async () =>
  within(await screen.findByRole('group', { name: 'מה עשינו' }))
    .getAllByRole('button')
    .map((button) => button.textContent)

const savedMeetup = async () => {
  await waitFor(() => expect(currentPath()).toBe('/tabs/calendar'))
  const [meetup] = await db.meetups.toArray()

  return meetup
}

describe('the extras', () => {
  beforeEach(async () => {
    await resetDb()
    await db.people.put(aPerson({ id: 'tamar', name: 'תמר' }))
  })
  freezeDate(new Date(2026, 10, 8, 10).getTime())

  it('offers the saved activities, then this meetup’s unsaved ones, but not other meetups’ unsaved ones', async () => {
    await saveChoices('activity', ['סנובורד'])
    await db.meetups.bulkPut([
      aMeetup({ id: 'old', personIds: ['tamar'], activities: ['טניס'] }),
      aMeetup({ id: 'this', personIds: ['tamar'], activities: ['שש-בש', 'קפה', 'פינג פונג'] }),
    ])

    renderAt('/log/this')

    expect(await activityChips()).toEqual([
      'אוכל',
      'קפה',
      'הליכה',
      'בבית',
      'ספורט',
      'הופעה/סרט',
      'סנובורד',
      'שש-בש',
      'פינג פונג',
    ])
  })

  it('saves several activities, who initiated and a note, and extends the sentence', async () => {
    await openExtras()

    await tap('הליכה')
    await tap('קפה')
    await typeInto('פעילות אחרת', 'שש-בש')
    await tap('הוספה')
    await tap('אני')
    await typeInto('הערה', 'דיברנו על הטיול')

    expect(await screen.findByText('הליכה · קפה · שש-בש · אני יזמתי')).toBeInTheDocument()
    expect(await findButton('שש-בש')).toHaveAttribute('aria-pressed', 'true')

    await tap('שמירה')

    expect(await savedMeetup()).toEqual(
      expect.objectContaining({
        activities: ['הליכה', 'קפה', 'שש-בש'],
        initiator: 'me',
        note: 'דיברנו על הטיול',
      }),
    )
  })

  it('saves an activity typed but not added, as written and not for next time', async () => {
    await openExtras()

    await tap('קפה')
    await typeInto('פעילות אחרת', ' שש-בש ופינג פונג ')
    await tap('שמירה')

    expect(await savedMeetup()).toEqual(expect.objectContaining({ activities: ['קפה', 'שש-בש ופינג פונג'] }))
    expect(document.querySelector('ion-alert')).not.toBeInTheDocument()
    expect(await db.savedActivities.get('שש-בש ופינג פונג')).toBeUndefined()
  })

  it('adds no second copy of a typed activity that is already picked', async () => {
    await openExtras()

    await tap('קפה')
    await typeInto('פעילות אחרת', 'קפה')
    await tap('שמירה')

    expect(await savedMeetup()).toEqual(expect.objectContaining({ activities: ['קפה'] }))
  })

  it('clears who initiated on a second tap', async () => {
    await openExtras()

    await tap('הם')

    expect(await screen.findByText('הם יזמו')).toBeInTheDocument()

    await tap('הם')

    expect(await findButton('הם')).toHaveAttribute('aria-pressed', 'false')
    expect(screen.queryByText('הם יזמו')).not.toBeInTheDocument()
  })

  it('saves without any extras', async () => {
    await openExtras()

    await tap('שמירה')

    const meetup = await savedMeetup()

    expect(meetup).not.toHaveProperty('activities')
    expect(meetup).not.toHaveProperty('initiator')
    expect(meetup).not.toHaveProperty('note')
  })
})
