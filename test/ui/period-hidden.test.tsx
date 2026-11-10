import { screen } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'
import { openCalendar } from '../helpers/calendar'
import { freezeDate } from '../helpers/clock'
import { resetDb } from '../helpers/db'
import { buttonByLabel, visibleAll } from '../helpers/ionic'

const PREVIOUS_PAGE = '5 השבועות הקודמים'

const NEXT_PAGE = '5 השבועות הבאים'

describe("the calendar's paging buttons", () => {
  beforeEach(resetDb)
  freezeDate(new Date(2026, 10, 5, 10).getTime())

  it('leaves no bar or arrows under the calendar', async () => {
    await openCalendar()

    expect(visibleAll('ion-footer')).toHaveLength(0)
    expect(screen.queryByText('הקודם')).not.toBeInTheDocument()
    expect(screen.queryByText('הבא')).not.toBeInTheDocument()
  })

  it('keeps previous and next hidden until focused', async () => {
    await openCalendar()

    expect((await buttonByLabel(PREVIOUS_PAGE)).closest('.visually-hidden-focusable')).not.toBeNull()
    expect((await buttonByLabel(NEXT_PAGE)).closest('.visually-hidden-focusable')).not.toBeNull()
  })
})
