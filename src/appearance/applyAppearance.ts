import { type Appearance, readAppearance, subscribeToAppearance } from './appearance'

const SCHEMES = ['light', 'dark'] as const

type Scheme = (typeof SCHEMES)[number]

const phoneQuery = (scheme: Scheme) => `(prefers-color-scheme: ${scheme})`

const PHONE_IS_DARK = phoneQuery('dark')

const DARK_PALETTE_CLASS = 'ion-palette-dark'

const ALWAYS_APPLIES = 'all'

const NEVER_APPLIES = 'not all'

const phoneIsDark = () => window.matchMedia(PHONE_IS_DARK).matches

function schemeOf(appearance: Appearance): Scheme {
  if (appearance === 'auto') {
    return phoneIsDark() ? 'dark' : 'light'
  }

  return appearance
}

function themeColourMedia(metaScheme: Scheme, appearance: Appearance, scheme: Scheme) {
  if (appearance === 'auto') {
    return phoneQuery(metaScheme)
  }

  return metaScheme === scheme ? ALWAYS_APPLIES : NEVER_APPLIES
}

export function applyAppearance(appearance: Appearance) {
  const scheme = schemeOf(appearance)
  const root = document.documentElement

  root.classList.toggle(DARK_PALETTE_CLASS, scheme === 'dark')
  root.style.colorScheme = scheme
  SCHEMES.forEach((metaScheme) => {
    document.querySelectorAll<HTMLMetaElement>(`meta[name="theme-color"][data-scheme="${metaScheme}"]`).forEach((meta) => {
      meta.setAttribute('media', themeColourMedia(metaScheme, appearance, scheme))
    })
  })
}

const applyStoredAppearance = () => applyAppearance(readAppearance())

function followPhoneWhileOnAuto() {
  if (readAppearance() === 'auto') {
    applyStoredAppearance()
  }
}

export function startAppearance() {
  const phoneScheme = window.matchMedia(PHONE_IS_DARK)

  applyStoredAppearance()
  phoneScheme.addEventListener('change', followPhoneWhileOnAuto)
  const stopFollowingChoice = subscribeToAppearance(applyStoredAppearance)

  return () => {
    phoneScheme.removeEventListener('change', followPhoneWhileOnAuto)
    stopFollowingChoice()
  }
}
