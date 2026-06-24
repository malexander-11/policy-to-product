import { useMemo } from 'react'
import { Clock, ShieldCheck, Inbox, Wrench } from 'lucide-react'
import { useRepairs } from '../state/RepairsContext'
import { computeMetrics, formatPercent } from '../lib/metrics'
import { formatDuration } from '../lib/format'
import { MetricCard } from '../components/MetricCard'
import { BarChart, type BarDatum } from '../components/BarChart'
import { Card, CardHeader } from '../components/Card'

export function PublicDashboard() {
  const { repairs } = useRepairs()
  const m = useMemo(() => computeMetrics(repairs, new Date()), [repairs])

  const byType: BarDatum[] = m.byCategory
    .filter((c) => c.total > 0)
    .sort((a, b) => b.total - a.total)
    .map((c) => ({ label: c.category, value: c.total, tone: 'blue' }))

  const avgRepair = m.avgCompletionDays != null ? formatDuration(m.avgCompletionDays * 24) : '—'

  return (
    <div className="mx-auto max-w-4xl">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Repairs performance</h1>
          <p className="mt-1 text-midgrey">Riverford Borough Council · published under the Right to Repair policy</p>
        </div>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-govgreen/10 px-3 py-1 text-xs font-semibold text-govgreen-dark">
          <span className="h-1.5 w-1.5 rounded-full bg-govgreen animate-pulse-dot" aria-hidden="true" />
          Live data, updated automatically
        </span>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard label="Average repair time" value={avgRepair} sublabel="report to completion" icon={<Clock className="h-5 w-5" />} />
        <MetricCard
          label="Completed within SLA"
          value={formatPercent(m.onTimeCompletionRate)}
          sublabel="on or before target"
          tone="green"
          icon={<ShieldCheck className="h-5 w-5" />}
        />
        <MetricCard
          label="Requests this month"
          value={m.requestsThisMonth}
          sublabel={`${m.totalCases} all time`}
          tone="blue"
          icon={<Inbox className="h-5 w-5" />}
        />
        <MetricCard label="Open repairs" value={m.openCases} sublabel={`${m.completedCount} completed`} icon={<Wrench className="h-5 w-5" />} />
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader title="Repairs by type" subtitle="All reported repairs" />
          <div className="p-5">
            {byType.length ? (
              <BarChart data={byType} ariaLabel="Repairs by type" />
            ) : (
              <p className="text-sm text-midgrey">No data yet.</p>
            )}
          </div>
        </Card>
        <Card>
          <CardHeader title="What this means" />
          <div className="space-y-2 p-5 text-sm text-ink">
            <p>These figures update automatically as repairs are reported, booked and completed.</p>
            <p className="text-midgrey">
              Average repair time is measured from when a repair is reported to when it is completed. “Completed
              within SLA” is the share of completed repairs finished on or before their target date.
            </p>
          </div>
        </Card>
      </div>

      <p className="mt-4 text-xs text-midgrey">
        Prototype data for demonstration. Figures are illustrative and not real council performance.
      </p>
    </div>
  )
}
