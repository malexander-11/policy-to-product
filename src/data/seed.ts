// Seed data for Patch, built relative to runtime `now` so SLA countdowns,
// "at risk" flags and calendars always look right whenever the demo runs.
// Includes live queue jobs (one deliberately at risk), a couple already booked
// to populate the calendars, and completed history to feed the public metrics.

import type { Appointment, EvidenceFile, Priority, Repair, RepairStatus, TimelineEvent } from '../types'
import { deadlinesFrom } from '../lib/policy'
import { analyzeReport } from '../lib/agent'
import { formatTime, formatWeekday } from '../lib/format'
import { getEngineer } from './engineers'

const H = 3_600_000
const D = 24 * H

let tcount = 0
function tid(ref: string): string {
  tcount += 1
  return `${ref}-t${tcount}`
}

interface SeedInput {
  reference: string
  resident: { name: string; address: string; email: string; phone: string; vulnerable?: boolean }
  description: string
  priority: Priority
  status: RepairStatus
  submittedOffset: number // ms from now (negative = past)
  acknowledgedOffset?: number
  completedOffset?: number
  urgentReported?: boolean
  riskFlags?: string[]
  appointment?: Appointment
  assignedTo?: string
}

export function createSeedRepairs(now: Date): Repair[] {
  const t = now.getTime()
  const iso = (offset: number) => new Date(t + offset).toISOString()

  const startOfDay = (d: Date) => {
    const x = new Date(d)
    x.setHours(0, 0, 0, 0)
    return x
  }
  // A calendar slot (day offset from today, start/end hours) as an Appointment.
  const slot = (engineerId: string, dayOffset: number, startHour: number, endHour: number): Appointment => {
    const s = new Date(startOfDay(now))
    s.setDate(s.getDate() + dayOffset)
    s.setHours(startHour, 0, 0, 0)
    const e = new Date(s)
    e.setHours(endHour, 0, 0, 0)
    const eng = getEngineer(engineerId)
    return {
      date: s.toISOString(),
      window: `${formatTime(s.toISOString())}–${formatTime(e.toISOString())}`,
      engineerId,
      start: s.toISOString(),
      end: e.toISOString(),
      note: eng ? `${eng.name} (${eng.trade})` : undefined,
    }
  }

  function build(input: SeedInput): Repair {
    const a = analyzeReport(input.description, {
      vulnerable: input.resident.vulnerable,
      urgentReported: input.urgentReported,
    })
    const submittedAt = iso(input.submittedOffset)
    const { acknowledgementDeadline, estimatedCompletion } = deadlinesFrom(submittedAt, input.priority)

    const timeline: TimelineEvent[] = [
      {
        id: tid(input.reference),
        timestamp: submittedAt,
        title: 'Repair reported',
        description: input.description,
        actor: 'resident',
      },
    ]
    if (input.acknowledgedOffset !== undefined) {
      timeline.push({
        id: tid(input.reference),
        timestamp: iso(input.acknowledgedOffset),
        title: 'Repair acknowledged',
        description: 'Acknowledged by Riverford Borough Council.',
        actor: 'council',
      })
    }
    if (input.appointment?.start) {
      timeline.push({
        id: tid(input.reference),
        timestamp: iso((input.acknowledgedOffset ?? input.submittedOffset) + H),
        title: 'Engineer assigned',
        description: `${input.assignedTo ?? input.appointment.note ?? 'Engineer'} — ${formatWeekday(
          input.appointment.start,
        )}, ${input.appointment.window}.`,
        actor: 'council',
      })
    }
    if (input.status === 'In progress') {
      timeline.push({
        id: tid(input.reference),
        timestamp: iso(-2 * H),
        title: 'Work in progress',
        description: 'Engineer is on site.',
        actor: 'council',
      })
    }
    if (input.completedOffset !== undefined) {
      timeline.push({
        id: tid(input.reference),
        timestamp: iso(input.completedOffset),
        title: 'Repair completed',
        description: 'Repair completed and signed off.',
        actor: 'council',
      })
    }

    return {
      reference: input.reference,
      resident: {
        name: input.resident.name,
        address: input.resident.address,
        email: input.resident.email,
        phone: input.resident.phone,
        vulnerable: !!input.resident.vulnerable,
      },
      category: a.category,
      description: input.description,
      priority: input.priority,
      status: input.status,
      submittedAt,
      acknowledgementDeadline,
      estimatedCompletion,
      appointment: input.appointment,
      assignedTo: input.assignedTo,
      riskFlags: input.riskFlags ?? [],
      urgentReported: !!input.urgentReported,
      evidence: [] as EvidenceFile[],
      timeline,
      notes: [],
      acknowledgedAt: input.acknowledgedOffset !== undefined ? iso(input.acknowledgedOffset) : undefined,
      completedAt: input.completedOffset !== undefined ? iso(input.completedOffset) : undefined,
      issueType: a.issueType,
      aiSummary: a.plainSummary,
      suggestedTrade: a.suggestedTrade,
      estRepairHours: a.estRepairHours,
      materials: a.materials,
    }
  }

  return [
    // --- Live queue: needs dispatch ---
    build({
      reference: 'RR-2026-0501',
      resident: { name: 'Margaret Hughes', address: '4 Elmtree Court, Flat 2', email: 'm.hughes@example.com', phone: '07700 900512', vulnerable: true },
      description: 'No heating at all and the boiler is making a loud banging noise. The flat is freezing.',
      priority: 'Emergency',
      status: 'Acknowledged',
      submittedOffset: -20 * H,
      acknowledgedOffset: -19 * H,
      riskFlags: ['Vulnerable household', 'Elderly resident'],
    }),
    build({
      reference: 'RR-2026-0503',
      resident: { name: 'Daniel Okafor', address: '19 Birchwood Road', email: 'd.okafor@example.com', phone: '07700 900488' },
      description: 'A socket in the kitchen is sparking and there is a smell of burning. I have switched it off.',
      priority: 'Emergency',
      status: 'Acknowledged',
      submittedOffset: -23.4 * H, // SLA deadline ~36 min away → cannot be booked in time → AT RISK
      acknowledgedOffset: -23 * H,
    }),
    build({
      reference: 'RR-2026-0498',
      resident: { name: 'Priya Raman', address: '7 Maple Court, Flat 9', email: 'p.raman@example.com', phone: '07700 900471', vulnerable: true },
      description: 'Damp and black mould spreading across the bedroom wall. My child has asthma.',
      priority: 'Urgent',
      status: 'Acknowledged',
      submittedOffset: -26 * H,
      acknowledgedOffset: -24 * H,
      riskFlags: ['Vulnerable household', 'Child with health condition'],
    }),
    build({
      reference: 'RR-2026-0505',
      resident: { name: 'Tom Fletcher', address: '23 Cedar Avenue', email: 't.fletcher@example.com', phone: '07700 900233' },
      description: 'Water leaking from the pipe under the kitchen sink. I have put a bucket under it.',
      priority: 'Urgent',
      status: 'Submitted',
      submittedOffset: -5 * H,
    }),
    build({
      reference: 'RR-2026-0479',
      resident: { name: 'Joan Pickering', address: '2 Rowan House, Flat 1', email: 'j.pickering@example.com', phone: '07700 900190' },
      description: 'The cold tap in the bathroom drips constantly. Not urgent but would like it fixed.',
      priority: 'Routine',
      status: 'Submitted',
      submittedOffset: -30 * H,
    }),
    // --- Already booked / in progress: populate calendars ---
    build({
      reference: 'RR-2026-0484',
      resident: { name: 'Saied Hassan', address: '15 Willow Gardens', email: 's.hassan@example.com', phone: '07700 900644' },
      description: 'The front door will not lock properly, the latch is broken. The flat is not secure.',
      priority: 'Urgent',
      status: 'Appointment booked',
      submittedOffset: -2 * D,
      acknowledgedOffset: -2 * D + 2 * H,
      appointment: slot('eng-obrien', 1, 13, 15),
      assignedTo: "Michael O'Brien (General/Structural)",
    }),
    build({
      reference: 'RR-2026-0490',
      resident: { name: 'Grace Adeyemi', address: '8 Hawthorn Close', email: 'g.adeyemi@example.com', phone: '07700 900377' },
      description: 'Intermittent loss of power to half the flat, the fuse box keeps tripping.',
      priority: 'Emergency',
      status: 'In progress',
      submittedOffset: -10 * H,
      acknowledgedOffset: -9.5 * H,
      appointment: slot('eng-patel', 0, 10, 12),
      assignedTo: 'Sara Patel (Electrical)',
    }),
    // --- Completed history: feeds public metrics ---
    build({
      reference: 'RR-2026-0455',
      resident: { name: 'Leon Carter', address: '11 Sycamore Street', email: 'l.carter@example.com', phone: '07700 900910' },
      description: 'Broken window catch in the living room, will not close fully.',
      priority: 'Urgent',
      status: 'Completed',
      submittedOffset: -10 * D,
      acknowledgedOffset: -10 * D + 3 * H,
      completedOffset: -7 * D,
    }),
    build({
      reference: 'RR-2026-0461',
      resident: { name: 'Nina Walsh', address: '5 Juniper Court', email: 'n.walsh@example.com', phone: '07700 900118' },
      description: 'Boiler losing pressure and hot water cuts out intermittently.',
      priority: 'Urgent',
      status: 'Completed',
      submittedOffset: -12 * D,
      acknowledgedOffset: -12 * D + 4 * H,
      completedOffset: -9 * D,
    }),
    build({
      reference: 'RR-2026-0448',
      resident: { name: 'Owen Pryce', address: '30 Alder Road', email: 'o.pryce@example.com', phone: '07700 900755' },
      description: 'Slow draining and gurgling from the bathroom plughole.',
      priority: 'Routine',
      status: 'Completed',
      submittedOffset: -40 * D,
      acknowledgedOffset: -40 * D + 2 * D,
      completedOffset: -5 * D, // 35 days → past the 28-day target (drags on-time rate)
    }),
    build({
      reference: 'RR-2026-0468',
      resident: { name: 'Fatima Noor', address: '14 Chestnut Walk', email: 'f.noor@example.com', phone: '07700 900602' },
      description: 'Damp patch and mould returning around the bathroom window.',
      priority: 'Urgent',
      status: 'Completed',
      submittedOffset: -15 * D,
      acknowledgedOffset: -15 * D + 5 * H,
      completedOffset: -9 * D,
    }),
  ]
}
