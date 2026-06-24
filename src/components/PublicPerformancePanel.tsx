import { Clock, CheckCircle2, ShieldCheck, Wrench } from 'lucide-react'
import type { PerformanceMetrics } from '../lib/metrics'
import { formatPercent } from '../lib/metrics'
import { formatDuration } from '../lib/format'
import { MetricCard } from './MetricCard'
import { BarChart, type BarDatum } from './BarChart'

export function PublicPerformancePanel({ metrics }: { metrics: PerformanceMetrics }) {
  const avgAck =
    metrics.avgAcknowledgementHours === null ? '—' : formatDuration(metrics.avgAcknowledgementHours)
  const avgComplete =
    metrics.avgCompletionDays === null ? '—' : `${Math.round(metrics.avgCompletionDays)} days`

  const categoryData: BarDatum[] = metrics.byCategory
    .filter((c) => c.total > 0)
    .sort((a, b) => b.total - a.total)
    .map((c) => ({ label: c.category, value: c.total, display: String(c.total), tone: 'blue' }))

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          label="Average time to acknowledge"
          value={avgAck}
          sublabel="From report to first response"
          icon={<Clock className="h-5 w-5" aria-hidden="true" />}
          tone="blue"
        />
        <MetricCard
          label="Average time to complete"
          value={avgComplete}
          sublabel="From report to repair completed"
          icon={<Wrench className="h-5 w-5" aria-hidden="true" />}
          tone="default"
        />
        <MetricCard
          label="Urgent repairs on time"
          value={formatPercent(metrics.urgentWithinTargetRate)}
          sublabel="Emergency & urgent within target"
          icon={<ShieldCheck className="h-5 w-5" aria-hidden="true" />}
          tone="green"
        />
        <MetricCard
          label="Repairs completed on time"
          value={formatPercent(metrics.onTimeCompletionRate)}
          sublabel={`${metrics.completedCount} repairs completed`}
          icon={<CheckCircle2 className="h-5 w-5" aria-hidden="true" />}
          tone="green"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-card">
          <h3 className="text-base font-bold text-navy">Repairs by category</h3>
          <p className="mt-1 text-sm text-midgrey">All repairs reported through the service.</p>
          <div className="mt-4">
            <BarChart data={categoryData} ariaLabel="Repairs by category" />
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-card">
          <h3 className="text-base font-bold text-navy">What this data means</h3>
          <ul className="mt-3 space-y-2 text-sm text-ink">
            <li>
              <strong>Time to acknowledge</strong> is how long, on average, we take to respond after a repair is
              reported.
            </li>
            <li>
              <strong>Time to complete</strong> is the average time from a repair being reported to the work being
              finished.
            </li>
            <li>
              <strong>Urgent repairs on time</strong> shows how many emergency and urgent repairs we finished within
              their target time.
            </li>
            <li>
              <strong>Completed on time</strong> shows the share of completed repairs we finished within the target
              for their priority.
            </li>
          </ul>
        </div>
      </div>
    </div>
  )
}
