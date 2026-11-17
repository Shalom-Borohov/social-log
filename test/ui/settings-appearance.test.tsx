import { screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { applyAppearance, startAppearance } from '../../src/appearance/applyAppearance'
import { resetDb } from '../helpers/db'
import { ionChange, ionElement } from '../helpers/ionic'
import { isDarkPalette, phoneScheme } from '../helpers/phoneScheme'
import { renderAt } from '../helpers/renderAt'

const SETTINGS = '/tabs/calendar/settings'

const appearanceSegment = () => ionElement('ion-segment[aria-label="מראה"]')

async function chosenAppearance() {
  const segment = await appearanceSegment()

  if (!('value' in segment)) {
    throw new Error('the appearance segment has no value')
  }

  return segment.value
}

describe('מראה in הגדרות', () => {
  let stop = () => {}

  beforeEach(async () => {
    await resetDb()
    stop = startAppearance()
  })

  afterEach(() => {
    stop()
    applyAppearance('light')
  })

  it('offers אוטומטי, בהיר and כהה, on אוטומטי at first', async () => {
    renderAt(SETTINGS)

    expect(await screen.findByText('מראה')).toBeInTheDocument()
    expect(screen.getByText('אוטומטי')).toBeInTheDocument()
    expect(screen.getByText('בהיר')).toBeInTheDocument()
    expect(screen.getByText('כהה')).toBeInTheDocument()
    expect(await chosenAppearance()).toBe('auto')
  })

  it('turns the app dark on a light phone, and remembers it', async () => {
    const { unmount } = renderAt(SETTINGS)

    ionChange(await appearanceSegment(), 'dark')

    expect(isDarkPalette()).toBe(true)

    unmount()
    renderAt(SETTINGS)

    expect(await chosenAppearance()).toBe('dark')
  })

  it('goes back to following the phone on אוטומטי', async () => {
    phoneScheme('light')
    renderAt(SETTINGS)
    const segment = await appearanceSegment()

    ionChange(segment, 'dark')
    ionChange(segment, 'auto')

    expect(isDarkPalette()).toBe(false)
  })
})
