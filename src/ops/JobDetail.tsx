import { useMemo } from 'react'
import { MapPin, Wrench, Clock, Package, CheckCircle2 } from 'lucide-react'
import type { Engineer, Repair } from '../types'
import { analyzeReport, recommendBooking, proposeReoptimization, type Booking, type ReoptimizationPlan } from '../lib/agent'
import { formatWeekday, formatTime, formatDuration, formatDate } from '../lib/format'
import { PriorityBadge } from '../components/PriorityBadge'
import { StatusBadge } from '../components/StatusBadge'
import { IssueIcon } from '../components/IssueIcon'
import { SlaCountdown } from '../components/SlaCountdown'
import { AgentRecommendationCard, type RecoSlot, type ReoptView } from '../components/AgentRecommendationCard'

interface Props {
  repair: Repair
  repairs: Repair[]
  engineers: Engineer[]
  bookings: Booking[]
  now: Date
  onApprove: (slot: RecoSlot) => void
  onApproveOptimized: (targetRef: string, optimization: NonNullable<ReoptimizationPlan['optimization']>) => void
}

export function JobDetail({ repair, repairs, engineers, bookings, now, onApprove, onApproveOptimized }: Props) {
  const analysis = useMemo(
    () => analyzeReport(repair.description, { vulnerable: repair.resident.vulnerable, urgentReported: repair.urgentReported }),
    [repair.description, repair.resident.vulnerable, repair.urgentReported],
  )

  const reco = useMemo(
    () => recommendBooking(repair, engineers, bookings, now),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [repair.reference, repair.status, bookings],
  )

  const plan = useMemo(
    () => proposeReoptimization(repair, repairs, engineers, bookings, now),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [repair.reference, repair.status, bookings],
  )

  const resolve = (id: string) => engineers.find((e) => e.id === id)
  const recommended: (RecoSlot & { withinSlaHours: number }) | null =
    reco.recommended && resolve(reco.recommended.engineerId)
      ? { engineer: resolve(reco.recommended.engineerId)!, start: reco.recommended.start, end: reco.recommended.end, withinSlaHours: reco.recommended.withinSlaHours }
      : null
  const alternatives: RecoSlot[] = reco.alternatives
    .map((a) => (resolve(a.engineerId) ? { engineer: resolve(a.engineerId)!, start: a.start, end: a.end } : null))
    .filter((x): x is RecoSlot => x !== null)

  const opt = plan.optimization
  const reoptView: ReoptView | null =
    opt && resolve(opt.target.engineerId)
      ? {
          target: { engineer: resolve(opt.target.engineerId)!, start: opt.target.start, end: opt.target.end, withinSlaHours: opt.target.withinSlaHours },
          bump: {
            ref: opt.bump.ref,
            residentName: opt.bump.residentName,
            priority: opt.bump.priority,
            fromStart: opt.bump.from.start,
            fromEnd: opt.bump.from.end,
            toStart: opt.bump.to.start,
            toEnd: opt.bump.to.end,
            withinSlaHours: opt.bump.withinSlaHours,
          },
          savedHours: opt.savedHours,
        }
      : null

  const booked = !!repair.appointment?.start

  return (
    <div className="flex h-full flex-col overflow-y-auto">
      {/* header */}
      <div className="border-b border-line/60 p-4">
        <div className="flex items-center justify-between gap-2">
          <span className="text-xs font-semibold text-midgrey">{repair.reference}</span>
          <StatusBadge status={repair.status} />
        </div>
        <h2 className="mt-1 text-lg font-bold text-ink">{repair.resident.name}</h2>
        <p className="flex items-center gap-1 text-sm text-midgrey">
          <MapPin className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
          {repair.resident.address}
        </p>
        <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1">
          <PriorityBadge priority={repair.priority} />
          <span className="text-sm">
            <span className="text-midgrey">SLA: </span>
            <SlaCountdown deadline={repair.estimatedCompletion} now={now} />
          </span>
        </div>
        {repair.riskFlags.length > 0 && (
          <p className="mt-2 text-xs font-semibold text-emergency-dark">{repair.riskFlags.join(' · ')}</p>
        )}
      </div>

      {/* AI analysis */}
      <div className="space-y-4 p-4">
        <div className="rounded border border-line/60 bg-slate-50/70 p-4">
          <p className="mb-2 text-xs font-bold uppercase tracking-wide text-midgrey">AI analysis</p>
          <div className="flex items-start gap-2">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded bg-white text-govblue ring-1 ring-line/60">
              <IssueIcon issue={repair.issueType} className="h-4 w-4" />
            </span>
            <p className="text-sm font-semibold text-ink">{analysis.plainSummary}</p>
          </div>
          <p className="mt-2 text-sm text-ink">
            <span className="font-semibold">Why {repair.priority}:</span> {analysis.rationale}
          </p>
          <dl className="mt-3 grid grid-cols-2 gap-3 text-sm">
            <div className="flex items-start gap-1.5">
              <Wrench className="mt-0.5 h-4 w-4 shrink-0 text-midgrey" aria-hidden="true" />
              <div>
                <dt className="text-xs text-midgrey">Suggested trade</dt>
                <dd className="font-semibold text-ink">{analysis.suggestedTrade}</dd>
              </div>
            </div>
            <div className="flex items-start gap-1.5">
              <Clock className="mt-0.5 h-4 w-4 shrink-0 text-midgrey" aria-hidden="true" />
              <div>
                <dt className="text-xs text-midgrey">Est. repair time</dt>
                <dd className="font-semibold text-ink">{formatDuration(analysis.estRepairHours)}</dd>
              </div>
            </div>
            <div className="col-span-2 flex items-start gap-1.5">
              <Package className="mt-0.5 h-4 w-4 shrink-0 text-midgrey" aria-hidden="true" />
              <div>
                <dt className="text-xs text-midgrey">Likely materials</dt>
                <dd className="text-ink">{analysis.materials.join(', ')}</dd>
              </div>
            </div>
          </dl>
        </div>

        {booked ? (
          <div className="rounded border border-l-4 border-line/60 border-l-govgreen bg-govgreen/5 p-4">
            <p className="flex items-center gap-1.5 text-sm font-bold text-govgreen-dark">
              <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
              Booked — resident notified
            </p>
            <p className="mt-1 text-sm text-ink">{repair.assignedTo}</p>
            <p className="text-sm text-midgrey">
              {formatWeekday(repair.appointment!.start ?? repair.appointment!.date)} ({formatDate(repair.appointment!.start ?? repair.appointment!.date)}),{' '}
              {repair.appointment!.window}
            </p>
          </div>
        ) : (
          <AgentRecommendationCard
            recommended={recommended}
            alternatives={alternatives}
            onApprove={onApprove}
            reoptimization={reoptView}
            onApproveOptimized={() => opt && onApproveOptimized(repair.reference, opt)}
          />
        )}
      </div>
    </div>
  )
}
