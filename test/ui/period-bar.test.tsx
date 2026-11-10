import { fireEvent, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'
import { dayButtons, openCalendar } from '../helpers/calendar'
import { freezeDate } from '../helpers/clock'
import { resetDb } from '../helpers/db'
import { ionElement } from '../helpers/ionic'
import { resize } from '../helpers/resizeObserver'

const SOLID = 'period-nav-solid'

const BAR_TOP = 500

const UNDER_THE_BAR = BAR_TOP + 200

const ABOVE_THE_BAR = BAR_TOP - 16

async function openCalendarParts() {
  await openCalendar()

  const bar = await ionElement('.period-nav')
  const pane = await ionElement('.calendar-pane')
  const content = dayButtons()[0]?.closest('ion-content')
  const lastRow = pane.lastElementChild

  if (!content || !lastRow) {
    throw new Error('no calendar content')
  }

  setBottom(content, BAR_TOP)

  return { bar, pane, lastRow, content, scroller: await content.getScrollElement() }
}

function setBottom(element: Element, bottom: number) {
  Object.defineProperty(element, 'getBoundingClientRect', {
    value: () => DOMRect.fromRect({ y: bottom, height: 0 }),
    configurable: true,
  })
}

describe('the period bar under the calendar', () => {
  beforeEach(resetDb)
  freezeDate(new Date(2026, 10, 5, 10).getTime())

  it('turns solid while content scrolls under it and blends in once only empty space is under it', async () => {
    const { bar, lastRow, scroller } = await openCalendarParts()

    expect(bar).not.toHaveClass(SOLID)

    setBottom(lastRow, UNDER_THE_BAR)
    fireEvent.scroll(scroller)

    await waitFor(() => expect(bar).toHaveClass(SOLID))

    setBottom(lastRow, ABOVE_THE_BAR)
    fireEvent.scroll(scroller)

    await waitFor(() => expect(bar).not.toHaveClass(SOLID))
  })

  it('turns solid when the content grows under it without a scroll', async () => {
    const { bar, pane, lastRow } = await openCalendarParts()

    setBottom(lastRow, UNDER_THE_BAR)
    resize(pane)

    await waitFor(() => expect(bar).toHaveClass(SOLID))
  })

  it('turns solid when a row added above the calendar pushes it under the bar', async () => {
    const { bar, content, lastRow } = await openCalendarParts()

    setBottom(lastRow, UNDER_THE_BAR)
    content.prepend(document.createElement('div'))

    await waitFor(() => expect(bar).toHaveClass(SOLID))
  })
})
