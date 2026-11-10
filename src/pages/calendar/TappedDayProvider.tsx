import { type ReactNode, useState } from 'react'
import { useToday } from '../../hooks/useToday'
import { TappedDayContext } from './useTappedDay'

interface Tap {
  day: string
  onDay: string
}

export function TappedDayProvider({ children }: { children: ReactNode }) {
  const today = useToday()
  const [tap, setTap] = useState<Tap | null>(null)

  const value = {
    tappedDay: tap?.onDay === today ? tap.day : null,
    tapDay: (day: string) => setTap({ day, onDay: today }),
    forgetTappedDay: () => setTap(null),
  }

  return <TappedDayContext.Provider value={value}>{children}</TappedDayContext.Provider>
}
