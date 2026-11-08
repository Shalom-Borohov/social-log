import { render, screen } from '@testing-library/react'
import { afterEach, beforeEach, vi } from 'vitest'
import { App } from '../../src/App'
import { db } from '../../src/data/db'
import type { Meetup } from '../../src/domain/types'
import { resetDb } from './db'

export const missingPeople = JSON.parse('{"id":"broken","date":"2026-11-02","place":"","minutes":60,"rating":3,"createdAt":0}')

export function prepareRecoveryScreen() {
  beforeEach(async () => {
    await resetDb()
    vi.spyOn(console, 'error').mockImplementation(() => {})
  })

  afterEach(() => {
    vi.restoreAllMocks()
    window.location.hash = ''
  })
}

export async function openRecoveryScreen(soundMeetups: Meetup[] = []) {
  await db.meetups.bulkPut([...soundMeetups, missingPeople])
  window.location.hash = '#/tabs/friends'
  render(<App />)

  return screen.findByRole('heading', { name: 'משהו השתבש' })
}
