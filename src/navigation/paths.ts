const TABS_PATH = '/tabs'

export type Tab = 'calendar' | 'friends'

export const tabPath = (tab: Tab) => `${TABS_PATH}/${tab}`

export const CALENDAR_PATH = tabPath('calendar')

export const FRIENDS_PATH = tabPath('friends')

export const SETTINGS_PATH = `${CALENDAR_PATH}/settings`

export const SETTINGS_FRIENDS_PATH = `${SETTINGS_PATH}/friends`

export const ALL_FRIENDS_PATH = `${FRIENDS_PATH}/all`

export const personPath = (personId: string) => `${FRIENDS_PATH}/person/${personId}`

export const NEW_MEETUP_PATH = '/log'

export const MEETUP_DATE_PARAM = 'date'

export const newMeetupOnDayPath = (date: string) =>
  `${NEW_MEETUP_PATH}?${new URLSearchParams({ [MEETUP_DATE_PARAM]: date })}`

export const editMeetupPath = (meetupId: string) => `${NEW_MEETUP_PATH}/${meetupId}`
