import { useState } from 'react'
import { Sparkles, CalendarCheck, Clock, ChevronRight, Shuffle, ArrowRight, ShieldCheck } from 'lucide-react'
import type { Engineer, Priority } from '../types'
import { Button } from './Button'
import { PriorityBadge } from './PriorityBadge'
import { formatWeekday, formatTime, formatDuration } from '../lib/format'

export interface RecoSlot {
  engineer: Engineer
  start: string
  end: string
}

/** Resolved view-model for a whole-queue re-optimisation (Feature 1). */
export interface ReoptView {
  target: RecoSlot & { withinSlaHours: number }
  bump: {
    ref: string
    residentName: string
    priority: Priority
    fromStart: string
    fromEnd: string
    toStart: string
    toEnd: string
    withinSlaHours: number
  }
  savedHours: number
}

interface Props {
  recommended: (RecoSlot & { withinSlaHours: number }) | null
  alternatives: RecoSlot[]
  onApprove: (slot: RecoSlot) => void
  reoptimization?: ReoptView | null
  onApproveOptimized?: () => void
}

function slotLabel(s: { start: string; end: string }): string {
  return `${formatWeekday(s.start)}, ${formatTime(s.start)}–${formatTime(s.end)}`
}

function slaLine(withinSlaHours: number): string {
  return withinSlaHours >= 0
    ? `keeps this job within SLA by ${formatDuration(withinSlaHours)}`
    : `would breach SLA by ${formatDuration(-withinSlaHours)}`
}

export function AgentRecommendationCard({
  recommended,
  alternatives,
  onApprove,
  reoptimization,
  onApproveOptimized,
}: Props) {
  const [showAlts, setShowAlts] = useState(false)
  // Auto-reveal when the agent has actually found a re-balance to propose.
  const [showOpt, setShowOpt] = useState(false)

  return (
    <div className="animate-fade-in rounded border border-l-4 border-line/70 border-l-govblue bg-govblue/[0.04] p-4">
      <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
        <div className="inline-flex items-center gap-1.5 rounded-full bg-govblue px-2 py-0.5 text-xs font-bold uppercase tracking-wide text-white">
          <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
          AI Agent · whole queue
        </div>
        {recommended && (
          <button
            type="button"
            onClick={() => setShowOpt((v) => !v)}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-govblue underline hover:text-govblue-dark"
          >
            <Shuffle className="h-3.5 w-3.5" aria-hidden="true" />
            {showOpt ? 'Hide re-optimise' : 'Re-optimise the day'}
          </button>
        )}
      </div>

      {recommended ? (
        <>
          {/* Re-optimisation proposal (before/after), shown on demand. */}
          {showOpt &&
            (reoptimization ? (
              <div className="mb-4 rounded border border-govblue/40 bg-white p-3">
                <p className="text-sm font-bold text-ink">
                  Re-balanced plan — brings this job forward to {slotLabel(reoptimization.target)}
                </p>
                <p className="mt-1 text-sm text-midgrey">
                  {reoptimization.savedHours > 0
                    ? `About ${formatDuration(reoptimization.savedHours)} earlier than booking a free slot.`
                    : 'Uses an earlier slot freed by re-ordering the queue.'}
                </p>

                <div className="mt-3 rounded border border-line/70 bg-slate-50 p-3 text-sm">
                  <p className="font-semibold text-ink">To do this, the agent moves one lower-priority job:</p>
                  <div className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1">
                    <span className="font-semibold text-ink">{reoptimization.bump.ref}</span>
                    <span className="text-midgrey">· {reoptimization.bump.residentName}</span>
                    <PriorityBadge priority={reoptimization.bump.priority} />
                  </div>
                  <div className="mt-2 flex flex-wrap items-center gap-2 text-midgrey">
                    <span className="line-through">{slotLabel({ start: reoptimization.bump.fromStart, end: reoptimization.bump.fromEnd })}</span>
                    <ArrowRight className="h-4 w-4 shrink-0" aria-hidden="true" />
                    <span className="font-semibold text-ink">{slotLabel({ start: reoptimization.bump.toStart, end: reoptimization.bump.toEnd })}</span>
                  </div>
                  <p className="mt-1.5 flex items-center gap-1.5 font-semibold text-govgreen-dark">
                    <ShieldCheck className="h-4 w-4 shrink-0" aria-hidden="true" />
                    Still within SLA by {formatDuration(reoptimization.bump.withinSlaHours)}
                  </p>
                </div>

                <div className="mt-3">
                  <Button onClick={() => onApproveOptimized?.()}>
                    <CalendarCheck className="h-4 w-4" aria-hidden="true" />
                    Approve re-balanced plan
                  </Button>
                  <p className="mt-1.5 text-xs text-midgrey">Nothing is moved until you approve. The safer option below moves no one.</p>
                </div>
              </div>
            ) : (
              <div className="mb-4 border-l-[10px] border-line py-1 pl-3 text-sm text-ink">
                The agent checked the whole queue: no lower-priority job can be brought forward without
                breaching its own SLA. The slot below is already the earliest available.
              </div>
            ))}

          <p className="text-sm text-ink">
            <span className="font-semibold">{showOpt && reoptimization ? 'Safer option (move no one):' : 'Recommended:'}</span> assign to{' '}
            <span className="font-semibold">{recommended.engineer.name}</span> ({recommended.engineer.trade}) —{' '}
            <span className="font-semibold">{slotLabel(recommended)}</span>.
          </p>
          <p className="mt-1 flex items-center gap-1.5 text-sm text-midgrey">
            <Clock className="h-4 w-4 shrink-0" aria-hidden="true" />
            {recommended.withinSlaHours >= 0
              ? `Their next available slot — ${slaLine(recommended.withinSlaHours)}.`
              : `Earliest available slot — ${slaLine(recommended.withinSlaHours)}.`}
          </p>

          <div className="mt-3 flex flex-wrap gap-2">
            <Button variant={showOpt && reoptimization ? 'secondary' : 'primary'} onClick={() => onApprove(recommended)}>
              <CalendarCheck className="h-4 w-4" aria-hidden="true" />
              {showOpt && reoptimization ? 'Book safer slot' : 'Approve & Book'}
            </Button>
            {alternatives.length > 0 && (
              <Button variant="secondary" onClick={() => setShowAlts((v) => !v)}>
                Choose different slot
                <ChevronRight className={`h-4 w-4 transition-transform ${showAlts ? 'rotate-90' : ''}`} aria-hidden="true" />
              </Button>
            )}
          </div>

          {showAlts && alternatives.length > 0 && (
            <ul className="mt-3 space-y-2 border-t border-line/50 pt-3">
              {alternatives.map((alt) => (
                <li key={alt.engineer.id + alt.start} className="flex items-center justify-between gap-3 text-sm">
                  <span className="min-w-0">
                    <span className="font-medium text-ink">{alt.engineer.name}</span>{' '}
                    <span className="text-midgrey">— {slotLabel(alt)}</span>
                  </span>
                  <Button variant="secondary" onClick={() => onApprove(alt)} className="shrink-0 px-3 py-1.5 text-xs">
                    Book
                  </Button>
                </li>
              ))}
            </ul>
          )}
        </>
      ) : (
        <p className="text-sm text-midgrey">
          No available slots in the next 5 days for this trade. Escalate or extend the schedule.
        </p>
      )}
    </div>
  )
}
