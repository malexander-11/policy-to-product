import type { Engineer } from '../types'
import type { Booking } from '../lib/agent'

// The dispatcher books against these three trades (one engineer each).
export const ENGINEERS: Engineer[] = [
  { id: 'eng-khan', name: 'Jamal Khan', trade: 'Plumbing', initials: 'JK', color: '#1d70b8' },
  { id: 'eng-patel', name: 'Sara Patel', trade: 'Electrical', initials: 'SP', color: '#4c2c92' },
  { id: 'eng-obrien', name: "Michael O'Brien", trade: 'General/Structural', initials: 'MO', color: '#28a197' },
]

export function getEngineer(id: string): Engineer | undefined {
  return ENGINEERS.find((e) => e.id === id)
}

function startOfDay(d: Date): Date {
  const x = new Date(d)
  x.setHours(0, 0, 0, 0)
  return x
}

/**
 * Pre-existing commitments so the calendars look busy before the demo. These
 * block slots for the agent's recommendations too, but never appear in the
 * job queue (they aren't resident repairs).
 */
export function seedEngineerBookings(now: Date): Booking[] {
  const base = startOfDay(now)
  const at = (dayOffset: number, hour: number, endHour: number, engineerId: string, label: string): Booking => {
    const s = new Date(base)
    s.setDate(base.getDate() + dayOffset)
    s.setHours(hour, 0, 0, 0)
    const e = new Date(s)
    e.setHours(endHour, 0, 0, 0)
    return { engineerId, start: s.toISOString(), end: e.toISOString(), label }
  }
  return [
    at(0, 8, 10, 'eng-khan', 'Boiler service'),
    at(0, 13, 15, 'eng-patel', 'Rewire — void property'),
    at(1, 10, 12, 'eng-obrien', 'Damp survey'),
    at(1, 15, 17, 'eng-khan', 'Tap replacement'),
    at(2, 8, 10, 'eng-patel', 'EICR testing'),
    at(2, 13, 15, 'eng-obrien', 'Plaster repair'),
    at(3, 10, 12, 'eng-khan', 'Stopcock repair'),
    at(3, 13, 15, 'eng-patel', 'Consumer unit'),
  ]
}
