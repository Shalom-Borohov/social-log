type Scheme = 'light' | 'dark'

type SchemeListener = (event: { matches: boolean }) => void

const DARK_QUERY = '(prefers-color-scheme: dark)'

const LIGHT_QUERY = '(prefers-color-scheme: light)'

const EVERY_SCREEN = 'all'

let currentScheme: Scheme = 'light'

const listeners = new Set<SchemeListener>()

export const isDarkPalette = () => document.documentElement.classList.contains('ion-palette-dark')

export function statusBarColour() {
  const metas = Array.from(document.querySelectorAll<HTMLMetaElement>('meta[name="theme-color"]'))
  const applying = metas.filter((meta) => window.matchMedia(meta.getAttribute('media') ?? EVERY_SCREEN).matches)

  if (applying.length !== 1) {
    throw new Error(`${applying.length} theme colours apply`)
  }

  return applying[0].content
}

export function phoneScheme(scheme: Scheme) {
  currentScheme = scheme
  listeners.forEach((listener) => listener({ matches: scheme === 'dark' }))
}

export function resetPhoneScheme() {
  currentScheme = 'light'
  listeners.clear()
}

function queryMatches(query: string) {
  if (query === DARK_QUERY) {
    return currentScheme === 'dark'
  }

  if (query === LIGHT_QUERY) {
    return currentScheme === 'light'
  }

  return query === EVERY_SCREEN
}

export function fakeMatchMedia(query: string) {
  const isDarkQuery = query === DARK_QUERY

  return {
    get matches() {
      return queryMatches(query)
    },
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: (_type: string, listener: SchemeListener) => isDarkQuery && listeners.add(listener),
    removeEventListener: (_type: string, listener: SchemeListener) => listeners.delete(listener),
    dispatchEvent: () => false,
  }
}
