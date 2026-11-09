import { act } from '@testing-library/react'
import { vi } from 'vitest'

export function setVisibility(state: DocumentVisibilityState) {
  vi.spyOn(document, 'visibilityState', 'get').mockReturnValue(state)
  document.dispatchEvent(new Event('visibilitychange'))
}

export async function leaveAndComeBackAt(time: number) {
  await act(async () => {
    setVisibility('hidden')
    vi.setSystemTime(time)
    setVisibility('visible')
  })
}
