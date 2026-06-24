// The "Right to Repair" policy engine.
//
// This module makes the policy logic explicit and reusable: it powers the
// resident-facing urgent warnings AND the caseworker "suggested priority"
// feature, so both sides of the service apply the same rules. SLA figures
// here are illustrative for the prototype, not real statutory targets.

import type { Category, Priority, Repair } from '../types'

export interface SlaRule {
  priority: Priority
  acknowledgeWithin: string // human label
  acknowledgeHours: number
  repairWithin: string // human label
  repairHours: number
  summary: string
  examples: string[]
}

export const SLA_POLICY: Record<Priority, SlaRule> = {
  Emergency: {
    priority: 'Emergency',
    acknowledgeWithin: '2 hours',
    acknowledgeHours: 2,
    repairWithin: '24 hours (make safe)',
    repairHours: 24,
    summary: 'Immediate risk to a resident’s safety, health or security.',
    examples: [
      'Total loss of heating or hot water in cold weather',
      'Serious or uncontainable leak / flooding',
      'Exposed, sparking or unsafe electrics',
      'Structural collapse or risk of collapse',
      'Property cannot be made secure',
    ],
  },
  Urgent: {
    priority: 'Urgent',
    acknowledgeWithin: '1 working day',
    acknowledgeHours: 24,
    repairWithin: '7 days',
    repairHours: 24 * 7,
    summary: 'Significant impact on comfort, health or use of the home.',
    examples: [
      'Partial loss of heating or hot water',
      'Contained leak',
      'Damp and mould affecting health',
      'Insecure door or window',
      'Faulty electrics (not dangerous)',
    ],
  },
  Routine: {
    priority: 'Routine',
    acknowledgeWithin: '5 working days',
    acknowledgeHours: 24 * 5,
    repairWithin: '28 days',
    repairHours: 24 * 28,
    summary: 'Routine repairs that do not pose a risk.',
    examples: [
      'Dripping tap or minor plumbing',
      'Minor joinery or plaster repairs',
      'Cosmetic issues',
      'General wear and tear',
    ],
  },
}

// Keywords that indicate an emergency — checked against the free-text description.
const EMERGENCY_KEYWORDS = [
  'no heating',
  'no hot water',
  'no gas',
  'gas leak',
  'smell of gas',
  'carbon monoxide',
  'flood',
  'flooding',
  'gushing',
  'burst pipe',
  'pouring',
  'sparks',
  'sparking',
  'exposed wire',
  'bare wire',
  'electric shock',
  'burning smell',
  'smoke',
  'fire',
  'ceiling collapsed',
  'ceiling has collapsed',
  'collapsed',
  'come down',
  'falling down',
  'unsafe',
  'dangerous',
  "won't lock",
  'wont lock',
  "can't lock",
  'cannot lock',
  "can't secure",
  'cannot secure',
  'not secure',
  'sewage',
  'overflowing',
]

const URGENT_KEYWORDS = [
  'leak',
  'damp',
  'mould',
  'mold',
  'no lock',
  'broken lock',
  'insecure',
  'broken window',
  'partial heating',
  'intermittent',
  'only toilet',
  'toilet not working',
  'no electric',
  'no power',
]

// Categories that should not default below "Urgent" because of inherent risk.
const HIGHER_RISK_CATEGORIES: Category[] = ['Electrical', 'Structural', 'Heating', 'Damp and mould']

export interface PrioritySuggestion {
  priority: Priority
  rationale: string
  matchedKeywords: string[]
  /** True when the description contains explicit emergency signals. */
  emergencySignals: boolean
}

export interface SuggestOptions {
  vulnerable?: boolean
  urgentReported?: boolean
}

function findKeywords(haystack: string, list: string[]): string[] {
  return list.filter((kw) => haystack.includes(kw))
}

/**
 * Suggest a priority from the category + free-text description, plus optional
 * vulnerability / resident-reported-urgent signals. Returns the suggested
 * priority with a plain-English rationale and the keywords that triggered it.
 */
export function suggestPriority(
  category: Category,
  description: string,
  opts: SuggestOptions = {},
): PrioritySuggestion {
  const text = description.toLowerCase()
  const emergencyMatches = findKeywords(text, EMERGENCY_KEYWORDS)
  const urgentMatches = findKeywords(text, URGENT_KEYWORDS)

  let priority: Priority = 'Routine'
  let rationale = 'Routine repair with no risk indicators detected.'

  if (emergencyMatches.length > 0) {
    priority = 'Emergency'
    rationale = `Description contains emergency indicators (${emergencyMatches
      .slice(0, 3)
      .join(', ')}). Treat as an immediate health, safety or security risk.`
  } else if (urgentMatches.length > 0) {
    priority = 'Urgent'
    rationale = `Description suggests a significant problem (${urgentMatches
      .slice(0, 3)
      .join(', ')}) affecting use of the home.`
  } else if (HIGHER_RISK_CATEGORIES.includes(category)) {
    priority = 'Urgent'
    rationale = `${category} repairs are treated as at least Urgent because of their potential impact.`
  }

  // Vulnerability and resident-reported urgency can raise (never lower) priority.
  if (opts.vulnerable && priority === 'Routine') {
    priority = 'Urgent'
    rationale = 'A vulnerable resident or at-risk household raises this to Urgent.'
  }
  if (opts.urgentReported && priority === 'Routine') {
    priority = 'Urgent'
    rationale = 'The resident reported this as urgent, so it is treated as at least Urgent pending triage.'
  }

  return {
    priority,
    rationale,
    matchedKeywords: [...new Set([...emergencyMatches, ...urgentMatches])],
    emergencySignals: emergencyMatches.length > 0,
  }
}

/** Compute acknowledgement + estimated completion deadlines from a submission time. */
export function deadlinesFrom(
  submittedAtIso: string,
  priority: Priority,
): { acknowledgementDeadline: string; estimatedCompletion: string } {
  const rule = SLA_POLICY[priority]
  const submitted = new Date(submittedAtIso).getTime()
  return {
    acknowledgementDeadline: new Date(submitted + rule.acknowledgeHours * 3_600_000).toISOString(),
    estimatedCompletion: new Date(submitted + rule.repairHours * 3_600_000).toISOString(),
  }
}

/** Acknowledgement breached: still un-acknowledged after the deadline. */
export function isAcknowledgementOverdue(repair: Repair, now: Date = new Date()): boolean {
  if (repair.acknowledgedAt) return false
  return new Date(repair.acknowledgementDeadline).getTime() < now.getTime()
}

/** Repair breached: not completed after the estimated completion date. */
export function isRepairOverdue(repair: Repair, now: Date = new Date()): boolean {
  if (repair.status === 'Completed') return false
  return new Date(repair.estimatedCompletion).getTime() < now.getTime()
}

/** Overdue for SLA purposes (either acknowledgement or repair target breached). */
export function isOverdue(repair: Repair, now: Date = new Date()): boolean {
  return isAcknowledgementOverdue(repair, now) || isRepairOverdue(repair, now)
}

export function isOpen(repair: Repair): boolean {
  return repair.status !== 'Completed'
}

export function isUrgentLike(repair: Repair): boolean {
  return repair.priority === 'Emergency' || repair.priority === 'Urgent'
}
