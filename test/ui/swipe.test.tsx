import { screen } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'
import { dayButton, expectTitle, openCalendar } from '../helpers/calendar'
import { freezeDate } from '../helpers/clock'
import { resetDb } from '../helpers/db'
import { currentPath } from '../helpers/renderAt'
import { swipe, swipeLeft, swipeRight } from '../helpers/swipe'

const THIS_PAGE_TITLE = '5 השבועות האחרונים'

const SETTLE_MS = 600

const settle = () => new Promise((resolve) => setTimeout(resolve, SETTLE_MS))

describe('swiping the calendar', () => {
  beforeEach(resetDb)
  freezeDate(new Date(2026, 10, 5, 10).getTime())

  it('moves 5 weeks back with a swipe left and forward with a swipe right', async () => {
    await openCalendar()

    await swipeLeft()

    await expectTitle('30.8–3.10')
    expect(await dayButton('יום ראשון 30.8')).toBeInTheDocument()

    await swipeRight()

    await expectTitle(THIS_PAGE_TITLE)
    expect(currentPath()).toBe('/tabs/calendar')
  })

  it('never swipes past this week', async () => {
    await openCalendar()

    await swipeRight()
    await settle()

    await expectTitle(THIS_PAGE_TITLE)
    expect(screen.queryByRole('button', { name: /^שבת 14\.11/ })).not.toBeInTheDocument()
  })

  it('ignores a short drag', async () => {
    await openCalendar()

    await swipe(-0.1)
    await settle()

    await expectTitle(THIS_PAGE_TITLE)
    expect(screen.queryByRole('button', { name: /^יום ראשון 30\.8/ })).not.toBeInTheDocument()
  })
})
