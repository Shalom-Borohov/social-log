import { cleanup, fireEvent, screen, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { saveSeenVersion } from '../../src/appUpdate/seenVersion'
import { resetDb } from '../helpers/db'
import { expectInOrder } from '../helpers/ionic'
import { renderAt } from '../helpers/renderAt'

vi.mock('../../src/appUpdate/changelog', () => ({
  CHANGELOG: [
    { version: '0.1.0', features: ['הכי ישן'], fixes: [] },
    { version: __APP_VERSION__, features: ['פס עדכון'], fixes: ['כותרת חדה'] },
    { version: '0.2.0', features: ['ישן'], fixes: [] },
  ],
}))

const OLDEST_SEEN = '0.1.0'
const SEEN_VERSION_KEY = 'social-log:seen-version'
const SIBLING_SEEN_VERSION_KEY = 'seen-version'

const closeButton = () => screen.findByText('סגירה')

beforeEach(async () => {
  await resetDb()
})

describe('what’s new after an update', () => {
  it('lists the releases since the last one seen, newest first', async () => {
    saveSeenVersion(OLDEST_SEEN)
    renderAt('/tabs/calendar')

    expect(await screen.findByText('מה חדש')).toBeInTheDocument()
    expect(screen.getByText('פס עדכון')).toBeInTheDocument()
    expect(screen.getByText('כותרת חדה')).toBeInTheDocument()
    expect(screen.getByText('ישן')).toBeInTheDocument()
    expect(screen.queryByText('הכי ישן')).not.toBeInTheDocument()
    await expectInOrder([`גרסה ${__APP_VERSION__}`, 'גרסה 0.2.0'])
  })

  it('shows only once', async () => {
    saveSeenVersion(OLDEST_SEEN)
    renderAt('/tabs/calendar')

    fireEvent.click(await closeButton())
    await waitFor(() => expect(screen.queryByText('פס עדכון')).not.toBeInTheDocument())

    cleanup()
    renderAt('/tabs/calendar')

    expect(await screen.findAllByText('לוח שנה')).not.toHaveLength(0)
    expect(screen.queryByText('מה חדש')).not.toBeInTheDocument()
  })

  it('shows only the running release when no version was seen before', async () => {
    localStorage.clear()
    renderAt('/tabs/calendar')

    expect(await screen.findByText(`גרסה ${__APP_VERSION__}`)).toBeInTheDocument()
    expect(screen.queryByText('גרסה 0.2.0')).not.toBeInTheDocument()
  })

  it('opens every release from the version line in הגדרות', async () => {
    renderAt('/tabs/calendar/settings')

    fireEvent.click(await screen.findByText(new RegExp(`^גרסה ${__APP_VERSION__} · עודכנה`)))

    expect(await screen.findByText('מה חדש')).toBeInTheDocument()
    expect(screen.getByText('הכי ישן')).toBeInTheDocument()
    expect(screen.getByText('ישן')).toBeInTheDocument()
    expect(screen.getByText('פס עדכון')).toBeInTheDocument()
  })
})

describe('a sibling app on the same origin', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('ignores the version a sibling app saved as seen', async () => {
    localStorage.setItem(SIBLING_SEEN_VERSION_KEY, __APP_VERSION__)
    renderAt('/tabs/calendar')

    expect(await screen.findByText(`גרסה ${__APP_VERSION__}`)).toBeInTheDocument()
  })

  it('stores what it saw under its own key', async () => {
    renderAt('/tabs/calendar')

    fireEvent.click(await closeButton())

    await waitFor(() => expect(localStorage.getItem(SEEN_VERSION_KEY)).toBe(__APP_VERSION__))
    expect(localStorage.getItem(SIBLING_SEEN_VERSION_KEY)).toBeNull()
  })
})
