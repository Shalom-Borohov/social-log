import { fireEvent, screen, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'
import { joinCircle } from '../../src/data/circles'
import { FAMILY_CIRCLE_ID } from '../../src/domain/circles'
import { freezeDate } from '../helpers/clock'
import { resetDb } from '../helpers/db'
import { store, TODAY_AT_TEN } from '../helpers/friends'
import { expectInOrder, ionElement } from '../helpers/ionic'
import { aMeetup, aPerson } from '../helpers/meetups'
import { currentPath, renderAt } from '../helpers/renderAt'

const FAMILY = '/tabs/family'

const FRIENDS = '/tabs/friends'

const noam = aPerson({ id: 'noam', name: 'נועם' })

const mom = aPerson({ id: 'mom', name: 'אמא' })

const dad = aPerson({ id: 'dad', name: 'אבא' })

const dadEveryWeek = [
  aMeetup({ date: '2026-09-06', personIds: ['dad'], place: 'בבית' }),
  aMeetup({ date: '2026-09-13', personIds: ['dad'], place: 'בבית' }),
  aMeetup({ date: '2026-09-20', personIds: ['dad'], place: 'בפארק' }),
]

const noamEveryWeek = [
  aMeetup({ date: '2026-08-02', personIds: ['noam'], place: 'בים' }),
  aMeetup({ date: '2026-08-09', personIds: ['noam'], place: 'בים' }),
  aMeetup({ date: '2026-08-16', personIds: ['noam'], place: 'בטיילת' }),
]

const withMom = aMeetup({ date: '2026-11-05', personIds: ['mom', 'noam'] })

async function storeFamily(memberIds: string[]) {
  await store({ people: [noam, mom, dad], meetups: [withMom, ...dadEveryWeek, ...noamEveryWeek] })
  await joinCircle(FAMILY_CIRCLE_ID, memberIds)
}

describe('the משפחה tab', () => {
  beforeEach(resetDb)
  freezeDate(TODAY_AT_TEN)

  it('sits in the tab bar after חברים', async () => {
    renderAt('/tabs/calendar')

    const labels = () => Array.from(document.querySelectorAll('ion-tab-button')).map((button) => button.textContent)

    await waitFor(() => expect(labels()).toEqual(['לוח שנה', 'חברים', 'משפחה']))

    fireEvent.click(await ionElement('ion-tab-button[tab="family"]'))

    await waitFor(() => expect(currentPath()).toBe(FAMILY))
  })

  it('shows only family in its orbit, and only the others in חברים', async () => {
    await storeFamily(['mom', 'dad'])
    renderAt(FAMILY)

    expect(await screen.findByRole('button', { name: 'אמא, לפני 3 ימים' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /^אבא, / })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /^נועם, / })).not.toBeInTheDocument()
  })

  it('leaves family out of the חברים orbit', async () => {
    await storeFamily(['mom', 'dad'])
    renderAt(FRIENDS)

    expect(await screen.findByRole('button', { name: 'נועם, לפני 3 ימים' })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /^אמא, / })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /^אבא, / })).not.toBeInTheDocument()
  })

  it('nudges about family in משפחה and about friends in חברים', async () => {
    await storeFamily(['mom', 'dad'])
    renderAt(FAMILY)

    expect(await screen.findByText(/^לא ראית את אבא /)).toBeInTheDocument()
    expect(screen.queryByText(/^לא ראית את נועם /)).not.toBeInTheDocument()
  })

  it('opens a family member’s page inside משפחה, with a way back to משפחה', async () => {
    await storeFamily(['mom', 'dad'])
    renderAt(FAMILY)

    fireEvent.click(await screen.findByRole('button', { name: 'אמא, לפני 3 ימים' }))

    await waitFor(() => expect(currentPath()).toBe('/tabs/family/person/mom'))
    await waitFor(async () =>
      expect(await ionElement('ion-back-button[text="משפחה"]')).toHaveAttribute('default-href', FAMILY),
    )
  })

  it('opens its own כולם', async () => {
    await storeFamily(['mom', 'dad'])
    renderAt(FAMILY)

    fireEvent.click(await screen.findByText('כולם'))

    await waitFor(() => expect(currentPath()).toBe('/tabs/family/all'))
  })

  it('lists only family under כולם, with a way back to משפחה', async () => {
    await storeFamily(['mom', 'dad'])
    renderAt('/tabs/family/all')

    await expectInOrder(['אמא', 'אבא'])
    expect(screen.queryByText('נועם')).not.toBeInTheDocument()
    expect(await ionElement('ion-back-button')).toHaveAttribute('text', 'משפחה')
  })

  it('sends you to the משפחה circle while nobody is family', async () => {
    await storeFamily([])
    renderAt(FAMILY)

    fireEvent.click(await screen.findByText('בחירת בני משפחה'))

    await waitFor(() => expect(currentPath()).toBe('/tabs/calendar/settings/circles/family'))
  })

  it('waits for the first meetup with family', async () => {
    await store({ people: [mom] })
    await joinCircle(FAMILY_CIRCLE_ID, ['mom'])
    renderAt(FAMILY)

    expect(await screen.findByText('כאן יופיעו בני המשפחה אחרי המפגש הראשון')).toBeInTheDocument()
  })
})
