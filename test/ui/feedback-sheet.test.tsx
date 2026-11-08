import { fireEvent, screen, waitFor, within } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { resetDb } from '../helpers/db'
import { ionField, ionInput } from '../helpers/ionic'
import { renderAt } from '../helpers/renderAt'

const REPORT = 'המפגש לא נשמר'
const OPENED_NOTE = 'אם GitHub לא נפתח, אפשר ללחוץ שוב או להעתיק את הטקסט.'
const TOO_LONG_NOTE = 'הדיווח ארוך מדי לקישור. ב-GitHub תופיע רק ההתחלה, ואת השאר אפשר להעתיק מכאן ולהדביק שם.'

const descriptionField = () => screen.findByLabelText('תיאור')

const expectSheetClosed = () => expect(screen.queryByLabelText('תיאור')).not.toBeInTheDocument()

const sheetCloses = () => waitFor(expectSheetClosed)

const sheetStaysOpen = () => expect(waitFor(expectSheetClosed, { timeout: 400 })).rejects.toThrow()

async function typeReport(report: string) {
  renderAt('/tabs/calendar/settings')
  fireEvent.click(await screen.findByText('דיווח על באג / הצעה'))
  ionInput(await ionField('תיאור'), report)
}

const tapOpenInGitHub = async () => fireEvent.click(await screen.findByText('פתיחה ב-GitHub'))

async function sheetStatus() {
  const sheet = (await descriptionField()).closest('ion-modal')

  if (!sheet) {
    throw new Error('no report sheet')
  }

  return within(sheet).getByRole('status')
}

describe('the report sheet', () => {
  beforeEach(resetDb)

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it.each([
    { outcome: 'is blocked', opened: null },
    { outcome: 'opens', opened: window },
  ])('keeps the sheet and the text when GitHub $outcome', async ({ opened }) => {
    vi.spyOn(window, 'open').mockReturnValue(opened)

    await typeReport(REPORT)
    await tapOpenInGitHub()

    await sheetStaysOpen()
    expect(await descriptionField()).toHaveValue(REPORT)
  })

  it('offers ביטול before the tap, and סגירה with a note in the waiting status region after it', async () => {
    vi.spyOn(window, 'open').mockReturnValue(null)

    await typeReport(REPORT)

    expect(await screen.findByText('ביטול')).toBeInTheDocument()
    expect(screen.queryByText('סגירה')).not.toBeInTheDocument()
    expect(await sheetStatus()).toBeEmptyDOMElement()

    await tapOpenInGitHub()

    expect(await screen.findByText('סגירה')).toBeInTheDocument()
    expect(screen.queryByText('ביטול')).not.toBeInTheDocument()
    expect(await sheetStatus()).toHaveTextContent(OPENED_NOTE)
  })

  it('says a long report will be cut before the tap, and stops saying so once it fits', async () => {
    await typeReport('כתבתי דיווח ארוך מאוד '.repeat(150))

    expect(await sheetStatus()).toHaveTextContent(TOO_LONG_NOTE)

    ionInput(await ionField('תיאור'), REPORT)

    await waitFor(async () => expect(await sheetStatus()).toBeEmptyDOMElement())
  })

  it('opens GitHub again on a second tap', async () => {
    const openWindow = vi.spyOn(window, 'open').mockReturnValue(null)

    await typeReport(REPORT)
    await tapOpenInGitHub()
    await tapOpenInGitHub()

    expect(openWindow).toHaveBeenCalledTimes(2)
  })

  it('closes on סגירה and starts empty when reopened', async () => {
    vi.spyOn(window, 'open').mockReturnValue(null)

    await typeReport(REPORT)
    await tapOpenInGitHub()
    fireEvent.click(await screen.findByText('סגירה'))
    await sheetCloses()

    fireEvent.click(await screen.findByText('דיווח על באג / הצעה'))

    expect(await descriptionField()).toHaveValue('')
    expect(await screen.findByText('ביטול')).toBeInTheDocument()
  })
})
