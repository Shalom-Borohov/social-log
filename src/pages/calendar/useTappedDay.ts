import { createContext, useContext } from 'react'
import { useLocation } from 'react-router-dom'
import { CALENDAR_PATH, NEW_MEETUP_PATH, newMeetupOnDayPath } from '../../navigation/paths'

interface TappedDay {
  tappedDay: string | null
  tapDay: (day: string) => void
  forgetTappedDay: () => void
}

export const TappedDayContext = createContext<TappedDay>({
  tappedDay: null,
  tapDay: () => {},
  forgetTappedDay: () => {},
})

export const useTappedDay = () => useContext(TappedDayContext)

export function useNewMeetupPath() {
  const { pathname } = useLocation()
  const { tappedDay } = useTappedDay()

  return pathname === CALENDAR_PATH && tappedDay !== null ? newMeetupOnDayPath(tappedDay) : NEW_MEETUP_PATH
}
