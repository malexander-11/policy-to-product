// Core domain model for Patch — the Right to Repair digital service.
// Shared by the Resident, Council Ops and Public Dashboard views via RepairsContext.

export type Priority = 'Emergency' | 'Urgent' | 'Routine'

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

/** Coarse issue type the AI agent detects from the description — drives icons. */
export type IssueType = 'boiler' | 'leak' | 'damp' | 'structural' | 'electrical' | 'other'

/** Engineer trades the dispatcher books against. */
export type Trade = 'Plumbing' | 'Electrical' | 'General/Structural'

/** Who an event or note came from. */
export type Actor = 'resident' | 'council' | 'system'

export interface Engineer {
  id: string
  name: string
  trade: Trade
  initials: string
  /** Hex colour used for this engineer's calendar blocks. */
  color: string
}

export interface EvidenceFile {
  id: string
  name: string
  type: 'image' | 'video'
  sizeLabel: string
  uploadedBy: 'resident' | 'officer'
  caption?: string
  /** True once the file has passed the simulated virus/malware scan. */
  scanned?: boolean
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
  date: string // ISO date (kept for display)
  window: string // e.g. '08:00–12:00'
  note?: string
  engineerId?: string
  start?: string // ISO datetime — calendar block start
  end?: string // ISO datetime — calendar block end
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
  estimatedCompletion: string // ISO — the SLA "resolve by" deadline (drives countdowns)
  appointment?: Appointment
  assignedTo?: string
  riskFlags: string[]
  urgentReported: boolean
  evidence: EvidenceFile[]
  timeline: TimelineEvent[]
  notes: InternalNote[]
  acknowledgedAt?: string // ISO — set when acknowledged
  completedAt?: string // ISO — set when completed
  // --- AI agent analysis (populated on submission / seeded) ---
  issueType?: IssueType
  aiSummary?: string // plain-English explanation shown to the resident
  suggestedTrade?: Trade
  estRepairHours?: number
  materials?: string[]
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

export const PRIORITIES: Priority[] = ['Emergency', 'Urgent', 'Routine']
