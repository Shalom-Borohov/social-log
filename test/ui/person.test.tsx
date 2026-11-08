import { fireEvent, screen, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'
import { db } from '../../src/data/db'
import { freezeDate } from '../helpers/clock'
import { resetDb } from '../helpers/db'
import { store, TODAY_AT_TEN } from '../helpers/friends'
import { expectInOrder, ionElement, ionEvent } from '../helpers/ionic'
import { aMeetup, aPerson } from '../helpers/meetups'
import { alertShown, clickAlertButton, toasts, typeInAlert } from '../helpers/overlays'
import { currentPath, renderAt } from '../helpers/renderAt'

const TAMAR_PAGE = '/tabs/friends/person/tamar'

const tamar = aPerson({ id: 'tamar', name: 'תמר' })

const noam = aPerson({ id: 'noam', name: 'נועם' })

const latest = aMeetup({
  id: 'latest',
  date: '2026-10-20',
  personIds: ['tamar', 'noam'],
  place: 'בטיילת',
  rating: 4,
  initiator: 'me',
})

const middle = aMeetup({
  id: 'middle',
  date: '2026-10-10',
  personIds: ['tamar'],
  place: 'בבית',
  rating: 1,
  initiator: 'them',
})

const earliest = aMeetup({ id: 'earliest', date: '2026-09-30', personIds: ['tamar'], place: 'בקפה', rating: 3 })

const noamAlone = aMeetup({ id: 'noam-alone', date: '2026-11-01', personIds: ['noam'], place: 'בים' })

const rowOf = (label: string) => screen.getByText(label).closest('ion-item')

describe('a person’s page', () => {
  beforeEach(async () => {
    await resetDb()
    await store({ people: [tamar, noam], meetups: [latest, middle, earliest, noamAlone] })
  })

  freezeDate(TODAY_AT_TEN)

  it('is titled with their name and goes back to the friends tab', async () => {
    renderAt(TAMAR_PAGE)

    await waitFor(async () => expect(await ionElement('ion-title')).toHaveTextContent('תמר'))
    expect(await ionElement('ion-back-button')).toHaveAttribute('text', 'חברים')
  })

  it('sums up how often you meet', async () => {
    renderAt(TAMAR_PAGE)

    expect(await screen.findByText('בדרך כלל כל 10 ימים')).toBeInTheDocument()
    expect(rowOf('מספר מפגשים')).toHaveTextContent('3')
    expect(rowOf('פעם אחרונה')).toHaveTextContent('יום שלישי 20.10')
    expect(screen.getByText('יזמת 1 מתוך 2')).toBeInTheDocument()
  })

  it('words a long usual gap in weeks or months', async () => {
    await resetDb()
    await store({
      people: [tamar],
      meetups: ['2026-05-01', '2026-07-01', '2026-09-01'].map((date) => aMeetup({ id: date, date, personIds: ['tamar'] })),
    })
    renderAt(TAMAR_PAGE)

    expect(await screen.findByText('בדרך כלל כל חודשיים')).toBeInTheDocument()
  })

  it('says when there are too few meetups for a usual gap, and leaves out who initiated when unknown', async () => {
    await store({ people: [aPerson({ id: 'ori', name: 'אורי' })], meetups: [aMeetup({ personIds: ['ori'] })] })
    renderAt('/tabs/friends/person/ori')

    expect(await screen.findByText('עוד אין מספיק מפגשים')).toBeInTheDocument()
    expect(screen.queryByText(/^יזמת/)).not.toBeInTheDocument()
  })

  it('lists the meetups with them, newest first, with who came, where and how it was', async () => {
    renderAt(TAMAR_PAGE)

    await expectInOrder(['תמר ונועם · בטיילת', 'תמר · בבית', 'תמר · בקפה'])
    expect(rowOf('תמר ונועם · בטיילת')).toHaveTextContent('מעולה')
    expect(rowOf('תמר · בבית')).toHaveTextContent('לא משהו')
    expect(rowOf('תמר · בבית')).toHaveTextContent('שבת 10.10')
    expect(screen.queryByText(/בים/)).not.toBeInTheDocument()
  })

  it('opens a meetup for editing', async () => {
    renderAt(TAMAR_PAGE)

    fireEvent.click(await screen.findByText('תמר · בבית'))

    await waitFor(() => expect(currentPath()).toBe('/log/middle'))
  })

  it('renames them', async () => {
    renderAt(TAMAR_PAGE)

    const shown = alertShown()

    fireEvent.click(await screen.findByText('שינוי שם'))
    await shown
    typeInAlert('תמר כהן')
    clickAlertButton('שמירה')

    await waitFor(async () => expect((await db.people.get('tamar'))?.name).toBe('תמר כהן'))
  })

  it('says so and keeps the name when it belongs to someone else', async () => {
    renderAt(TAMAR_PAGE)

    const shown = alertShown()

    fireEvent.click(await screen.findByText('שינוי שם'))
    await shown
    typeInAlert('נועם')
    clickAlertButton('שמירה')

    await waitFor(() => expect(toasts()).toContain('כבר יש חבר בשם נועם'))
    expect((await db.people.get('tamar'))?.name).toBe('תמר')
  })

  it('comes back to their page when the opened meetup is closed', async () => {
    renderAt(TAMAR_PAGE)

    fireEvent.click(await screen.findByText('תמר · בבית'))
    await waitFor(() => expect(currentPath()).toBe('/log/middle'))
    fireEvent.click(await screen.findByRole('button', { name: 'סגירה' }))

    await waitFor(() => expect(currentPath()).toBe(TAMAR_PAGE))
  })

  it('hides them from the orbit and shows them again', async () => {
    renderAt(TAMAR_PAGE)

    const toggle = await ionElement('ion-toggle')

    expect(toggle).toHaveTextContent('הצגה במסלול')
    expect(toggle).toHaveProperty('checked', true)

    ionEvent(toggle, 'ionChange', { checked: false })
    await waitFor(async () => expect((await db.people.get('tamar'))?.hidden).toBe(true))

    ionEvent(toggle, 'ionChange', { checked: true })
    await waitFor(async () => expect((await db.people.get('tamar'))?.hidden).toBe(false))
  })

  it('says quietly when the person is not found', async () => {
    renderAt('/tabs/friends/person/nobody')

    expect(await screen.findByText('החבר הזה לא נמצא')).toBeInTheDocument()
  })
})
