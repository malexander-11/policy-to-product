import { Fragment } from 'react'
import type { Engineer } from '../types'
import type { Booking } from '../lib/agent'
import { formatTime, isSameDay } from '../lib/format'

interface Props {
  engineers: Engineer[]
  days: { iso: string; date: Date }[]
  bookings: Booking[]
  /** Repair ref of a just-approved booking — its chip animates + highlights. */
  highlightRef?: string | null
}

const dayFmt = new Intl.DateTimeFormat('en-GB', { weekday: 'short', day: 'numeric', month: 'short' })

export function EngineerCalendar({ engineers, days, bookings, highlightRef }: Props) {
  const cols = `4.5rem repeat(${engineers.length}, minmax(0, 1fr))`
  return (
    <div className="overflow-x-auto">
      <div className="min-w-[32rem]">
        <div className="grid gap-px bg-line/40" style={{ gridTemplateColumns: cols }}>
          {/* header row */}
          <div className="bg-white p-2 text-xs font-semibold text-midgrey">Day</div>
          {engineers.map((e) => (
            <div key={e.id} className="bg-white p-2">
              <div className="flex items-center gap-1.5">
                <span className="inline-block h-2.5 w-2.5 rounded-full" style={{ backgroundColor: e.color }} aria-hidden="true" />
                <span className="text-xs font-semibold text-ink">{e.name}</span>
              </div>
              <p className="text-[11px] text-midgrey">{e.trade}</p>
            </div>
          ))}

          {/* one row per day */}
          {days.map((day) => (
            <Fragment key={day.iso}>
              <div className="bg-white p-2 text-[11px] font-medium leading-tight text-ink">
                {dayFmt.format(day.date)}
              </div>
              {engineers.map((e) => {
                const cell = bookings
                  .filter((b) => b.engineerId === e.id && isSameDay(b.start, day.date))
                  .sort((a, b) => (a.start < b.start ? -1 : 1))
                return (
                  <div key={e.id + day.iso} className="min-h-[3rem] bg-white p-1.5">
                    <div className="flex flex-col gap-1">
                      {cell.map((b) => {
                        const isNew = highlightRef && b.ref === highlightRef
                        return (
                          <div
                            key={b.start}
                            className={`rounded-sm border-l-2 px-1.5 py-1 text-[11px] leading-tight ${
                              isNew ? 'animate-slide-in ring-1 ring-govblue' : ''
                            }`}
                            style={{ borderColor: e.color, backgroundColor: `${e.color}14` }}
                          >
                            <div className="font-semibold text-ink">{formatTime(b.start)}</div>
                            <div className="truncate text-midgrey">{b.ref ?? b.label}</div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )
              })}
            </Fragment>
          ))}
        </div>
      </div>
    </div>
  )
}
