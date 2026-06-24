import { useEffect, useMemo, useRef, useState } from 'react'
import type { Priority } from '../types'
import { useRepairs } from '../state/RepairsContext'
import { useToast } from '../components/Toast'
import { useNow } from '../lib/useNow'
import { bookingsFromRepairs, calendarDays, predictSlaRisk } from '../lib/agent'
import { seedEngineerBookings } from '../data/engineers'
import { formatWeekday, formatTime } from '../lib/format'
import { JobQueue, type QueueItem } from './JobQueue'
import { JobDetail } from './JobDetail'
import { EngineerCalendars } from './EngineerCalendars'
import type { RecoSlot } from '../components/AgentRecommendationCard'

const priorityRank: Record<Priority, number> = { Emergency: 0, Urgent: 1, Routine: 2 }
const panel = 'flex flex-col rounded border border-line bg-white shadow-card lg:h-[calc(100vh-13rem)] lg:min-h-[30rem]'

export function OpsView() {
  const { repairs, engineers, approveBooking } = useRepairs()
  const { showToast } = useToast()
  const now = useNow(1000)

  const seedBookings = useMemo(() => seedEngineerBookings(new Date()), [])
  const days = useMemo(() => calendarDays(new Date()), [])
  const bookings = useMemo(() => [...bookingsFromRepairs(repairs), ...seedBookings], [repairs, seedBookings])

  // Recompute risk + sort at most every 30s (countdowns still tick every second).
  const riskBucket = Math.floor(now.getTime() / 30_000)
  const items: QueueItem[] = useMemo(() => {
    return repairs
      .filter((r) => r.status !== 'Completed')
      .map((repair) => ({ repair, risk: predictSlaRisk(repair, engineers, bookings, now), isNew: false }))
      .sort((a, b) => {
        if (a.risk !== b.risk) return a.risk ? -1 : 1
        if (priorityRank[a.repair.priority] !== priorityRank[b.repair.priority])
          return priorityRank[a.repair.priority] - priorityRank[b.repair.priority]
        return a.repair.estimatedCompletion < b.repair.estimatedCompletion ? -1 : 1
      })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [repairs, engineers, bookings, riskBucket])

  // Pulse jobs that arrive after mount.
  const seen = useRef<Set<string> | null>(null)
  if (seen.current === null) seen.current = new Set(repairs.map((r) => r.reference))
  const [newRefs, setNewRefs] = useState<Set<string>>(() => new Set())
  useEffect(() => {
    const fresh = repairs.map((r) => r.reference).filter((ref) => !seen.current!.has(ref))
    if (fresh.length === 0) return
    fresh.forEach((ref) => seen.current!.add(ref))
    setNewRefs((prev) => new Set([...prev, ...fresh]))
    const t = setTimeout(
      () =>
        setNewRefs((prev) => {
          const n = new Set(prev)
          fresh.forEach((f) => n.delete(f))
          return n
        }),
      5000,
    )
    return () => clearTimeout(t)
  }, [repairs])

  const decorated = items.map((it) => ({ ...it, isNew: newRefs.has(it.repair.reference) }))

  const [selectedRef, setSelectedRef] = useState<string | null>(null)
  const selected = decorated.find((d) => d.repair.reference === selectedRef)?.repair ?? decorated[0]?.repair ?? null

  const [highlightRef, setHighlightRef] = useState<string | null>(null)

  function handleApprove(slot: RecoSlot) {
    if (!selected) return
    approveBooking(selected.reference, {
      engineerId: slot.engineer.id,
      engineerName: slot.engineer.name,
      trade: slot.engineer.trade,
      start: slot.start,
      end: slot.end,
    })
    showToast('Booked. Resident notified.', `${slot.engineer.name} — ${formatWeekday(slot.start)}, ${formatTime(slot.start)}–${formatTime(slot.end)}`)
    setHighlightRef(selected.reference)
    setTimeout(() => setHighlightRef(null), 4000)
  }

  return (
    <div>
      <div className="mb-4">
        <h1 className="text-2xl font-extrabold tracking-tight">Council Ops — dispatcher</h1>
        <p className="text-sm text-midgrey">
          The AI agent triages each report and proposes an engineer and slot. You approve the booking.
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-12">
        <section className={`${panel} lg:col-span-4`} aria-label="Live job queue">
          <JobQueue items={decorated} selectedRef={selected?.reference ?? null} onSelect={setSelectedRef} now={now} />
        </section>

        <section className={`${panel} lg:col-span-5`} aria-label="Job detail">
          {selected ? (
            <JobDetail repair={selected} engineers={engineers} bookings={bookings} now={now} onApprove={handleApprove} />
          ) : (
            <p className="p-6 text-sm text-midgrey">No open jobs. The queue is clear.</p>
          )}
        </section>

        <section className={`${panel} lg:col-span-3`} aria-label="Engineer calendars">
          <EngineerCalendars engineers={engineers} days={days} bookings={bookings} highlightRef={highlightRef} />
        </section>
      </div>
    </div>
  )
}
