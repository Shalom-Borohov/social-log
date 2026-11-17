import 'fake-indexeddb/auto'
import '@testing-library/jest-dom/vitest'
import { setupIonicReact } from '@ionic/react'
import { cleanup } from '@testing-library/react'
import { afterEach, beforeEach } from 'vitest'
import { saveSeenVersion } from '../src/appUpdate/seenVersion'
import { fakeMatchMedia, resetPhoneScheme } from './helpers/phoneScheme'

Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: fakeMatchMedia,
})

setupIonicReact({ mode: 'ios' })

beforeEach(() => {
  resetPhoneScheme()
  localStorage.clear()
  saveSeenVersion(__APP_VERSION__)
})

afterEach(() => {
  cleanup()
})
