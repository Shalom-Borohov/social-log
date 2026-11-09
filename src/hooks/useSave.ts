import { useRef } from 'react'
import { COMMON_COPY } from '../copy/common'
import { TOAST_DURATION_MS, useToast } from './useToast'

export function useSave() {
  const { toast } = useToast()
  const messageShownAt = useRef(0)

  return async function save(write: Promise<void>): Promise<boolean> {
    try {
      await write

      return true
    } catch {
      if (Date.now() - messageShownAt.current >= TOAST_DURATION_MS) {
        messageShownAt.current = Date.now()
        void toast(COMMON_COPY.saveFailed)
      }

      return false
    }
  }
}
