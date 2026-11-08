import { screen, waitFor } from '@testing-library/react'
import { expect } from 'vitest'
import { db } from '../../src/data/db'
import type { Group, Meetup, Person } from '../../src/domain/types'
import { visibleAll } from './ionic'
import { renderAt } from './renderAt'

const FIRST_LOAD_TIMEOUT_MS = 4000

const DAYS_SHOWN = 35

interface Stored {
  meetups?: Meetup[]
  people?: Person[]
  groups?: Group[]
}

export async function store({ meetups = [], people = [], groups = [] }: Stored) {
  await Promise.all([db.meetups.bulkPut(meetups), db.people.bulkPut(people), db.groups.bulkPut(groups)])
}

const LABEL_SEPARATOR = ', '

export const dayButton = (dayLabel: string) =>
  screen.findByRole('button', { name: (name) => name.split(LABEL_SEPARATOR)[0] === dayLabel })

export const dayButtons = () => visibleAll('.calendar-day')

export async function openCalendar() {
  renderAt('/tabs/calendar')
  await waitFor(() => expect(dayButtons()).toHaveLength(DAYS_SHOWN), { timeout: FIRST_LOAD_TIMEOUT_MS })
}

export const selectedDays =() => visibleAll('.calendar-day[aria-pressed="true"]')

export const expectTitle = (title: string) =>
  waitFor(() => expect(visibleAll('ion-title').map((element) => element.textContent)).toContain(title))

export async function statTile(label: string) {
  const tileLabel = await screen.findByText(label, { selector: '.calendar-stat-label' })

  return tileLabel.closest('.calendar-stat')?.querySelector('.calendar-stat-value')?.textContent
}
