import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { readAppearance, saveAppearance } from '../../src/appearance/appearance'
import { applyAppearance, startAppearance } from '../../src/appearance/applyAppearance'
import { isDarkPalette, phoneScheme, statusBarColour } from '../helpers/phoneScheme'

const LIGHT_GROUND = '#eef2f9'

const DARK_GROUND = '#0f1324'

function addThemeColour(scheme: 'light' | 'dark', content: string) {
  const meta = document.createElement('meta')
  meta.name = 'theme-color'
  meta.setAttribute('media', `(prefers-color-scheme: ${scheme})`)
  meta.content = content
  meta.dataset.scheme = scheme
  document.head.append(meta)
}

describe('applying an appearance', () => {
  beforeEach(() => {
    addThemeColour('light', LIGHT_GROUND)
    addThemeColour('dark', DARK_GROUND)
  })

  afterEach(() => {
    document.head.querySelectorAll('meta[name="theme-color"]').forEach((meta) => meta.remove())
    applyAppearance('light')
  })

  it('turns dark on a light phone', () => {
    applyAppearance('dark')

    expect(isDarkPalette()).toBe(true)
    expect(document.documentElement.style.colorScheme).toBe('dark')
    expect(statusBarColour()).toBe(DARK_GROUND)
  })

  it('turns light on a dark phone', () => {
    phoneScheme('dark')
    applyAppearance('dark')
    applyAppearance('light')

    expect(isDarkPalette()).toBe(false)
    expect(document.documentElement.style.colorScheme).toBe('light')
    expect(statusBarColour()).toBe(LIGHT_GROUND)
  })

  it('follows a dark phone on auto, and lets the browser follow it too', () => {
    phoneScheme('dark')
    applyAppearance('dark')
    applyAppearance('auto')

    expect(isDarkPalette()).toBe(true)
    expect(document.documentElement.style.colorScheme).toBe('dark')
    expect(statusBarColour()).toBe(DARK_GROUND)

    phoneScheme('light')

    expect(statusBarColour()).toBe(LIGHT_GROUND)
  })

  it('follows a light phone on auto', () => {
    applyAppearance('auto')

    expect(isDarkPalette()).toBe(false)
  })
})

describe('starting the app', () => {
  let stop = () => {}

  afterEach(() => {
    stop()
    applyAppearance('light')
  })

  it('opens in the stored choice', () => {
    saveAppearance('dark')
    stop = startAppearance()

    expect(isDarkPalette()).toBe(true)
  })

  it('keeps following the phone on auto', () => {
    stop = startAppearance()
    phoneScheme('dark')

    expect(isDarkPalette()).toBe(true)
  })

  it('ignores the phone once a choice is made', () => {
    stop = startAppearance()
    saveAppearance('light')
    phoneScheme('dark')

    expect(isDarkPalette()).toBe(false)
  })

  it('switches as soon as the choice changes', () => {
    stop = startAppearance()
    saveAppearance('dark')

    expect(isDarkPalette()).toBe(true)
  })
})

describe('the stored appearance', () => {
  it('follows the phone until something is chosen', () => {
    expect(readAppearance()).toBe('auto')
  })

  it('reads back what was chosen', () => {
    saveAppearance('dark')

    expect(readAppearance()).toBe('dark')
  })

  it('follows the phone when the stored value is not a choice', () => {
    localStorage.setItem('social-log:appearance', 'sepia')

    expect(readAppearance()).toBe('auto')
  })
})
