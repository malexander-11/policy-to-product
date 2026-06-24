import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Globe, CheckCircle2, ExternalLink } from 'lucide-react'
import { useRepairs } from '../state/RepairsContext'
import { computeMetrics, formatPercent } from '../lib/metrics'
import { formatDuration } from '../lib/format'
import { MetricCard } from '../components/MetricCard'
import { BarChart, type BarDatum } from '../components/BarChart'
import { PublicPerformancePanel } from '../components/PublicPerformancePanel'
import { Card, CardHeader } from '../components/Card'
import { Button } from '../components/Button'

export function PerformanceDashboard() {
  const { repairs } = useRepairs()
  const now = useMemo(() => new Date(), [])
  const metrics = useMemo(() => computeMetrics(repairs, now), [repairs, now])
  const [published, setPublished] = useState(false)

  const categoryTime: BarDatum[] = metrics.byCategory
    .filter((c) => c.avgCompletionDays !== null)
    .map((c) => ({
      label: c.category,
      value: c.avgCompletionDays!,
      display: `${Math.round(c.avgCompletionDays!)}d`,
      tone: 'blue' as const,
    }))
    .sort((a, b) => b.value - a.value)

  const openByPriority: BarDatum[] = metrics.openByPriority.map((p) => ({
    label: p.priority,
    value: p.open,
    display: String(p.open),
    tone: p.priority === 'Emergency' ? 'red' : p.priority === 'Urgent' ? 'amber' : 'slate',
  }))

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold text-navy">Performance reporting</h1>
        <p className="mt-1 max-w-3xl text-midgrey">
          Operational performance for the housing repairs team, and a preview of the data published to residents under
          the Right to Repair initiative.
        </p>
      </div>

      {/* Headline metrics */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          label="Acknowledgement SLA"
          value={formatPercent(metrics.acknowledgementSlaRate)}
          sublabel="Acknowledged within target"
          tone="green"
        />
        <MetricCard
          label="Urgent repair SLA"
          value={formatPercent(metrics.urgentWithinTargetRate)}
          sublabel="Urgent/emergency on time"
          tone="green"
        />
        <MetricCard
          label="Completed on time"
          value={formatPercent(metrics.onTimeCompletionRate)}
          sublabel={`${metrics.completedCount} completed`}
          tone="blue"
        />
        <MetricCard
          label="Avg time to complete"
          value={metrics.avgCompletionDays === null ? '—' : `${Math.round(metrics.avgCompletionDays)} days`}
          sublabel={
            metrics.avgAcknowledgementHours === null
              ? 'Acknowledge: —'
              : `Acknowledge: ${formatDuration(metrics.avgAcknowledgementHours)}`
          }
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader title="Average repair time by category" subtitle="Days from report to completion." />
          <div className="p-5">
            {categoryTime.length === 0 ? (
              <p className="text-sm text-midgrey">No completed repairs yet.</p>
            ) : (
              <BarChart data={categoryTime} ariaLabel="Average repair time by category in days" />
            )}
          </div>
        </Card>
        <Card>
          <CardHeader title="Open cases by priority" subtitle={`${metrics.openCases} open cases in total.`} />
          <div className="p-5">
            <BarChart data={openByPriority} ariaLabel="Open cases by priority" />
          </div>
        </Card>
      </div>

      {/* Publish preview */}
      <Card>
        <CardHeader
          title={
            <span className="inline-flex items-center gap-2">
              <Globe className="h-4 w-4 text-govblue" aria-hidden="true" />
              Publish performance data
            </span>
          }
          subtitle="This is exactly what residents see on the public performance page."
          action={
            <Button variant="primary" onClick={() => setPublished(true)}>
              {published ? 'Published' : 'Publish'}
            </Button>
          }
        />
        <div className="p-5">
          {published && (
            <div
              role="status"
              className="mb-4 flex flex-wrap items-center gap-2 rounded-lg border border-green-200 bg-green-50 px-3 py-2 text-sm font-semibold text-green-800"
            >
              <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
              Performance data published to the public page.
              <Link to="/performance" className="inline-flex items-center gap-1 text-govblue hover:underline">
                View public page
                <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
              </Link>
            </div>
          )}
          <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50/60 p-4">
            <p className="mb-4 text-xs font-semibold uppercase tracking-wide text-midgrey">Preview · public.right-to-repair.gov.uk</p>
            <PublicPerformancePanel metrics={metrics} />
          </div>
        </div>
      </Card>
    </div>
  )
}
