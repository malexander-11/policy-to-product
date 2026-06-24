// Date / time / duration formatting helpers (en-GB).

const dateFmt = new Intl.DateTimeFormat('en-GB', {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
})

const dateTimeFmt = new Intl.DateTimeFormat('en-GB', {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
})

const timeFmt = new Intl.DateTimeFormat('en-GB', {
  hour: '2-digit',
  minute: '2-digit',
})

const weekdayFmt = new Intl.DateTimeFormat('en-GB', {
  weekday: 'long',
  day: 'numeric',
  month: 'long',
})

export function formatDate(iso: string): string {
  return dateFmt.format(new Date(iso))
}

export function formatDateTime(iso: string): string {
  return dateTimeFmt.format(new Date(iso))
}

export function formatTime(iso: string): string {
  return timeFmt.format(new Date(iso))
}

export function formatWeekday(iso: string): string {
  return weekdayFmt.format(new Date(iso))
}

/** Whole-hours difference between two ISO timestamps. */
export function diffHours(fromIso: string, toIso: string): number {
  return (new Date(toIso).getTime() - new Date(fromIso).getTime()) / 3_600_000
}

export function diffDays(fromIso: string, toIso: string): number {
  return diffHours(fromIso, toIso) / 24
}

/** Human-friendly duration, e.g. "3 hours", "2 days", "45 minutes". */
export function formatDuration(hours: number): string {
  const abs = Math.abs(hours)
  if (abs < 1) {
    const mins = Math.max(1, Math.round(abs * 60))
    return `${mins} minute${mins === 1 ? '' : 's'}`
  }
  if (abs < 48) {
    const h = Math.round(abs)
    return `${h} hour${h === 1 ? '' : 's'}`
  }
  const d = Math.round(abs / 24)
  return `${d} day${d === 1 ? '' : 's'}`
}

/** Relative time such as "in 3 hours" or "2 days ago". */
export function relativeTime(iso: string, now: Date = new Date()): string {
  const hours = (new Date(iso).getTime() - now.getTime()) / 3_600_000
  const label = formatDuration(hours)
  if (Math.abs(hours) < 1 / 60) return 'just now'
  return hours >= 0 ? `in ${label}` : `${label} ago`
}

/** Two ISO datetimes fall on the same calendar day. */
export function isSameDay(iso: string, now: Date = new Date()): boolean {
  const d = new Date(iso)
  return (
    d.getFullYear() === now.getFullYear() &&
    d.getMonth() === now.getMonth() &&
    d.getDate() === now.getDate()
  )
}
