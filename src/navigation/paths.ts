import type { PeopleTab } from '../domain/circles'

const TABS_PATH = '/tabs'

export type Tab = 'calendar' | PeopleTab

export const tabPath = (tab: Tab) => `${TABS_PATH}/${tab}`

export const CALENDAR_PATH = tabPath('calendar')

export const FRIENDS_PATH = tabPath('friends')

export const FAMILY_PATH = tabPath('family')

export const SETTINGS_PATH = `${CALENDAR_PATH}/settings`

export const SETTINGS_FRIENDS_PATH = `${SETTINGS_PATH}/friends`

export const SETTINGS_CIRCLES_PATH = `${SETTINGS_PATH}/circles`

export const circleSettingsPath = (circleId: string) => `${SETTINGS_CIRCLES_PATH}/${circleId}`

export const allPeoplePath = (tab: PeopleTab) => `${tabPath(tab)}/all`

export const personPath = (tab: PeopleTab, personId: string) => `${tabPath(tab)}/person/${personId}`

export const NEW_MEETUP_PATH = '/log'

export const MEETUP_DATE_PARAM = 'date'

export const newMeetupOnDayPath = (date: string) =>
  `${NEW_MEETUP_PATH}?${new URLSearchParams({ [MEETUP_DATE_PARAM]: date })}`

export const editMeetupPath = (meetupId: string) => `${NEW_MEETUP_PATH}/${meetupId}`
