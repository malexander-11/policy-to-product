import type { Engineer } from '../types'
import type { Booking } from '../lib/agent'
import { EngineerCalendar } from '../components/EngineerCalendar'

interface Props {
  engineers: Engineer[]
  days: { iso: string; date: Date }[]
  bookings: Booking[]
  highlightRef?: string | null
}

export function EngineerCalendars({ engineers, days, bookings, highlightRef }: Props) {
  return (
    <div className="flex h-full flex-col">
      <div className="border-b border-line/60 p-3">
        <h2 className="text-sm font-bold text-ink">Engineer calendars</h2>
        <p className="text-xs text-midgrey">Next 5 days</p>
      </div>
      <div className="flex-1 overflow-auto p-3">
        <EngineerCalendar engineers={engineers} days={days} bookings={bookings} highlightRef={highlightRef} />
      </div>
    </div>
  )
}
