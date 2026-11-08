import 'fake-indexeddb/auto'
import '@testing-library/jest-dom/vitest'
import { setupIonicReact } from '@ionic/react'
import { cleanup } from '@testing-library/react'
import { afterEach, beforeEach } from 'vitest'
import { saveSeenVersion } from '../src/appUpdate/seenVersion'

Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
  }),
})

setupIonicReact({ mode: 'ios' })

beforeEach(() => {
  localStorage.clear()
  saveSeenVersion(__APP_VERSION__)
})

afterEach(() => {
  cleanup()
})
