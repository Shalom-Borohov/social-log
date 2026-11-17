import { readFileSync } from 'node:fs'
import { afterEach, describe, expect, it } from 'vitest'
import { saveAppearance } from '../../src/appearance/appearance'
import { applyAppearance } from '../../src/appearance/applyAppearance'
import { isDarkPalette, phoneScheme, statusBarColour } from '../helpers/phoneScheme'

const INDEX_HTML = readFileSync('index.html', 'utf8')

const LIGHT_GROUND = '#eef2f9'

const DARK_GROUND = '#0f1324'

function runFirstPaintScript() {
  const page = new DOMParser().parseFromString(INDEX_HTML, 'text/html')
  const script = page.head.querySelector('script#first-paint-appearance')

  if (!script?.textContent) {
    throw new Error('index.html has no first-paint appearance script')
  }

  const themeColoursAboveScript = Array.from(page.head.querySelectorAll('meta[name="theme-color"]')).filter(
    (meta) => meta.compareDocumentPosition(script) & Node.DOCUMENT_POSITION_FOLLOWING,
  )

  document.head.append(...themeColoursAboveScript.map((meta) => meta.cloneNode()))
  new Function(script.textContent)()
}

describe('the first paint, before the app loads', () => {
  afterEach(() => {
    document.head.querySelectorAll('meta[name="theme-color"]').forEach((meta) => meta.remove())
    applyAppearance('light')
  })

  it('is dark when כהה is chosen on a light phone', () => {
    saveAppearance('dark')
    runFirstPaintScript()

    expect(isDarkPalette()).toBe(true)
    expect(document.documentElement.style.colorScheme).toBe('dark')
    expect(statusBarColour()).toBe(DARK_GROUND)
  })

  it('is light when בהיר is chosen on a dark phone', () => {
    phoneScheme('dark')
    saveAppearance('light')
    runFirstPaintScript()

    expect(isDarkPalette()).toBe(false)
    expect(document.documentElement.style.colorScheme).toBe('light')
    expect(statusBarColour()).toBe(LIGHT_GROUND)
  })

  it('follows a dark phone when nothing is chosen', () => {
    phoneScheme('dark')
    runFirstPaintScript()

    expect(isDarkPalette()).toBe(true)
    expect(statusBarColour()).toBe(DARK_GROUND)
  })
})
