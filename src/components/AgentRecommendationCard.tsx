import { useState } from 'react'
import { Sparkles, CalendarCheck, Clock, ChevronRight } from 'lucide-react'
import type { Engineer } from '../types'
import { Button } from './Button'
import { formatWeekday, formatTime, formatDuration } from '../lib/format'

export interface RecoSlot {
  engineer: Engineer
  start: string
  end: string
}

interface Props {
  recommended: (RecoSlot & { withinSlaHours: number }) | null
  alternatives: RecoSlot[]
  onApprove: (slot: RecoSlot) => void
}

function slotLabel(s: RecoSlot): string {
  return `${formatWeekday(s.start)}, ${formatTime(s.start)}–${formatTime(s.end)}`
}

export function AgentRecommendationCard({ recommended, alternatives, onApprove }: Props) {
  const [showAlts, setShowAlts] = useState(false)

  return (
    <div className="animate-fade-in rounded border border-l-4 border-line/70 border-l-govblue bg-govblue/[0.04] p-4">
      <div className="mb-2 inline-flex items-center gap-1.5 rounded-full bg-govblue px-2 py-0.5 text-xs font-bold uppercase tracking-wide text-white">
        <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
        AI Agent
      </div>

      {recommended ? (
        <>
          <p className="text-sm text-ink">
            <span className="font-semibold">Recommended:</span> assign to{' '}
            <span className="font-semibold">{recommended.engineer.name}</span> ({recommended.engineer.trade}) —{' '}
            <span className="font-semibold">{slotLabel(recommended)}</span>.
          </p>
          <p className="mt-1 flex items-center gap-1.5 text-sm text-midgrey">
            <Clock className="h-4 w-4 shrink-0" aria-hidden="true" />
            {recommended.withinSlaHours >= 0
              ? `Their next available slot — keeps this job within SLA by ${formatDuration(recommended.withinSlaHours)}.`
              : `Earliest available slot — would breach SLA by ${formatDuration(-recommended.withinSlaHours)}.`}
          </p>

          <div className="mt-3 flex flex-wrap gap-2">
            <Button onClick={() => onApprove(recommended)}>
              <CalendarCheck className="h-4 w-4" aria-hidden="true" />
              Approve &amp; Book
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
