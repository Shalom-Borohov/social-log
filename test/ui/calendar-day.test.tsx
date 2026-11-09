import { fireEvent, screen, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'
import { dayButton, openCalendar, selectedDays, store } from '../helpers/calendar'
import { freezeDate } from '../helpers/clock'
import { resetDb } from '../helpers/db'
import { buttonByLabel } from '../helpers/ionic'
import { aGroup, aMeetup, aPerson } from '../helpers/meetups'
import { currentPath } from '../helpers/renderAt'

const NOAM = aPerson({ id: 'noam', name: 'נועם' })

const DANIEL = aPerson({ id: 'daniel', name: 'דניאל' })

const TAMAR = aPerson({ id: 'tamar', name: 'תמר' })

const people = [NOAM, DANIEL, TAMAR]

const EMPTY_DAY_NOTE = 'אין מפגשים ביום הזה'

describe('a day on the calendar', () => {
  beforeEach(resetDb)
  freezeDate(new Date(2026, 10, 5, 10).getTime())

  it('opens on today when today has meetups, newest first', async () => {
    await store({
      people,
      meetups: [
        aMeetup({ date: '2026-11-05', personIds: ['noam', 'daniel'], place: 'בפלורנטין', minutes: 150, rating: 4, createdAt: 1 }),
        aMeetup({ date: '2026-11-05', personIds: ['tamar'], place: 'בטיילת', minutes: 30, rating: 2, createdAt: 2 }),
        aMeetup({ date: '2026-11-03', personIds: ['tamar'], place: 'בקפה', minutes: 60, rating: 3 }),
      ],
    })
    await openCalendar()

    expect(await dayButton('יום חמישי 5.11')).toHaveAttribute('aria-pressed', 'true')
    expect(await screen.findByText('נועם ודניאל')).toBeInTheDocument()
    expect(screen.getByText('בפלורנטין · שעתיים וחצי')).toBeInTheDocument()
    expect(screen.getByText('תמר')).toBeInTheDocument()
    expect(screen.getByText('בטיילת · חצי שעה')).toBeInTheDocument()
    expect(screen.getByText('מעולה', { selector: '.rating-tag' })).toBeInTheDocument()
    expect(screen.getByText('סביר', { selector: '.rating-tag' })).toBeInTheDocument()
    expect(screen.queryByText('בקפה · שעה')).not.toBeInTheDocument()
    expect(screen.getByText('תמר').compareDocumentPosition(screen.getByText('נועם ודניאל'))).toBe(
      Node.DOCUMENT_POSITION_FOLLOWING,
    )
  })

  it('opens on the latest day with meetups when today has none', async () => {
    await store({
      people,
      meetups: [
        aMeetup({ date: '2026-11-03', personIds: ['tamar'], place: 'בקפה', minutes: 60 }),
        aMeetup({ date: '2026-10-20', personIds: ['noam'], place: 'בים', minutes: 60 }),
      ],
    })
    await openCalendar()

    expect(await dayButton('יום שלישי 3.11')).toHaveAttribute('aria-pressed', 'true')
    expect(await screen.findByText('בקפה · שעה')).toBeInTheDocument()
    expect(selectedDays()).toHaveLength(1)
  })

  it('selects no day when the weeks shown have no meetups', async () => {
    await store({ people, meetups: [aMeetup({ date: '2026-08-01' })] })
    await openCalendar()

    expect(selectedDays()).toHaveLength(0)
    expect(screen.queryByText(EMPTY_DAY_NOTE)).not.toBeInTheDocument()
  })

  it('lists the meetups of a tapped day', async () => {
    await store({
      people,
      meetups: [
        aMeetup({ date: '2026-11-05', personIds: ['noam'], place: 'בפלורנטין' }),
        aMeetup({ date: '2026-10-20', personIds: ['tamar'], place: 'בים', minutes: 240, rating: 1 }),
      ],
    })
    await openCalendar()

    fireEvent.click(await dayButton('יום שלישי 20.10'))

    expect(await screen.findByText('בים · 4 שעות')).toBeInTheDocument()
    expect(screen.getByText('לא משהו', { selector: '.rating-tag' })).toBeInTheDocument()
    expect(screen.queryByText(/בפלורנטין/)).not.toBeInTheDocument()
    expect(await dayButton('יום שלישי 20.10')).toHaveAttribute('aria-pressed', 'true')
    expect(selectedDays()).toHaveLength(1)
  })

  it('says so quietly when the tapped day has no meetups', async () => {
    await store({ people, meetups: [aMeetup({ date: '2026-11-05', personIds: ['noam'], place: 'בפלורנטין' })] })
    await openCalendar()

    fireEvent.click(await dayButton('יום שני 2.11'))

    expect(await screen.findByText(EMPTY_DAY_NOTE)).toBeInTheDocument()
    expect(screen.queryByText(/בפלורנטין/)).not.toBeInTheDocument()
  })

  it('names a whole group by the group’s name', async () => {
    const army = aGroup({ id: 'army', name: 'החבר׳ה מהצבא', memberIds: ['noam', 'daniel'] })

    await store({
      people,
      groups: [army],
      meetups: [aMeetup({ date: '2026-11-05', personIds: ['noam', 'daniel'], groupId: 'army' })],
    })
    await openCalendar()

    expect(await screen.findByText('החבר׳ה מהצבא')).toBeInTheDocument()
  })

  it('opens a meetup for editing when its row is tapped', async () => {
    await store({ people, meetups: [aMeetup({ id: 'dinner', date: '2026-11-05', personIds: ['noam'], place: 'בפלורנטין' })] })
    await openCalendar()

    fireEvent.click(await screen.findByText('בפלורנטין · שעה וחצי'))

    await waitFor(() => expect(currentPath()).toBe('/log/dinner'))
  })

  it('selects the latest logged day of an older page', async () => {
    await store({
      people,
      meetups: [
        aMeetup({ date: '2026-11-05', personIds: ['noam'], place: 'בפלורנטין' }),
        aMeetup({ date: '2026-09-15', personIds: ['tamar'], place: 'ביפו' }),
      ],
    })
    await openCalendar()
    await screen.findByText('בפלורנטין · שעה וחצי')

    fireEvent.click(await buttonByLabel('5 השבועות הקודמים'))

    expect(await screen.findByText('ביפו · שעה וחצי')).toBeInTheDocument()
    expect(await dayButton('יום שלישי 15.9')).toHaveAttribute('aria-pressed', 'true')
  })
})
