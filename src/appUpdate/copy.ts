export const APP_UPDATE_COPY = {
  newVersionReady: 'גרסה חדשה זמינה',
  update: 'עדכון',
  dismissUpdate: 'לא עכשיו',
  whatsNew: 'מה חדש',
  features: 'חדש',
  fixes: 'תיקונים',
  releaseTitle: (version: string) => `גרסה ${version}`,
} as const
