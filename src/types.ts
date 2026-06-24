// Core domain model for the Right to Repair service.
// Shared by both the resident-facing and caseworker-facing views.

export type Priority = 'Emergency' | 'Urgent' | 'Standard'

export type RepairStatus =
  | 'Submitted'
  | 'Acknowledged'
  | 'Triaged'
  | 'Appointment booked'
  | 'In progress'
  | 'Awaiting information'
  | 'Completed'

export type Category =
  | 'Heating'
  | 'Plumbing'
  | 'Damp and mould'
  | 'Electrical'
  | 'Structural'
  | 'Doors/windows'
  | 'Other'

/** Who an event or note came from. */
export type Actor = 'resident' | 'council' | 'system'

export interface EvidenceFile {
  id: string
  name: string
  type: 'image' | 'video'
  sizeLabel: string
  uploadedBy: 'resident' | 'officer'
  caption?: string
}

export interface TimelineEvent {
  id: string
  timestamp: string // ISO
  title: string
  description?: string
  actor: Actor
}

export interface InternalNote {
  id: string
  timestamp: string // ISO
  author: string
  text: string
}

export interface Appointment {
  date: string // ISO date
  window: string // e.g. '08:00–12:00'
  note?: string
}

export interface Resident {
  name: string
  address: string
  email: string
  phone: string
  vulnerable: boolean
}

export interface Repair {
  reference: string
  resident: Resident
  category: Category
  description: string
  priority: Priority
  status: RepairStatus
  submittedAt: string // ISO
  acknowledgementDeadline: string // ISO
  estimatedCompletion: string // ISO
  appointment?: Appointment
  assignedTo?: string
  riskFlags: string[]
  urgentReported: boolean
  evidence: EvidenceFile[]
  timeline: TimelineEvent[]
  notes: InternalNote[]
  acknowledgedAt?: string // ISO — set when acknowledged
  completedAt?: string // ISO — set when completed
}

export type Mode = 'resident' | 'caseworker'

export const CATEGORIES: Category[] = [
  'Heating',
  'Plumbing',
  'Damp and mould',
  'Electrical',
  'Structural',
  'Doors/windows',
  'Other',
]

export const STATUSES: RepairStatus[] = [
  'Submitted',
  'Acknowledged',
  'Triaged',
  'Appointment booked',
  'In progress',
  'Awaiting information',
  'Completed',
]

export const PRIORITIES: Priority[] = ['Emergency', 'Urgent', 'Standard']

/** Teams and contractors a caseworker can assign work to (mock). */
export const ASSIGNEES: string[] = [
  'Priya Shah (Housing Officer)',
  'James Coyle (Housing Officer)',
  'Riverford Direct Labour — Plumbing',
  'Riverford Direct Labour — Glazing',
  'Apex Heating Ltd',
  'Northside Electrical (NICEIC)',
  'Structural Surveyor (external)',
]
