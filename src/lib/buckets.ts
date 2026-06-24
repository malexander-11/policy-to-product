// Shared predicates for the caseworker dashboard buckets and the queue filters,
// so the headline counts always match what the filtered queue shows.

import type { Repair } from '../types'
import { isOpen, isOverdue, isUrgentLike } from './policy'
import { isSameDay } from './format'

export type Preset = 'triage' | 'urgent' | 'dueack' | 'overdue' | 'today'

export function inTriage(r: Repair): boolean {
  return r.status === 'Submitted' || r.status === 'Acknowledged'
}

export function dueForAck(r: Repair): boolean {
  return isOpen(r) && !r.acknowledgedAt
}

export function urgentOpen(r: Repair): boolean {
  return isOpen(r) && isUrgentLike(r)
}

export function dueToday(r: Repair, now: Date = new Date()): boolean {
  if (!isOpen(r)) return false
  if (r.appointment && isSameDay(r.appointment.date, now)) return true
  return isSameDay(r.estimatedCompletion, now)
}

export function matchesPreset(r: Repair, preset: Preset, now: Date = new Date()): boolean {
  switch (preset) {
    case 'triage':
      return inTriage(r)
    case 'urgent':
      return urgentOpen(r)
    case 'dueack':
      return dueForAck(r)
    case 'overdue':
      return isOverdue(r, now)
    case 'today':
      return dueToday(r, now)
  }
}

export const presetLabel: Record<Preset, string> = {
  triage: 'Awaiting triage',
  urgent: 'Urgent & emergency',
  dueack: 'Due for acknowledgement',
  overdue: 'Overdue',
  today: 'Due today',
}
