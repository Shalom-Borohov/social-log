import { useSyncExternalStore } from 'react'

const APPEARANCE_KEY = 'social-log:appearance'

const listeners = new Set<() => void>()

export const APPEARANCES = ['auto', 'light', 'dark'] as const

export type Appearance = (typeof APPEARANCES)[number]

const FOLLOW_THE_PHONE: Appearance = 'auto'

export const isAppearance = (stored: unknown): stored is Appearance => APPEARANCES.some((choice) => choice === stored)

export function readAppearance(): Appearance {
  const stored = localStorage.getItem(APPEARANCE_KEY)

  return isAppearance(stored) ? stored : FOLLOW_THE_PHONE
}

export function saveAppearance(appearance: Appearance) {
  localStorage.setItem(APPEARANCE_KEY, appearance)
  listeners.forEach((listener) => listener())
}

export function subscribeToAppearance(listener: () => void) {
  listeners.add(listener)

  return () => {
    listeners.delete(listener)
  }
}

export const useAppearance = () => useSyncExternalStore(subscribeToAppearance, readAppearance)
