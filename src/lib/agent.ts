// Patch's "AI agent" — all mocked with deterministic keyword logic, but the
// appearance of intelligence is what sells the demo. Two jobs:
//   1. analyzeReport(): triage a free-text report → issue, urgency, trade, plan.
//   2. recommendBooking(): plan the fix → propose an engineer + calendar slot
//      that keeps the job within SLA, for a human dispatcher to approve.

import type { Category, Engineer, IssueType, Priority, Repair, Trade } from '../types'
import { suggestPriority } from './policy'
import { isSameDay } from './format'

// ---------------------------------------------------------------------------
// 1. Report analysis (triage)
// ---------------------------------------------------------------------------

export interface ReportAnalysis {
  category: Category
  issueType: IssueType
  priority: Priority
  rationale: string
  matchedKeywords: string[]
  emergencySignals: boolean
  plainSummary: string
  suggestedTrade: Trade
  estRepairHours: number
  materials: string[]
}

/** Infer category + issue type from free text (the resident form has no picker). */
function detectIssue(text: string): { category: Category; issueType: IssueType } {
  const t = text.toLowerCase()
  const has = (...kw: string[]) => kw.some((k) => t.includes(k))
  if (has('boiler', 'no heating', 'no hot water', 'radiator', 'heating', 'thermostat', 'pilot light'))
    return { category: 'Heating', issueType: 'boiler' }
  if (has('spark', 'electric', 'wiring', 'wire', 'socket', 'fuse', 'consumer unit', 'no power', 'shock', 'fuse box'))
    return { category: 'Electrical', issueType: 'electrical' }
  if (has('damp', 'mould', 'mold', 'condensation', 'black spot'))
    return { category: 'Damp and mould', issueType: 'damp' }
  if (has('crack', 'ceiling', 'subsidence', 'structural', 'plaster', 'collapse'))
    return { category: 'Structural', issueType: 'structural' }
  if (has('leak', 'pipe', 'burst', 'tap', 'drip', 'toilet', 'drain', 'overflow', 'flood', 'plumb', 'water'))
    return { category: 'Plumbing', issueType: 'leak' }
  if (has('door', 'window', 'lock', 'glaz', 'hinge', 'latch'))
    return { category: 'Doors/windows', issueType: 'other' }
  return { category: 'Other', issueType: 'other' }
}

const TRADE_BY_CATEGORY: Record<Category, Trade> = {
  Heating: 'Plumbing',
  Plumbing: 'Plumbing',
  Electrical: 'Electrical',
  'Damp and mould': 'General/Structural',
  Structural: 'General/Structural',
  'Doors/windows': 'General/Structural',
  Other: 'General/Structural',
}

const SUMMARY_BY_ISSUE: Record<IssueType, string> = {
  boiler: 'Your boiler appears to have lost pressure or stopped working.',
  leak: 'There appears to be a water leak or plumbing fault in your home.',
  damp: 'You appear to have damp or mould that needs treating.',
  structural: 'There appears to be a structural problem with a wall or ceiling.',
  electrical: 'There appears to be an electrical fault that needs making safe.',
  other: 'We have logged your repair and will assess what is needed.',
}

const MATERIALS_BY_ISSUE: Record<IssueType, string[]> = {
  boiler: ['Boiler pressure / PRV kit', 'Replacement parts (confirm on site)'],
  leak: ['Pipe fittings and seals', 'Replacement washers / joints'],
  damp: ['Mould treatment', 'Anti-damp sealant', 'Possible extractor fan'],
  structural: ['Plaster / filler', 'Structural assessment'],
  electrical: ['Replacement socket / fuse', 'Test and certification'],
  other: ['To be confirmed on inspection'],
}

const HOURS_BY_ISSUE: Record<IssueType, number> = {
  boiler: 2,
  leak: 2,
  damp: 3,
  structural: 4,
  electrical: 2,
  other: 2,
}

export function analyzeReport(
  description: string,
  opts: { vulnerable?: boolean; urgentReported?: boolean } = {},
): ReportAnalysis {
  const { category, issueType } = detectIssue(description)
  const s = suggestPriority(category, description, opts)
  return {
    category,
    issueType,
    priority: s.priority,
    rationale: s.rationale,
    matchedKeywords: s.matchedKeywords,
    emergencySignals: s.emergencySignals,
    plainSummary: SUMMARY_BY_ISSUE[issueType],
    suggestedTrade: TRADE_BY_CATEGORY[category],
    estRepairHours: HOURS_BY_ISSUE[issueType],
    materials: MATERIALS_BY_ISSUE[issueType],
  }
}

// ---------------------------------------------------------------------------
// 2. Scheduling — calendar window, slots, booking recommendation
// ---------------------------------------------------------------------------

export const CAL_DAYS = 5
// Two-hour appointment windows in a working day.
const WINDOWS: [number, number][] = [
  [8, 10],
  [10, 12],
  [13, 15],
  [15, 17],
]

export interface Booking {
  engineerId: string
  start: string // ISO
  end: string // ISO
  ref?: string
  label?: string
}

export interface SlotOption {
  engineerId: string
  start: string
  end: string
}

export interface BookingRecommendation {
  recommended: (SlotOption & { withinSlaHours: number }) | null
  alternatives: SlotOption[]
}

function startOfDay(d: Date): Date {
  const x = new Date(d)
  x.setHours(0, 0, 0, 0)
  return x
}

/** The CAL_DAYS days shown in the engineer calendars, starting today. */
export function calendarDays(now: Date): { iso: string; date: Date }[] {
  const base = startOfDay(now)
  return Array.from({ length: CAL_DAYS }, (_, d) => {
    const date = new Date(base)
    date.setDate(base.getDate() + d)
    return { iso: date.toISOString(), date }
  })
}

/** Candidate 2-hour slots across the calendar window, chronological, future only. */
function candidateSlots(now: Date): SlotOption[] {
  const base = startOfDay(now)
  const slots: SlotOption[] = []
  for (let d = 0; d < CAL_DAYS; d++) {
    for (const [sh, eh] of WINDOWS) {
      const start = new Date(base)
      start.setDate(base.getDate() + d)
      start.setHours(sh, 0, 0, 0)
      if (start.getTime() <= now.getTime()) continue
      const end = new Date(start)
      end.setHours(eh, 0, 0, 0)
      slots.push({ engineerId: '', start: start.toISOString(), end: end.toISOString() })
    }
  }
  return slots
}

function overlaps(aStart: string, aEnd: string, b: Booking): boolean {
  return new Date(aStart).getTime() < new Date(b.end).getTime() && new Date(b.start).getTime() < new Date(aEnd).getTime()
}

function isFree(engineerId: string, start: string, end: string, bookings: Booking[]): boolean {
  return !bookings.some((b) => b.engineerId === engineerId && overlaps(start, end, b))
}

/**
 * Propose the earliest engineer + slot of the right trade that keeps the job
 * within its SLA deadline (estimatedCompletion). Falls back to the earliest
 * available slot if nothing fits, and returns up to two alternatives.
 */
export function recommendBooking(
  repair: Repair,
  engineers: Engineer[],
  bookings: Booking[],
  now: Date = new Date(),
): BookingRecommendation {
  const trade = repair.suggestedTrade ?? 'General/Structural'
  const crew = engineers.filter((e) => e.trade === trade)
  const deadline = new Date(repair.estimatedCompletion).getTime()

  const options: SlotOption[] = []
  for (const slot of candidateSlots(now)) {
    for (const e of crew) {
      if (isFree(e.id, slot.start, slot.end, bookings)) {
        options.push({ engineerId: e.id, start: slot.start, end: slot.end })
      }
    }
  }
  options.sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime())

  if (options.length === 0) return { recommended: null, alternatives: [] }

  const withinSla = options.filter((o) => new Date(o.end).getTime() <= deadline)
  const chosen = withinSla[0] ?? options[0]
  const withinSlaHours = (deadline - new Date(chosen.end).getTime()) / 3_600_000
  const alternatives = options.filter((o) => o !== chosen).slice(0, 2)

  return { recommended: { ...chosen, withinSlaHours }, alternatives }
}

/** Will this job breach SLA? Used for the queue's "SLA RISK" flag. */
export function predictSlaRisk(
  repair: Repair,
  engineers: Engineer[],
  bookings: Booking[],
  now: Date = new Date(),
): boolean {
  if (repair.status === 'Completed') return false
  // Already booked: at risk only if the visit ends after the deadline.
  if (repair.appointment?.start) {
    const end = repair.appointment.end ?? repair.appointment.start
    return new Date(end).getTime() > new Date(repair.estimatedCompletion).getTime()
  }
  const rec = recommendBooking(repair, engineers, bookings, now)
  if (!rec.recommended) return true
  return new Date(rec.recommended.end).getTime() > new Date(repair.estimatedCompletion).getTime()
}

/** Bookings derived from repairs that already have a calendar appointment. */
export function bookingsFromRepairs(repairs: Repair[]): Booking[] {
  return repairs
    .filter((r) => r.appointment?.engineerId && r.appointment.start && r.appointment.end)
    .map((r) => ({
      engineerId: r.appointment!.engineerId!,
      start: r.appointment!.start!,
      end: r.appointment!.end!,
      ref: r.reference,
      label: r.issueType ?? r.category,
    }))
}

export { isSameDay }
