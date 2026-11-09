import { fireEvent, screen, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { resetDb } from '../helpers/db'
import { buttonByLabel } from '../helpers/ionic'
import { renderAt } from '../helpers/renderAt'
import { setVisibility } from '../helpers/visibility'

const pwa = vi.hoisted(() => ({ needRefresh: true, updateServiceWorker: vi.fn(async () => {}) }))

vi.mock('virtual:pwa-register/react', () => ({
  useRegisterSW: () => ({
    needRefresh: [pwa.needRefresh, vi.fn()],
    updateServiceWorker: pwa.updateServiceWorker,
  }),
}))

const READY = 'גרסה חדשה זמינה'

beforeEach(async () => {
  await resetDb()
  pwa.needRefresh = true
  pwa.updateServiceWorker.mockClear()
})

describe('a new version of the app', () => {
  it.each(['/tabs/calendar', '/tabs/friends', '/tabs/calendar/settings'])('is offered on %s', async (path) => {
    renderAt(path)

    expect(await screen.findByText(READY)).toBeInTheDocument()
  })

  it('hides the dismiss icon from screen readers', async () => {
    renderAt('/tabs/calendar')

    expect((await buttonByLabel('לא עכשיו')).querySelector('ion-icon')).toHaveAttribute('aria-hidden', 'true')
  })

  it('updates when עדכון is tapped', async () => {
    renderAt('/tabs/calendar')

    fireEvent.click(await screen.findByText('עדכון'))

    expect(pwa.updateServiceWorker).toHaveBeenCalledTimes(1)
  })

  it('can be put off until the app is opened again', async () => {
    renderAt('/tabs/calendar')

    fireEvent.click(await buttonByLabel('לא עכשיו'))
    await waitFor(() => expect(screen.queryByText(READY)).not.toBeInTheDocument())

    setVisibility('visible')

    expect(await screen.findByText(READY)).toBeInTheDocument()
  })

  it('shows nothing while there is no new version', async () => {
    pwa.needRefresh = false
    renderAt('/tabs/calendar')

    expect(await screen.findAllByText('לוח שנה')).not.toHaveLength(0)
    expect(screen.queryByText(READY)).not.toBeInTheDocument()
  })
})
