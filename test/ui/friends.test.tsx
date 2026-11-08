import { fireEvent, screen, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'
import { freezeDate } from '../helpers/clock'
import { resetDb } from '../helpers/db'
import { store, TODAY_AT_TEN } from '../helpers/friends'
import { aMeetup, aPerson } from '../helpers/meetups'
import { currentPath, renderAt } from '../helpers/renderAt'

const FRIENDS = '/tabs/friends'

const noam = aPerson({ id: 'noam', name: 'נועם' })

const tamar = aPerson({ id: 'tamar', name: 'תמר' })

const hiddenDana = aPerson({ id: 'dana', name: 'דנה', hidden: true })

const neverMetOri = aPerson({ id: 'ori', name: 'אורי' })

const recentWithNoam = aMeetup({ date: '2026-11-05', personIds: ['noam', 'dana'] })

const tamarEveryMonth = [
  aMeetup({ date: '2026-05-10', personIds: ['tamar'], place: 'בפארק' }),
  aMeetup({ date: '2026-06-09', personIds: ['tamar'], place: 'בבית' }),
  aMeetup({ date: '2026-07-09', personIds: ['tamar'], place: 'בטיילת' }),
]

const storeEveryone = () =>
  store({ people: [noam, tamar, hiddenDana, neverMetOri], meetups: [recentWithNoam, ...tamarEveryMonth] })

describe('the friends orbit', () => {
  beforeEach(resetDb)
  freezeDate(TODAY_AT_TEN)

  it('explains what the distance from the centre means', async () => {
    await storeEveryone()
    renderAt(FRIENDS)

    expect((await screen.findAllByText('מי קרוב אליך עכשיו')).length).toBeGreaterThan(0)
    expect(screen.getByText('ככל שעיגול רחוק יותר, עבר יותר זמן')).toBeInTheDocument()
    expect(await screen.findByText('השבוע')).toBeInTheDocument()
    expect(screen.getByText('החודש')).toBeInTheDocument()
    expect(screen.getByText('מזמן')).toBeInTheDocument()
    expect(screen.getByText('אני')).toBeInTheDocument()
  })

  it('shows everyone met and not hidden, each with how long ago', async () => {
    await storeEveryone()
    renderAt(FRIENDS)

    expect(await screen.findByRole('button', { name: 'נועם, לפני 3 ימים' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'תמר, לפני 4 חודשים' })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /^דנה/ })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /^אורי/ })).not.toBeInTheDocument()
  })

  it('opens a friend’s page from their circle', async () => {
    await storeEveryone()
    renderAt(FRIENDS)

    fireEvent.click(await screen.findByRole('button', { name: 'נועם, לפני 3 ימים' }))

    await waitFor(() => expect(currentPath()).toBe('/tabs/friends/person/noam'))
  })

  it('opens the list of everyone', async () => {
    await storeEveryone()
    renderAt(FRIENDS)

    fireEvent.click(await screen.findByText('כולם'))

    await waitFor(() => expect(currentPath()).toBe('/tabs/friends/all'))
  })

  it('nudges about the friend most overdue against your usual gap, with the last meetup', async () => {
    await storeEveryone()
    renderAt(FRIENDS)

    expect(await screen.findByText('לא ראית את תמר 4 חודשים')).toBeInTheDocument()
    expect(screen.getByText('פעם אחרונה: בטיילת, יום חמישי 9.7')).toBeInTheDocument()
  })

  it('rings the overdue friend’s circle', async () => {
    await storeEveryone()
    renderAt(FRIENDS)

    expect(await screen.findByRole('button', { name: 'תמר, לפני 4 חודשים' })).toHaveClass('orbit-person-overdue')
    expect(screen.getByRole('button', { name: 'נועם, לפני 3 ימים' })).not.toHaveClass('orbit-person-overdue')
  })

  it('opens the overdue friend’s page from the nudge', async () => {
    await storeEveryone()
    renderAt(FRIENDS)

    fireEvent.click(await screen.findByText('לא ראית את תמר 4 חודשים'))

    await waitFor(() => expect(currentPath()).toBe('/tabs/friends/person/tamar'))
  })

  it('shows no nudge and no ring when no one is overdue', async () => {
    await store({ people: [noam], meetups: [recentWithNoam] })
    renderAt(FRIENDS)

    expect(await screen.findByRole('button', { name: 'נועם, לפני 3 ימים' })).not.toHaveClass('orbit-person-overdue')
    expect(screen.queryByText(/^לא ראית את/)).not.toBeInTheDocument()
  })

  it('says today for someone met today', async () => {
    await store({ people: [noam], meetups: [aMeetup({ date: '2026-11-08', personIds: ['noam'] })] })
    renderAt(FRIENDS)

    expect(await screen.findByRole('button', { name: 'נועם, היום' })).toBeInTheDocument()
  })

  it('says where friends will appear before the first meetup', async () => {
    await store({ people: [neverMetOri] })
    renderAt(FRIENDS)

    expect(await screen.findByText('כאן יופיעו החברים אחרי המפגש הראשון')).toBeInTheDocument()
    expect(screen.queryByText('אני')).not.toBeInTheDocument()
  })
})
