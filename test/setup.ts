import 'fake-indexeddb/auto'
import '@testing-library/jest-dom/vitest'
import { setupIonicReact } from '@ionic/react'
import { cleanup } from '@testing-library/react'
import { afterEach, beforeEach, vi } from 'vitest'
import { saveSeenVersion } from '../src/appUpdate/seenVersion'
import { FakeResizeObserver } from './helpers/resizeObserver'

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

vi.stubGlobal('ResizeObserver', FakeResizeObserver)

setupIonicReact({ mode: 'ios' })

beforeEach(() => {
  localStorage.clear()
  saveSeenVersion(__APP_VERSION__)
})

afterEach(() => {
  cleanup()
})
