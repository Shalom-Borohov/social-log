import { screen, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'
import { db } from '../../src/data/db'
import { store } from '../helpers/calendar'
import { freezeDate } from '../helpers/clock'
import { resetDb } from '../helpers/db'
import { findButton, tap, tapSlot } from '../helpers/log'
import { aMeetup, aPerson } from '../helpers/meetups'
import { alertShown, clickAlertButton, typeInAlert } from '../helpers/overlays'
import { renderAt } from '../helpers/renderAt'

const people = [aPerson({ id: 'tamar', name: 'תמר' }), aPerson({ id: 'maya', name: 'מאיה' }), aPerson({ id: 'noam', name: 'נועם' })]

const walk = aMeetup({ id: 'walk', personIds: ['tamar', 'maya'] })

const coffee = aMeetup({ id: 'coffee', personIds: ['maya', 'tamar'] })

const hint = 'כבר 2 מפגשים עם תמר ומאיה'

describe('suggesting a group in מי', () => {
  beforeEach(resetDb)
  freezeDate(new Date(2026, 10, 8, 10).getTime())

  it('names how often the picked people met, on the שמירה כקבוצה button too', async () => {
    await store({ people, meetups: [walk, coffee] })
    renderAt('/log')

    await tap('תמר')
    await tap('מאיה')

    expect(await screen.findByText(hint)).toBeInTheDocument()
    expect(await findButton('שמירה כקבוצה')).toHaveAccessibleDescription(hint)
  })

  it('stays quiet after only one meetup together', async () => {
    await store({ people, meetups: [walk] })
    renderAt('/log')

    await tap('תמר')
    await tap('מאיה')

    expect(await findButton('שמירה כקבוצה')).not.toHaveAccessibleDescription()
    expect(screen.queryByText(/מפגשים עם/)).not.toBeInTheDocument()
  })

  it('goes away once they are saved as a group', async () => {
    await store({ people, meetups: [walk, coffee] })
    renderAt('/log')

    await tap('תמר')
    await tap('מאיה')
    const shown = alertShown()

    await tap('שמירה כקבוצה')
    await shown
    typeInAlert('האחיות')
    clickAlertButton('שמירה')

    await waitFor(() => expect(screen.queryByText(hint)).not.toBeInTheDocument())
    expect(await db.groups.count()).toBe(1)
  })

  it('does not count the meetup being edited', async () => {
    await store({ people, meetups: [walk, coffee] })
    renderAt('/log/walk')

    await tapSlot('מי')

    expect(await findButton('שמירה כקבוצה')).not.toHaveAccessibleDescription()
    expect(screen.queryByText(/מפגשים עם/)).not.toBeInTheDocument()
  })
})
