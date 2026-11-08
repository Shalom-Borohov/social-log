import { fireEvent, waitFor } from '@testing-library/react'
import { expect } from 'vitest'
import { visibleAll } from './ionic'

const STEPS = 5

const touchAt = (clientX: number) => ({ changedTouches: [{ clientX, clientY: 300 }] })

export async function swipe(widthShare: number, from?: Element) {
  const area = await waitFor(() => {
    const contents = visibleAll('ion-content')
    expect(contents).toHaveLength(1)

    return contents[0]
  })

  const target = from ?? area
  const startX = window.innerWidth / 2
  const distance = window.innerWidth * widthShare

  fireEvent.touchStart(target, touchAt(startX))

  for (let step = 1; step <= STEPS; step++) {
    fireEvent.touchMove(target, touchAt(startX + (distance * step) / STEPS))
  }

  fireEvent.touchEnd(target, touchAt(startX + distance))
}

export const swipeLeft = () => swipe(-0.6)

export const swipeRight = () => swipe(0.6)
