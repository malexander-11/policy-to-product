import { useMemo, useState } from 'react'
import { Building2, ChevronDown, Network, ShieldCheck, ClipboardCheck } from 'lucide-react'
import type { Repair } from '../types'
import { detectEstateClusters, type EstateCluster } from '../lib/estate'
import { useRepairs } from '../state/RepairsContext'
import { useToast } from './Toast'
import { Button } from './Button'
import { Tag } from './Tag'

// Feature 2 — Estate intelligence. Internal to the Council Ops view ONLY.
// These building-level clusters must never appear on the public dashboard: they
// could expose individual residents' homes before an issue is confirmed.

const ISSUE_LABEL: Record<string, string> = {
  damp: 'Damp & mould',
  leak: 'Leaks / water',
  structural: 'Structural',
  other: 'Mixed',
  boiler: 'Heating',
  electrical: 'Electrical',
}

export function EstateIntelligence({ repairs, now }: { repairs: Repair[]; now: Date }) {
  const clusters = useMemo(() => detectEstateClusters(repairs, now), [repairs, now])
  if (clusters.length === 0) return null

  return (
    <section className="mb-4 border border-l-4 border-line border-l-govpurple bg-govpurple/[0.04]" aria-label="Estate intelligence">
      <div className="flex items-start gap-2 border-b border-line/60 px-4 py-3">
        <Network className="mt-0.5 h-5 w-5 shrink-0 text-govpurple" aria-hidden="true" />
        <div>
          <h2 className="text-base font-bold text-ink">Estate intelligence</h2>
          <p className="text-sm text-midgrey">
            Patterns the agent spotted across reports — not visible to residents. {clusters.length} possible
            building-level {clusters.length === 1 ? 'issue' : 'issues'}.
          </p>
        </div>
      </div>
      <div className="grid gap-3 p-4 lg:grid-cols-2">
        {clusters.map((c) => (
          <ClusterCard key={c.building} cluster={c} />
        ))}
      </div>
    </section>
  )
}

function ClusterCard({ cluster }: { cluster: EstateCluster }) {
  const { addNote } = useRepairs()
  const { showToast } = useToast()
  const [open, setOpen] = useState(false)
  const [flagged, setFlagged] = useState(false)

  function flag() {
    cluster.refs.forEach((ref) =>
      addNote(
        ref,
        `Linked to a suspected building-level issue in ${cluster.building}. Block flagged for survey: ${cluster.recommendedAction}.`,
        'AI Agent (estate intelligence)',
      ),
    )
    setFlagged(true)
    showToast(`${cluster.building} flagged for survey`, `${cluster.refs.length} reports linked`)
  }

  return (
    <div className="border border-line bg-white p-3">
      <div className="flex items-start justify-between gap-2">
        <div className="flex min-w-0 items-start gap-2">
          <Building2 className="mt-0.5 h-5 w-5 shrink-0 text-govpurple" aria-hidden="true" />
          <div className="min-w-0">
            <p className="font-bold text-ink">{cluster.building}</p>
            <p className="text-sm text-midgrey">
              {cluster.reportCount} reports · {cluster.unitCount} homes ·{' '}
              {cluster.spanDays === 0 ? 'same day' : `${cluster.spanDays} days`}
            </p>
          </div>
        </div>
        <Tag tone="blue">{ISSUE_LABEL[cluster.dominantIssue] ?? cluster.dominantIssue}</Tag>
      </div>

      <p className="mt-2 text-sm text-ink">{cluster.hypothesis}</p>

      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="mt-2 inline-flex items-center gap-1 text-xs font-bold text-govblue underline hover:text-govblue-dark"
      >
        {open ? 'Hide linked reports' : `Show ${cluster.refs.length} linked reports`}
        <ChevronDown className={`h-3.5 w-3.5 transition-transform ${open ? 'rotate-180' : ''}`} aria-hidden="true" />
      </button>
      {open && (
        <ul className="mt-2 flex flex-wrap gap-1.5">
          {cluster.refs.map((ref) => (
            <li key={ref} className="rounded-sm bg-slate-100 px-2 py-0.5 text-xs font-semibold text-midgrey">
              {ref}
            </li>
          ))}
        </ul>
      )}

      <div className="mt-3 border-t border-line/60 pt-3">
        <p className="mb-2 flex items-start gap-1.5 text-sm font-semibold text-ink">
          <ClipboardCheck className="mt-0.5 h-4 w-4 shrink-0 text-govpurple" aria-hidden="true" />
          Recommended: {cluster.recommendedAction}
        </p>
        {flagged ? (
          <p className="inline-flex items-center gap-1.5 text-sm font-bold text-govgreen-dark">
            <ShieldCheck className="h-4 w-4" aria-hidden="true" />
            Survey requested — {cluster.refs.length} reports linked
          </p>
        ) : (
          <Button variant="secondary" onClick={flag} className="px-3 py-1.5 text-sm">
            Flag for structural survey
          </Button>
        )}
      </div>
    </div>
  )
}
