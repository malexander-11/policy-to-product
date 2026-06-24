// Derive performance metrics from the live repairs array.
// Used by both the public performance page and the caseworker reporting view,
// so the numbers residents see are exactly the numbers officers report on.

import type { Category, Priority, Repair } from '../types'
import { CATEGORIES, PRIORITIES } from '../types'
import { diffDays, diffHours } from './format'
import { isOpen, isUrgentLike } from './policy'

export interface CategoryMetric {
  category: Category
  total: number
  completed: number
  avgCompletionDays: number | null
}

export interface PriorityMetric {
  priority: Priority
  open: number
  total: number
}

export interface PerformanceMetrics {
  totalCases: number
  openCases: number
  completedCount: number
  /** Of completed repairs, the share finished on or before target. */
  onTimeCompletionRate: number | null // 0..1
  avgAcknowledgementHours: number | null
  avgCompletionDays: number | null
  urgentWithinTargetRate: number | null // 0..1
  acknowledgementSlaRate: number | null // 0..1
  byCategory: CategoryMetric[]
  openByPriority: PriorityMetric[]
}

function avg(values: number[]): number | null {
  if (values.length === 0) return null
  return values.reduce((a, b) => a + b, 0) / values.length
}

function completedOnTime(r: Repair): boolean {
  return !!r.completedAt && new Date(r.completedAt).getTime() <= new Date(r.estimatedCompletion).getTime()
}

export function computeMetrics(repairs: Repair[], now: Date = new Date()): PerformanceMetrics {
  const completed = repairs.filter((r) => r.status === 'Completed' && r.completedAt)

  // Acknowledgement times (hours from submission to acknowledgement).
  const ackHours = repairs
    .filter((r) => r.acknowledgedAt)
    .map((r) => diffHours(r.submittedAt, r.acknowledgedAt!))

  // Completion times (days from submission to completion).
  const completionDays = completed.map((r) => diffDays(r.submittedAt, r.completedAt!))

  // Acknowledgement SLA: in scope once acknowledged OR the deadline has passed;
  // compliant only if acknowledged on or before the deadline.
  const ackInScope = repairs.filter(
    (r) => r.acknowledgedAt || new Date(r.acknowledgementDeadline).getTime() < now.getTime(),
  )
  const ackOnTime = repairs.filter(
    (r) => r.acknowledgedAt && new Date(r.acknowledgedAt).getTime() <= new Date(r.acknowledgementDeadline).getTime(),
  )

  // Urgent SLA: completed urgent/emergency cases finished on or before target.
  const completedUrgent = completed.filter(isUrgentLike)
  const urgentOnTime = completedUrgent.filter(completedOnTime)

  const onTime = completed.filter(completedOnTime)

  const byCategory: CategoryMetric[] = CATEGORIES.map((category) => {
    const inCat = repairs.filter((r) => r.category === category)
    const done = inCat.filter((r) => r.status === 'Completed' && r.completedAt)
    return {
      category,
      total: inCat.length,
      completed: done.length,
      avgCompletionDays: avg(done.map((r) => diffDays(r.submittedAt, r.completedAt!))),
    }
  })

  const openByPriority: PriorityMetric[] = PRIORITIES.map((priority) => {
    const inPriority = repairs.filter((r) => r.priority === priority)
    return {
      priority,
      open: inPriority.filter(isOpen).length,
      total: inPriority.length,
    }
  })

  return {
    totalCases: repairs.length,
    openCases: repairs.filter(isOpen).length,
    completedCount: completed.length,
    onTimeCompletionRate: completed.length === 0 ? null : onTime.length / completed.length,
    avgAcknowledgementHours: avg(ackHours),
    avgCompletionDays: avg(completionDays),
    urgentWithinTargetRate: completedUrgent.length === 0 ? null : urgentOnTime.length / completedUrgent.length,
    acknowledgementSlaRate: ackInScope.length === 0 ? null : ackOnTime.length / ackInScope.length,
    byCategory,
    openByPriority,
  }
}

export function formatPercent(rate: number | null): string {
  if (rate === null) return '—'
  return `${Math.round(rate * 100)}%`
}
