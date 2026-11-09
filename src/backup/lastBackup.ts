import { useSyncExternalStore } from 'react'

const LAST_BACKUP_KEY = 'social-log:last-backup-at'

const listeners = new Set<() => void>()

export function readLastBackup(): number | null {
  const stored = localStorage.getItem(LAST_BACKUP_KEY)

  return stored === null ? null : Number(stored)
}

export function saveLastBackup(timestamp: number) {
  localStorage.setItem(LAST_BACKUP_KEY, String(Math.min(timestamp, Date.now())))
  listeners.forEach((listener) => listener())
}

function subscribe(listener: () => void) {
  listeners.add(listener)

  return () => {
    listeners.delete(listener)
  }
}

export const useLastBackup = () => useSyncExternalStore(subscribe, readLastBackup)
