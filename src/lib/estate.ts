// Estate intelligence (Feature 2) — cross-report pattern detection.
//
// A human dispatcher triaging tickets one at a time structurally cannot see
// that three damp reports across one block in a month likely share a single
// cause. This module reasons over the WHOLE set of reports and flags suspected
// building-level (structural/communal) problems, with a hypothesis and a
// recommended action.
//
// IMPORTANT: this is for the Council Ops view ONLY. Building-level clusters must
// never be surfaced on the public dashboard — they could expose individual
// residents' homes before an issue is confirmed.

import type { IssueType, Repair } from '../types'
import { diffDays } from './format'

/** Issue types that tend to share a building-level (structural/communal) cause. */
const STRUCTURAL_FAMILY: IssueType[] = ['damp', 'leak', 'structural']

/** Reports within this many days count toward a current cluster. */
const WINDOW_DAYS = 45

export interface EstateCluster {
  building: string
  refs: string[]
  /** Number of distinct homes (flats / units) affected. */
  unitCount: number
  reportCount: number
  dominantIssue: IssueType
  /** Days between the earliest and latest report in the cluster. */
  spanDays: number
  hypothesis: string
  recommendedAction: string
}

/**
 * Derive the "block" an address belongs to. Named buildings (… Court, House,
 * Gardens) group their flats; a plain street address is its own building.
 *   "7 Maple Court, Flat 9" → "Maple Court"
 *   "19 Birchwood Road"     → "Birchwood Road"
 */
export function buildingOf(address: string): string {
  const firstPart = address.split(',')[0].trim()
  return firstPart.replace(/^\d+[a-z]?\s+/i, '').trim()
}

/** Unit label within a building, e.g. "Flat 9", or the street number for houses. */
function unitOf(address: string): string {
  const parts = address.split(',').map((p) => p.trim())
  if (parts.length > 1) return parts.slice(1).join(', ')
  const m = parts[0].match(/^(\d+[a-z]?)/i)
  return m ? m[1] : parts[0]
}

function hypothesisFor(issue: IssueType, building: string, count: number, units: number): string {
  switch (issue) {
    case 'damp':
      return `${count} damp and mould reports across ${units} homes in ${building} within a few weeks points to a shared cause — likely failed damp-proofing, a roof or guttering defect, or inadequate communal ventilation — rather than isolated household problems.`
    case 'leak':
      return `${count} water/leak reports clustered in ${building} suggest a communal pipe, riser or roof fault affecting more than one home, not separate plumbing faults.`
    case 'structural':
      return `${count} structural reports in ${building} in close succession suggest a building-level fault (movement, water ingress or fabric failure) worth assessing as one.`
    default:
      return `${count} related reports in ${building} may share a common cause.`
  }
}

/**
 * Find buildings with a cluster of related (damp/leak/structural) reports in the
 * recent window across two or more distinct homes — the signature of a shared
 * structural cause rather than coincidental individual faults.
 */
export function detectEstateClusters(repairs: Repair[], now: Date = new Date()): EstateCluster[] {
  const nowIso = now.toISOString()
  const byBuilding = new Map<string, Repair[]>()

  for (const r of repairs) {
    if (!r.issueType || !STRUCTURAL_FAMILY.includes(r.issueType)) continue
    if (diffDays(r.submittedAt, nowIso) > WINDOW_DAYS) continue
    const b = buildingOf(r.resident.address)
    const list = byBuilding.get(b) ?? []
    list.push(r)
    byBuilding.set(b, list)
  }

  const clusters: EstateCluster[] = []
  for (const [building, list] of byBuilding) {
    const units = new Set(list.map((r) => unitOf(r.resident.address)))
    // A genuine estate-level cluster affects ≥2 distinct homes in the same block.
    if (units.size < 2 || list.length < 2) continue

    const counts = new Map<IssueType, number>()
    list.forEach((r) => counts.set(r.issueType!, (counts.get(r.issueType!) ?? 0) + 1))
    const dominantIssue = [...counts.entries()].sort((a, b) => b[1] - a[1])[0][0]

    const times = list.map((r) => new Date(r.submittedAt).getTime())
    const spanDays = Math.round((Math.max(...times) - Math.min(...times)) / 86_400_000)

    clusters.push({
      building,
      refs: list
        .slice()
        .sort((a, b) => (a.submittedAt < b.submittedAt ? 1 : -1))
        .map((r) => r.reference),
      unitCount: units.size,
      reportCount: list.length,
      dominantIssue,
      spanDays,
      hypothesis: hypothesisFor(dominantIssue, building, list.length, units.size),
      recommendedAction:
        dominantIssue === 'leak'
          ? 'Commission a plumbing survey of the communal stack'
          : 'Flag the block for a structural / damp survey',
    })
  }

  return clusters.sort((a, b) => b.reportCount - a.reportCount)
}
