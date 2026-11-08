import { createAnimation, createGesture, useIonViewWillEnter } from '@ionic/react'
import { useEffect, useEffectEvent, useLayoutEffect, useRef } from 'react'

const COMMIT_SHARE = 1 / 3
const FLICK_VELOCITY = 0.3
const RESISTANCE = 0.2
const SLIDE_MS = 180

let pendingEntry: number | null = null

const reducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches

const startsInField = (event: UIEvent | undefined) => event?.target instanceof Element && event.target.closest('ion-input') !== null

const translate = (x: number) => (x === 0 ? '' : `translateX(${x}px)`)

async function slide(pane: HTMLElement, from: number, to: number) {
  const animation = createAnimation()
    .addElement(pane)
    .duration(reducedMotion() ? 0 : SLIDE_MS)
    .easing('ease-out')
    .fromTo('transform', `translateX(${from}px)`, `translateX(${to}px)`)

  await animation.play()
  pane.style.transform = translate(to)
  animation.destroy()
}

interface PeriodSwipe {
  onPrevious: () => void
  onNext: () => void
  nextDisabled: boolean
  periodKey: string
}

export function usePeriodSwipe({ onPrevious, onNext, nextDisabled, periodKey }: PeriodSwipe) {
  const areaRef = useRef<HTMLIonContentElement>(null)
  const paneRef = useRef<HTMLDivElement>(null)
  const sliding = useRef(false)

  const offset = (deltaX: number) => (deltaX > 0 && nextDisabled ? deltaX * RESISTANCE : deltaX)

  const move = useEffectEvent((deltaX: number) => {
    if (paneRef.current) {
      paneRef.current.style.transform = translate(offset(deltaX))
    }
  })

  const release = useEffectEvent(async (deltaX: number, velocityX: number) => {
    const pane = paneRef.current

    if (!pane) {
      return
    }

    const side = deltaX < 0 ? -1 : 1
    const far = Math.abs(deltaX) > window.innerWidth * COMMIT_SHARE || velocityX * side > FLICK_VELOCITY
    const commit = far && !(side === 1 && nextDisabled)
    sliding.current = true
    await slide(pane, offset(deltaX), commit ? side * window.innerWidth : 0)
    sliding.current = false

    if (!commit) {
      return
    }

    pendingEntry = -side
    const open = side === -1 ? onPrevious : onNext
    open()
  })

  useEffect(() => {
    const area = areaRef.current

    if (!area) {
      return
    }

    const gesture = createGesture({
      el: area,
      gestureName: 'period-swipe',
      direction: 'x',
      canStart: ({ event }) => !sliding.current && !startsInField(event),
      onMove: (detail) => move(detail.deltaX),
      onEnd: (detail) => void release(detail.deltaX, detail.velocityX),
    })

    gesture.enable()

    return () => gesture.destroy()
  }, [])

  const enter = () => {
    const pane = paneRef.current

    if (!pane || sliding.current) {
      return
    }

    if (pendingEntry === null) {
      pane.style.transform = ''

      return
    }

    const from = pendingEntry * window.innerWidth
    pendingEntry = null
    pane.style.transform = translate(from)
    sliding.current = true
    void slide(pane, from, 0).then(() => {
      sliding.current = false
    })
  }

  useLayoutEffect(enter, [periodKey])
  useIonViewWillEnter(enter)

  return { areaRef, paneRef }
}
