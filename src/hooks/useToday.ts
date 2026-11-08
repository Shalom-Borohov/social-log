import { useEffect, useState } from 'react'
import { logicalToday } from '../domain/logicalDay'

const REFRESH_INTERVAL_MS = 60_000

export function useToday(): string {
  const [today, setToday] = useState(() => logicalToday(Date.now()))

  useEffect(() => {
    const refresh = () => setToday(logicalToday(Date.now()))
    const timer = setInterval(refresh, REFRESH_INTERVAL_MS)

    document.addEventListener('visibilitychange', refresh)

    return () => {
      clearInterval(timer)
      document.removeEventListener('visibilitychange', refresh)
    }
  }, [])

  return today
}
