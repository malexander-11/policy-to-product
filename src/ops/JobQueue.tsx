import { useState } from 'react'
import { AlertCircle, MapPin } from 'lucide-react'
import type { Priority, Repair } from '../types'
import { PRIORITIES } from '../types'
import { PriorityBadge } from '../components/PriorityBadge'
import { IssueIcon } from '../components/IssueIcon'
import { SlaCountdown } from '../components/SlaCountdown'

export interface QueueItem {
  repair: Repair
  risk: boolean
  isNew: boolean
}

interface Props {
  items: QueueItem[]
  selectedRef: string | null
  onSelect: (ref: string) => void
  now: Date
}

export function JobQueue({ items, selectedRef, onSelect, now }: Props) {
  const [priority, setPriority] = useState<Priority | 'All'>('All')
  const [riskOnly, setRiskOnly] = useState(false)

  const filtered = items.filter(
    (it) => (priority === 'All' || it.repair.priority === priority) && (!riskOnly || it.risk),
  )

  return (
    <div className="flex h-full flex-col">
      <div className="border-b border-line/60 p-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-ink">Live job queue</h2>
          <span className="text-xs text-midgrey">{filtered.length} shown</span>
        </div>
        <div className="mt-2 flex flex-wrap items-center gap-1.5">
          {(['All', ...PRIORITIES] as const).map((p) => (
            <button
              key={p}
              onClick={() => setPriority(p)}
              className={`rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset transition-colors ${
                priority === p ? 'bg-ink text-white ring-ink' : 'bg-white text-midgrey ring-line hover:bg-slate-50'
              }`}
            >
              {p}
            </button>
          ))}
          <label className="ml-auto inline-flex cursor-pointer items-center gap-1.5 text-xs font-semibold text-ink">
            <input type="checkbox" checked={riskOnly} onChange={(e) => setRiskOnly(e.target.checked)} className="accent-emergency" />
            At risk only
          </label>
        </div>
      </div>

      <ul className="flex-1 divide-y divide-line/50 overflow-y-auto">
        {filtered.length === 0 && <li className="p-4 text-sm text-midgrey">No jobs match these filters.</li>}
        {filtered.map(({ repair, risk, isNew }) => {
          const selected = repair.reference === selectedRef
          return (
            <li key={repair.reference}>
              <button
                onClick={() => onSelect(repair.reference)}
                className={`w-full rounded-sm p-3 text-left transition-colors ${
                  selected ? 'bg-govblue/[0.06] ring-1 ring-inset ring-govblue/40' : 'hover:bg-slate-50'
                } ${isNew ? 'animate-attention' : ''}`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex min-w-0 items-start gap-2">
                    <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded bg-slate-100 text-midgrey">
                      <IssueIcon issue={repair.issueType} className="h-4 w-4" />
                    </span>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-ink">{repair.resident.name}</p>
                      <p className="flex items-center gap-1 truncate text-xs text-midgrey">
                        <MapPin className="h-3 w-3 shrink-0" aria-hidden="true" />
                        {repair.resident.address}
                      </p>
                    </div>
                  </div>
                  <PriorityBadge priority={repair.priority} />
                </div>

                <div className="mt-2 flex items-center justify-between gap-2">
                  <SlaCountdown deadline={repair.estimatedCompletion} now={now} className="text-xs" />
                  {risk ? (
                    <span className="inline-flex items-center gap-1 rounded-full bg-emergency-light px-2 py-0.5 text-[11px] font-bold text-emergency-dark">
                      <span className="h-1.5 w-1.5 rounded-full bg-emergency animate-pulse-dot" aria-hidden="true" />
                      SLA RISK
                    </span>
                  ) : repair.assignedTo ? (
                    <span className="text-[11px] font-semibold text-govgreen">Assigned</span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-[11px] text-midgrey">
                      <AlertCircle className="h-3 w-3" aria-hidden="true" />
                      Needs dispatch
                    </span>
                  )}
                </div>
              </button>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
