import type { ChoiceKind } from '../domain/types'

export const COMMON_COPY = {
  calendar: 'לוח שנה',
  friends: 'חברים',
  newMeetup: 'מפגש חדש',
  settings: 'הגדרות',
  cancel: 'ביטול',
  close: 'סגירה',
  ok: 'אישור',
  save: 'שמירה',
  delete: 'מחיקה',
  rename: 'שינוי שם',
  name: 'שם',
  nameTaken: (name: string) => `כבר יש חבר בשם ${name}`,
  choiceTaken: {
    place: (name: string) => `כבר יש מקום בשם „${name}”`,
    activity: (name: string) => `כבר יש פעילות בשם „${name}”`,
  } satisfies Record<ChoiceKind, (name: string) => string>,
  choiceRemoved: {
    place: (name: string) => `המקום „${name}” הוסר מהמקומות השמורים`,
    activity: (name: string) => `הפעילות „${name}” הוסרה מהפעילויות השמורות`,
  } satisfies Record<ChoiceKind, (name: string) => string>,
  exportBackup: 'ייצוא גיבוי',
  importBackup: 'ייבוא גיבוי',
  importWarning: 'הייבוא יחליף את כל הנתונים',
  confirmImport: 'ייבוא',
  backupFile: 'קובץ גיבוי',
  actionFailed: 'הפעולה נכשלה',
  saveFailed: 'לא נשמר. אפשר לנסות שוב.',
  badRecordsInBackup: (count: number) =>
    count === 1 ? 'בגיבוי יש רשומה פגומה אחת, וייבוא הקובץ ייכשל' : `בגיבוי יש ${count} רשומות פגומות, וייבוא הקובץ ייכשל`,
  noBackupYet: 'עדיין לא נעשה גיבוי',
  backupDaysAgo: (days: number) => `הגיבוי האחרון לפני ${days} ימים`,
  previous: 'הקודם',
  next: 'הבא',
} as const
