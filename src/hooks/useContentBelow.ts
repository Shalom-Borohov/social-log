import { type RefObject, useEffect, useState } from 'react'

const EDGE_PX = 1

function hasContentBelow(area: HTMLElement, pane: HTMLElement) {
  const last = pane.lastElementChild

  return last !== null && last.getBoundingClientRect().bottom - area.getBoundingClientRect().bottom > EDGE_PX
}

export function useContentBelow(
  areaRef: RefObject<HTMLIonContentElement | null>,
  paneRef: RefObject<HTMLElement | null>,
) {
  const [contentBelow, setContentBelow] = useState(false)

  useEffect(() => {
    const area = areaRef.current
    const pane = paneRef.current

    if (!area || !pane) {
      return
    }

    const stopped = new AbortController()

    void area.getScrollElement().then((scroller) => {
      if (stopped.signal.aborted) {
        return
      }

      const check = () => setContentBelow(hasContentBelow(area, pane))
      const resizes = new ResizeObserver(check)
      const rowsAbove = new MutationObserver(check)
      scroller.addEventListener('scroll', check, { passive: true, signal: stopped.signal })
      stopped.signal.addEventListener('abort', () => {
        resizes.disconnect()
        rowsAbove.disconnect()
      })
      resizes.observe(pane)
      resizes.observe(area)
      rowsAbove.observe(area, { childList: true })
      check()
    })

    return () => stopped.abort()
  }, [areaRef, paneRef])

  return contentBelow
}
