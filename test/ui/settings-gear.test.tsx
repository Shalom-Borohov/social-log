import { fireEvent, screen, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'
import { freezeDate } from '../helpers/clock'
import { resetDb } from '../helpers/db'
import { buttonByLabel, ionElement, visibleAll } from '../helpers/ionic'
import { currentPath, renderAt } from '../helpers/renderAt'

describe('the settings gear', () => {
  beforeEach(resetDb)
  freezeDate(new Date(2026, 10, 5, 10).getTime())

  it('on לוח שנה opens הגדרות in the same tab', async () => {
    renderAt('/tabs/calendar')

    fireEvent.click(await buttonByLabel('הגדרות'))

    await waitFor(() => expect(currentPath()).toBe('/tabs/calendar/settings'))
    expect(await screen.findByText('גיבוי')).toBeInTheDocument()
  })

  it('is not on הגדרות, whose back button names לוח שנה', async () => {
    renderAt('/tabs/calendar/settings')

    expect(await ionElement('ion-back-button')).toHaveAttribute('text', 'לוח שנה')
    expect(visibleAll('ion-button[aria-label="הגדרות"]')).toHaveLength(0)
  })
})
