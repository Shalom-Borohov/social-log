import { fireEvent, screen, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'
import { freezeDate } from '../helpers/clock'
import { resetDb } from '../helpers/db'
import { store, TODAY_AT_TEN } from '../helpers/friends'
import { expectInOrder, ionElement } from '../helpers/ionic'
import { aMeetup, aPerson } from '../helpers/meetups'
import { currentPath, renderAt } from '../helpers/renderAt'

const ALL_FRIENDS = '/tabs/friends/all'

const people = [
  aPerson({ id: 'ori', name: 'אורי' }),
  aPerson({ id: 'dana', name: 'דנה', hidden: true }),
  aPerson({ id: 'noam', name: 'נועם' }),
]

const meetups = [
  aMeetup({ date: '2026-09-09', personIds: ['dana'] }),
  aMeetup({ date: '2026-11-07', personIds: ['noam'] }),
]

describe('the list of everyone', () => {
  beforeEach(async () => {
    await resetDb()
    await store({ people, meetups })
  })

  freezeDate(TODAY_AT_TEN)

  it('lists everyone by how long since you met, never met last', async () => {
    renderAt(ALL_FRIENDS)

    await expectInOrder(['נועם', 'דנה', 'אורי'])
    expect(screen.getByText('לפני יום')).toBeInTheDocument()
    expect(screen.getByText('לפני חודשיים')).toBeInTheDocument()
    expect(screen.getByText('עוד לא נפגשתם')).toBeInTheDocument()
  })

  it('marks people hidden from the orbit', async () => {
    renderAt(ALL_FRIENDS)

    expect(await screen.findByText('מוסתר מהמסלול')).toBeInTheDocument()
    expect(screen.getAllByText('מוסתר מהמסלול')).toHaveLength(1)
  })

  it('opens a person’s page from their row', async () => {
    renderAt(ALL_FRIENDS)

    fireEvent.click(await screen.findByText('אורי'))

    await waitFor(() => expect(currentPath()).toBe('/tabs/friends/person/ori'))
  })

  it('has a back button to the friends tab', async () => {
    renderAt(ALL_FRIENDS)

    expect(await ionElement('ion-back-button')).toHaveAttribute('text', 'חברים')
  })
})
