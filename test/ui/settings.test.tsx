import { fireEvent, screen, waitFor, within } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { db } from '../../src/data/db'
import { chooseBackupFile, chooseUnreadableBackupFile } from '../helpers/backupFile'
import { freezeDate } from '../helpers/clock'
import { resetDb } from '../helpers/db'
import { ionChange, ionField, ionInput } from '../helpers/ionic'
import { aGroup, aMeetup, aPerson } from '../helpers/meetups'
import { toasts } from '../helpers/overlays'
import { renderAt } from '../helpers/renderAt'

const SETTINGS = '/tabs/calendar/settings'

const noam = aPerson({ id: 'noam', name: 'נועם' })

const army = aGroup({ id: 'army', memberIds: ['noam'] })

const walk = aMeetup({ id: 'walk', personIds: ['noam'], activities: ['הליכה'], initiator: 'me' })

function hiddenRow(name: string): HTMLElement {
  const row = screen.getByText(name).closest('ion-item')

  if (!(row instanceof HTMLElement)) {
    throw new Error(`no row for ${name}`)
  }

  return row
}

async function readJson(file: Blob | undefined) {
  if (!file) {
    throw new Error('no file')
  }

  return JSON.parse(await file.text())
}

async function storeSample() {
  await db.people.put(noam)
  await db.groups.put(army)
  await db.meetups.put(walk)
}

const storedData = async () => ({
  people: await db.people.toArray(),
  groups: await db.groups.toArray(),
  meetups: await db.meetups.toArray(),
})

describe('settings', () => {
  beforeEach(resetDb)
  freezeDate(new Date(2026, 10, 8, 9, 30).getTime())

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('exports a backup with people, groups and meetups through the share sheet', async () => {
    await storeSample()

    const share = vi.fn<(data: ShareData) => Promise<void>>().mockResolvedValue()

    Object.assign(navigator, { share, canShare: () => true })
    renderAt(SETTINGS)

    fireEvent.click(await screen.findByText('ייצוא גיבוי'))

    await waitFor(() => expect(share).toHaveBeenCalledOnce())

    const files = share.mock.calls[0][0].files

    expect(files?.[0].name).toMatch(/-backup-2026-11-08\.json$/)
    expect(await readJson(files?.[0])).toEqual({
      version: 1,
      exportedAt: new Date(2026, 10, 8, 9, 30).getTime(),
      people: [noam],
      groups: [army],
      meetups: [walk],
    })
  })

  it('says there was no backup yet, and that the data stays on this phone', async () => {
    renderAt(SETTINGS)

    expect(await screen.findByText('עדיין לא נעשה גיבוי')).toBeInTheDocument()
    expect(screen.getByText(/הנתונים נשמרים רק במכשיר הזה/)).toBeInTheDocument()
  })

  it('shows the running version and when it was last updated', async () => {
    renderAt(SETTINGS)

    expect(await screen.findByText(/^גרסה \d+\.\d+\.\d+ · עודכנה \d{1,2}\.\d{1,2}\.\d{4} \d{2}:\d{2}$/)).toBeVisible()
  })

  it('opens a GitHub bug report on social-log with the text and device details', async () => {
    const openWindow = vi.spyOn(window, 'open').mockReturnValue(null)

    renderAt(SETTINGS)
    fireEvent.click(await screen.findByText('דיווח על באג / הצעה'))
    ionInput(await ionField('תיאור'), 'המפגש לא נשמר\nבחרתי שלושה חברים')
    fireEvent.click(await screen.findByText('פתיחה ב-GitHub'))

    expect(openWindow).toHaveBeenCalledOnce()

    const [url, target, features] = openWindow.mock.calls[0]
    const { origin, pathname, searchParams } = new URL(String(url))

    expect(target).toBe('_blank')
    expect(features).toBe('noopener')
    expect(`${origin}${pathname}`).toBe('https://github.com/Shalom-Borohov/social-log/issues/new')
    expect(searchParams.get('title')).toBe('המפגש לא נשמר')
    expect(searchParams.get('labels')).toBe('bug')
    expect(searchParams.get('body')).toBe(
      `המפגש לא נשמר\nבחרתי שלושה חברים\n\n### מכשיר\n${navigator.userAgent}\nגרסה: ${__APP_VERSION__} (${__APP_BUILT_AT__})`,
    )
  })

  it('opens a suggestion with a shortened title, only once there is text', async () => {
    const openWindow = vi.spyOn(window, 'open').mockReturnValue(null)
    const idea = 'כדאי להוסיף אפשרות לסמן מפגש כמתוכנן מראש, כדי לראות בלוח השנה גם את המפגשים שעוד לא קרו בשבוע הקרוב'

    renderAt(SETTINGS)
    fireEvent.click(await screen.findByText('דיווח על באג / הצעה'))
    ionChange(await screen.findByText('הצעה', { selector: 'ion-segment-button ion-label' }), 'idea')

    expect((await screen.findByText('פתיחה ב-GitHub')).closest('ion-button')).toHaveProperty('disabled', true)

    ionInput(await ionField('תיאור'), idea)
    fireEvent.click(screen.getByText('פתיחה ב-GitHub'))

    const { searchParams } = new URL(String(openWindow.mock.calls[0][0]))

    expect(searchParams.get('labels')).toBe('feature')
    expect(searchParams.get('title')).toBe(`${idea.slice(0, 79)}…`)
  })

  it('rejects an invalid backup file and keeps the data', async () => {
    await storeSample()
    renderAt(SETTINGS)
    await screen.findByText('ייבוא גיבוי')

    chooseBackupFile('{"version":1}')

    await waitFor(() => expect(toasts()).toContain('קובץ הגיבוי לא תקין'))
    expect(await storedData()).toEqual({ people: [noam], groups: [army], meetups: [walk] })
  })

  it('never shows the browser message when a backup file cannot be read', async () => {
    await storeSample()
    renderAt(SETTINGS)
    await screen.findByText('ייבוא גיבוי')

    chooseUnreadableBackupFile('The requested file could not be read')

    await waitFor(() => expect(toasts()).toEqual(['הפעולה נכשלה']))
    expect(await storedData()).toEqual({ people: [noam], groups: [army], meetups: [walk] })
  })
})

describe('hidden from Orbit', () => {
  beforeEach(resetDb)

  it('lists the hidden people and shows one again in Orbit', async () => {
    await db.people.bulkPut([
      noam,
      aPerson({ id: 'dana', name: 'דנה', hidden: true }),
      aPerson({ id: 'itay', name: 'איתי', hidden: true }),
    ])
    renderAt(SETTINGS)

    expect(await screen.findByText('מוסתרים מהמסלול')).toBeInTheDocument()
    expect(screen.getByText('דנה')).toBeInTheDocument()
    expect(screen.getByText('איתי')).toBeInTheDocument()
    expect(screen.queryByText('נועם')).not.toBeInTheDocument()

    fireEvent.click(within(hiddenRow('דנה')).getByText('הצגה'))

    await waitFor(async () => expect((await db.people.get('dana'))?.hidden).toBe(false))
    await waitFor(() => expect(screen.queryByText('דנה')).not.toBeInTheDocument())
    expect(screen.getByText('איתי')).toBeInTheDocument()
  })

  it('is left out when nobody is hidden', async () => {
    await db.people.put(noam)
    renderAt(SETTINGS)
    await screen.findByText('ייבוא גיבוי')

    expect(screen.queryByText('מוסתרים מהמסלול')).not.toBeInTheDocument()
  })
})
