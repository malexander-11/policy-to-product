import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { Inbox, Flame, AlarmClock, AlertOctagon, CalendarDays, ArrowRight, Activity } from 'lucide-react'
import { useRepairs } from '../state/RepairsContext'
import { computeMetrics, formatPercent } from '../lib/metrics'
import { dueForAck, dueToday, inTriage, urgentOpen } from '../lib/buckets'
import { isOverdue } from '../lib/policy'
import { formatDateTime, relativeTime } from '../lib/format'
import { MetricCard } from '../components/MetricCard'
import { StatusBadge } from '../components/StatusBadge'
import { PriorityBadge } from '../components/PriorityBadge'
import { Tag } from '../components/Tag'
import { Card, CardHeader } from '../components/Card'

const severity: Record<string, number> = { Emergency: 0, Urgent: 1, Standard: 2 }

export function CaseworkerDashboard() {
  const { repairs } = useRepairs()
  const now = useMemo(() => new Date(), [])
  const metrics = useMemo(() => computeMetrics(repairs, now), [repairs, now])

  const counts = useMemo(
    () => ({
      triage: repairs.filter(inTriage).length,
      urgent: repairs.filter(urgentOpen).length,
      dueack: repairs.filter(dueForAck).length,
      overdue: repairs.filter((r) => isOverdue(r, now)).length,
      today: repairs.filter((r) => dueToday(r, now)).length,
    }),
    [repairs, now],
  )

  const needsAttention = useMemo(
    () =>
      repairs
        .filter((r) => isOverdue(r, now) || (urgentOpen(r) && inTriage(r)))
        .sort((a, b) => {
          const ao = isOverdue(a, now) ? 0 : 1
          const bo = isOverdue(b, now) ? 0 : 1
          if (ao !== bo) return ao - bo
          return severity[a.priority] - severity[b.priority]
        })
        .slice(0, 5),
    [repairs, now],
  )

  const recentUpdates = useMemo(
    () =>
      repairs
        .flatMap((r) => r.timeline.map((ev) => ({ ev, ref: r.reference })))
        .sort((a, b) => new Date(b.ev.timestamp).getTime() - new Date(a.ev.timestamp).getTime())
        .slice(0, 7),
    [repairs],
  )

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-3xl font-extrabold text-navy">Repairs dashboard</h1>
          <p className="mt-1 text-midgrey">Riverford Borough Council · Housing repairs team</p>
        </div>
        <Link
          to="/officer/queue"
          className="inline-flex items-center gap-1 text-sm font-semibold text-govblue hover:underline"
        >
          View full repairs queue
          <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </Link>
      </div>

      {/* Buckets */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <MetricCard
          label="Awaiting triage"
          value={counts.triage}
          sublabel="New & acknowledged"
          icon={<Inbox className="h-5 w-5" aria-hidden="true" />}
          to="/officer/queue?preset=triage"
        />
        <MetricCard
          label="Urgent & emergency"
          value={counts.urgent}
          sublabel="Open high-priority"
          tone="amber"
          icon={<Flame className="h-5 w-5" aria-hidden="true" />}
          to="/officer/queue?preset=urgent"
        />
        <MetricCard
          label="Due for acknowledgement"
          value={counts.dueack}
          sublabel="Not yet acknowledged"
          icon={<AlarmClock className="h-5 w-5" aria-hidden="true" />}
          to="/officer/queue?preset=dueack"
        />
        <MetricCard
          label="Overdue"
          value={counts.overdue}
          sublabel="Breached SLA"
          tone="red"
          icon={<AlertOctagon className="h-5 w-5" aria-hidden="true" />}
          to="/officer/queue?preset=overdue"
        />
        <MetricCard
          label="Due today"
          value={counts.today}
          sublabel="Appointments & targets"
          tone="blue"
          icon={<CalendarDays className="h-5 w-5" aria-hidden="true" />}
          to="/officer/queue?preset=today"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Needs attention */}
        <Card>
          <CardHeader title="Needs attention now" subtitle="Overdue cases and urgent work awaiting triage." />
          <div className="divide-y divide-slate-100">
            {needsAttention.length === 0 && (
              <p className="px-5 py-6 text-sm text-midgrey">Nothing needs urgent attention. Good work.</p>
            )}
            {needsAttention.map((r) => (
              <Link
                key={r.reference}
                to={`/officer/case/${r.reference}`}
                className="flex items-center justify-between gap-3 px-5 py-3.5 hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-navy"
              >
                <div className="min-w-0">
                  <p className="flex items-center gap-2 font-semibold text-navy">
                    {r.reference}
                    {isOverdue(r, now) && <Tag tone="red">Overdue</Tag>}
                  </p>
                  <p className="truncate text-sm text-ink">
                    {r.category} · {r.resident.name}
                  </p>
                  <p className="text-xs text-midgrey">Acknowledge by {formatDateTime(r.acknowledgementDeadline)}</p>
                </div>
                <div className="flex shrink-0 flex-col items-end gap-1">
                  <PriorityBadge priority={r.priority} />
                  <StatusBadge status={r.status} />
                </div>
              </Link>
            ))}
          </div>
        </Card>

        {/* Recent updates */}
        <Card>
          <CardHeader title="Recent updates" subtitle="The latest activity across all cases." />
          <ul className="divide-y divide-slate-100">
            {recentUpdates.map(({ ev, ref }) => (
              <li key={ev.id} className="px-5 py-3">
                <div className="flex items-baseline justify-between gap-3">
                  <p className="font-semibold text-navy">{ev.title}</p>
                  <time className="shrink-0 text-xs text-midgrey" dateTime={ev.timestamp}>
                    {relativeTime(ev.timestamp)}
                  </time>
                </div>
                <p className="text-sm text-ink">
                  <Link to={`/officer/case/${ref}`} className="font-medium text-govblue hover:underline">
                    {ref}
                  </Link>
                  {ev.description ? ` — ${ev.description}` : ''}
                </p>
              </li>
            ))}
          </ul>
        </Card>
      </div>

      {/* Performance snapshot */}
      <Card>
        <CardHeader
          title="Performance snapshot"
          subtitle="Headline figures for the team."
          action={
            <Link
              to="/officer/performance"
              className="inline-flex items-center gap-1 text-sm font-semibold text-govblue hover:underline"
            >
              <Activity className="h-4 w-4" aria-hidden="true" />
              Full report
            </Link>
          }
        />
        <div className="grid gap-4 p-5 sm:grid-cols-2 lg:grid-cols-4">
          <Snapshot label="Open cases" value={String(metrics.openCases)} />
          <Snapshot label="Acknowledgement SLA" value={formatPercent(metrics.acknowledgementSlaRate)} />
          <Snapshot label="Urgent repairs on time" value={formatPercent(metrics.urgentWithinTargetRate)} />
          <Snapshot label="Completed on time" value={formatPercent(metrics.onTimeCompletionRate)} />
        </div>
      </Card>
    </div>
  )
}

function Snapshot({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-slate-50 p-4">
      <p className="text-sm font-medium text-midgrey">{label}</p>
      <p className="mt-1 text-2xl font-extrabold text-navy">{value}</p>
    </div>
  )
}
