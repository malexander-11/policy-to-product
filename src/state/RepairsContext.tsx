import {
  createContext,
  useContext,
  useMemo,
  useReducer,
  type ReactNode,
} from 'react'
import type {
  Appointment,
  EvidenceFile,
  Priority,
  Repair,
  RepairStatus,
  TimelineEvent,
} from '../types'
import { createSeedRepairs } from '../data/seed'
import { deadlinesFrom } from '../lib/policy'
import { formatDate } from '../lib/format'

// --- id / reference generation (runtime only) -----------------------------

let idCounter = 0
function uid(prefix: string): string {
  idCounter += 1
  return `${prefix}-${Date.now().toString(36)}-${idCounter}`
}

let refCounter = 519 // seed references run up to 0501; new ones start at 0520
export function nextReference(): string {
  refCounter += 1
  return `RR-2026-${String(refCounter).padStart(4, '0')}`
}

// --- reducer ---------------------------------------------------------------

interface State {
  repairs: Repair[]
}

type Action =
  | { kind: 'add'; repair: Repair }
  | { kind: 'acknowledge'; ref: string }
  | { kind: 'assign'; ref: string; assignee: string }
  | { kind: 'appointment'; ref: string; appointment: Appointment }
  | { kind: 'status'; ref: string; status: RepairStatus }
  | { kind: 'requestInfo'; ref: string; message: string; author: string }
  | { kind: 'complete'; ref: string }
  | { kind: 'note'; ref: string; author: string; text: string }
  | { kind: 'residentNote'; ref: string; text: string }
  | { kind: 'evidence'; ref: string; file: EvidenceFile }
  | { kind: 'priority'; ref: string; priority: Priority; reason: string }

function addEvent(r: Repair, ev: Omit<TimelineEvent, 'id'>): Repair {
  return { ...r, timeline: [...r.timeline, { id: uid(`${r.reference}-t`), ...ev }] }
}

function mapRef(state: State, ref: string, fn: (r: Repair) => Repair): State {
  return { repairs: state.repairs.map((r) => (r.reference === ref ? fn(r) : r)) }
}

function reducer(state: State, action: Action): State {
  const nowIso = new Date().toISOString()

  switch (action.kind) {
    case 'add':
      return { repairs: [action.repair, ...state.repairs] }

    case 'acknowledge':
      return mapRef(state, action.ref, (r) => {
        if (r.acknowledgedAt) return r
        const next: Repair = {
          ...r,
          acknowledgedAt: nowIso,
          status: r.status === 'Submitted' ? 'Acknowledged' : r.status,
        }
        return addEvent(next, {
          timestamp: nowIso,
          title: 'Repair acknowledged',
          description: 'Acknowledged by Riverford Borough Council.',
          actor: 'council',
        })
      })

    case 'assign':
      return mapRef(state, action.ref, (r) => {
        const next: Repair = {
          ...r,
          assignedTo: action.assignee,
          status: r.status === 'Submitted' || r.status === 'Acknowledged' ? 'Triaged' : r.status,
        }
        return addEvent(next, {
          timestamp: nowIso,
          title: `Assigned to ${action.assignee}`,
          actor: 'council',
        })
      })

    case 'appointment':
      return mapRef(state, action.ref, (r) => {
        const next: Repair = {
          ...r,
          appointment: action.appointment,
          status: r.status === 'Completed' ? r.status : 'Appointment booked',
        }
        return addEvent(next, {
          timestamp: nowIso,
          title: 'Appointment booked',
          description: `Booked for ${formatDate(action.appointment.date)}, ${action.appointment.window}.`,
          actor: 'council',
        })
      })

    case 'status':
      return mapRef(state, action.ref, (r) => {
        const next: Repair = { ...r, status: action.status }
        if (action.status === 'Completed' && !next.completedAt) next.completedAt = nowIso
        if (action.status === 'Acknowledged' && !next.acknowledgedAt) next.acknowledgedAt = nowIso
        return addEvent(next, {
          timestamp: nowIso,
          title: `Status updated to ${action.status}`,
          actor: 'council',
        })
      })

    case 'requestInfo':
      return mapRef(state, action.ref, (r) => {
        const next: Repair = {
          ...r,
          status: 'Awaiting information',
          notes: [
            ...r.notes,
            { id: uid(`${r.reference}-n`), timestamp: nowIso, author: action.author, text: `Requested more information: ${action.message}` },
          ],
        }
        return addEvent(next, {
          timestamp: nowIso,
          title: 'More information requested',
          description: action.message,
          actor: 'council',
        })
      })

    case 'complete':
      return mapRef(state, action.ref, (r) => {
        const next: Repair = { ...r, status: 'Completed', completedAt: nowIso }
        return addEvent(next, {
          timestamp: nowIso,
          title: 'Repair completed',
          description: 'Marked complete by the council.',
          actor: 'council',
        })
      })

    case 'note':
      return mapRef(state, action.ref, (r) => ({
        ...r,
        notes: [...r.notes, { id: uid(`${r.reference}-n`), timestamp: nowIso, author: action.author, text: action.text }],
      }))

    case 'residentNote':
      return mapRef(state, action.ref, (r) =>
        addEvent(r, {
          timestamp: nowIso,
          title: 'Note added by resident',
          description: action.text,
          actor: 'resident',
        }),
      )

    case 'evidence':
      return mapRef(state, action.ref, (r) => {
        const fromResident = action.file.uploadedBy === 'resident'
        const next: Repair = { ...r, evidence: [...r.evidence, action.file] }
        return addEvent(next, {
          timestamp: nowIso,
          title: fromResident ? 'Evidence added by resident' : 'Evidence added',
          description: action.file.name,
          actor: fromResident ? 'resident' : 'council',
        })
      })

    case 'priority':
      return mapRef(state, action.ref, (r) => {
        const { acknowledgementDeadline, estimatedCompletion } = deadlinesFrom(r.submittedAt, action.priority)
        const next: Repair = { ...r, priority: action.priority, acknowledgementDeadline, estimatedCompletion }
        return addEvent(next, {
          timestamp: nowIso,
          title: `Priority changed to ${action.priority}`,
          description: action.reason,
          actor: 'council',
        })
      })

    default:
      return state
  }
}

// --- context ---------------------------------------------------------------

interface RepairsContextValue {
  repairs: Repair[]
  getRepair: (ref: string) => Repair | undefined
  addRepair: (repair: Repair) => void
  acknowledge: (ref: string) => void
  assignContractor: (ref: string, assignee: string) => void
  setAppointment: (ref: string, appointment: Appointment) => void
  updateStatus: (ref: string, status: RepairStatus) => void
  requestInfo: (ref: string, message: string, author?: string) => void
  markComplete: (ref: string) => void
  addNote: (ref: string, text: string, author?: string) => void
  addResidentNote: (ref: string, text: string) => void
  addEvidence: (ref: string, file: EvidenceFile) => void
  updatePriority: (ref: string, priority: Priority, reason: string) => void
}

const RepairsContext = createContext<RepairsContextValue | null>(null)

const DEFAULT_OFFICER = 'You (Housing Officer)'

export function RepairsProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, undefined, () => ({
    repairs: createSeedRepairs(new Date()),
  }))

  const value = useMemo<RepairsContextValue>(
    () => ({
      repairs: state.repairs,
      getRepair: (ref) => state.repairs.find((r) => r.reference === ref),
      addRepair: (repair) => dispatch({ kind: 'add', repair }),
      acknowledge: (ref) => dispatch({ kind: 'acknowledge', ref }),
      assignContractor: (ref, assignee) => dispatch({ kind: 'assign', ref, assignee }),
      setAppointment: (ref, appointment) => dispatch({ kind: 'appointment', ref, appointment }),
      updateStatus: (ref, status) => dispatch({ kind: 'status', ref, status }),
      requestInfo: (ref, message, author = DEFAULT_OFFICER) => dispatch({ kind: 'requestInfo', ref, message, author }),
      markComplete: (ref) => dispatch({ kind: 'complete', ref }),
      addNote: (ref, text, author = DEFAULT_OFFICER) => dispatch({ kind: 'note', ref, author, text }),
      addResidentNote: (ref, text) => dispatch({ kind: 'residentNote', ref, text }),
      addEvidence: (ref, file) => dispatch({ kind: 'evidence', ref, file }),
      updatePriority: (ref, priority, reason) => dispatch({ kind: 'priority', ref, priority, reason }),
    }),
    [state.repairs],
  )

  return <RepairsContext.Provider value={value}>{children}</RepairsContext.Provider>
}

export function useRepairs(): RepairsContextValue {
  const ctx = useContext(RepairsContext)
  if (!ctx) throw new Error('useRepairs must be used within a RepairsProvider')
  return ctx
}
