import { fireEvent, screen, waitFor, within } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'
import { dayButton, dayButtons, expectTitle, openCalendar, statTile, store } from '../helpers/calendar'
import { freezeDate } from '../helpers/clock'
import { resetDb } from '../helpers/db'
import { buttonByLabel, visibleAll } from '../helpers/ionic'
import { aMeetup } from '../helpers/meetups'

const THIS_PAGE_TITLE = '5 השבועות האחרונים'

const PREVIOUS_PAGE = '5 השבועות הקודמים'

const NEXT_PAGE = '5 השבועות הבאים'

describe('the calendar', () => {
  beforeEach(resetDb)
  freezeDate(new Date(2026, 10, 5, 10).getTime())

  it('shows the last 5 weeks, Sunday to Saturday, ending this week', async () => {
    await openCalendar()
    await expectTitle(THIS_PAGE_TITLE)

    const days = dayButtons()

    expect(days).toHaveLength(35)
    expect(days[0]).toHaveAccessibleName('יום ראשון 4.10, אין מפגשים')
    expect(days[34]).toHaveAccessibleName('שבת 7.11, אין מפגשים')
    expect(visibleAll('.calendar-weekday').map((letter) => letter.textContent)).toEqual(['א', 'ב', 'ג', 'ד', 'ה', 'ו', 'ש'])
  })

  it('names a logged day by its best rating and how many meetups it had', async () => {
    await store({
      meetups: [
        aMeetup({ date: '2026-11-05', rating: 3 }),
        aMeetup({ date: '2026-11-05', rating: 4 }),
        aMeetup({ date: '2026-11-03', rating: 1 }),
      ],
    })
    await openCalendar()

    expect(await dayButton('יום חמישי 5.11')).toHaveAccessibleName('יום חמישי 5.11, מעולה, 2 מפגשים')
    expect(await dayButton('יום שלישי 3.11')).toHaveAccessibleName('יום שלישי 3.11, לא משהו')
    expect(await dayButton('יום שני 2.11')).toHaveAccessibleName('יום שני 2.11, אין מפגשים')
  })

  it('shows a logged day’s rating as dots and its count when there was more than one', async () => {
    await store({
      meetups: [
        aMeetup({ date: '2026-11-05', rating: 3 }),
        aMeetup({ date: '2026-11-05', rating: 4 }),
        aMeetup({ date: '2026-11-03', rating: 2 }),
      ],
    })
    await openCalendar()

    const busyDay = await dayButton('יום חמישי 5.11')
    const quietDay = await dayButton('יום שלישי 3.11')

    expect(busyDay.querySelectorAll('.rating-dots span')).toHaveLength(4)
    expect(within(busyDay).getByText('2')).toBeInTheDocument()
    expect(quietDay.querySelectorAll('.rating-dots span')).toHaveLength(2)
    expect(quietDay).toHaveTextContent(/^3$/)
  })

  it('keeps the days after today closed', async () => {
    await openCalendar()

    expect(await dayButton('יום שישי 6.11')).toBeDisabled()
    expect(await dayButton('יום חמישי 5.11')).toBeEnabled()
  })

  it('explains the four ratings in words', async () => {
    await openCalendar()

    const legend = await screen.findByRole('list', { name: 'מקרא דירוגים' })

    expect(within(legend).getAllByRole('listitem').map((entry) => entry.textContent)).toEqual([
      'מעולה',
      'טוב',
      'סביר',
      'לא משהו',
    ])
  })

  it('counts meetups, great ones and hours over the weeks shown', async () => {
    await store({
      meetups: [
        aMeetup({ date: '2026-11-05', rating: 4, minutes: 90 }),
        aMeetup({ date: '2026-10-20', rating: 3, minutes: 20 }),
        aMeetup({ date: '2026-10-04', rating: 4, minutes: 60 }),
        aMeetup({ date: '2026-10-03', rating: 4, minutes: 600 }),
      ],
    })
    await openCalendar()

    expect(await statTile('מפגשים')).toBe('3')
    expect(await statTile('מעולים')).toBe('2')
    expect(await statTile('שעות')).toBe('2.8')
  })

  it('pages back 5 weeks at a time and not past this week', async () => {
    await store({ meetups: [aMeetup({ date: '2026-10-03', minutes: 120 })] })
    await openCalendar()
    await expectTitle(THIS_PAGE_TITLE)

    expect(await buttonByLabel(NEXT_PAGE)).toHaveAttribute('disabled')

    fireEvent.click(await buttonByLabel(PREVIOUS_PAGE))

    await expectTitle('30.8–3.10')
    expect(await dayButton('שבת 3.10')).toHaveAccessibleName('שבת 3.10, מעולה')
    await waitFor(async () => expect(await statTile('שעות')).toBe('2'))
    expect(await buttonByLabel(NEXT_PAGE)).not.toHaveAttribute('disabled')

    fireEvent.click(await buttonByLabel(NEXT_PAGE))

    await expectTitle(THIS_PAGE_TITLE)
  })

  it('still shows the grid with a quiet hint before anything is logged', async () => {
    await openCalendar()

    expect(await screen.findByText('עדיין לא נרשמו מפגשים. מפגש חדש נרשם בכפתור +')).toBeInTheDocument()
    expect(dayButtons()).toHaveLength(35)
  })

  it('drops the hint once a meetup is logged', async () => {
    await store({ meetups: [aMeetup({ date: '2026-08-01' })] })
    await openCalendar()

    expect(await statTile('מפגשים')).toBe('0')
    expect(screen.queryByText(/עדיין לא נרשמו מפגשים/)).not.toBeInTheDocument()
  })
})
