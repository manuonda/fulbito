import type { Timestamp } from 'firebase/firestore'

export function dayLabel(ts: Timestamp): string {
  return ts.toDate().toLocaleDateString('es-AR', { day: 'numeric', month: 'long' })
}

export function timeLabel(ts: Timestamp): string {
  return ts.toDate().toLocaleTimeString('es-AR', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  })
}

export function isLocked(kickoff: Timestamp, now: number = Date.now()): boolean {
  return now >= kickoff.toMillis()
}

/** Valor para <input type="datetime-local"> en hora local. */
export function toLocalInputValue(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`
}
