import { useMemo } from 'react'
import { useRepairs } from '../state/RepairsContext'
import { computeMetrics } from '../lib/metrics'
import { formatDate } from '../lib/format'
import { PublicPerformancePanel } from '../components/PublicPerformancePanel'
import { Callout } from '../components/Callout'

export function PublicPerformance() {
  const { repairs } = useRepairs()
  const metrics = useMemo(() => computeMetrics(repairs), [repairs])
  const today = useMemo(() => formatDate(new Date().toISOString()), [])

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div>
        <p className="text-sm font-semibold uppercase tracking-wide text-govblue">Open data</p>
        <h1 className="mt-1 text-3xl font-extrabold text-navy">Our repairs performance</h1>
        <p className="mt-3 max-w-3xl text-ink">
          Under the Right to Repair initiative we publish how we are doing on housing repairs, so residents can see
          how quickly we respond and complete work. These figures are based on{' '}
          <strong>{metrics.totalCases} repairs</strong> reported through the service and were last updated on {today}.
        </p>
      </div>

      <PublicPerformancePanel metrics={metrics} />

      <Callout tone="info" title="About these figures">
        <p>
          This is a prototype, so the numbers are drawn from a small set of mock repairs and are illustrative only. In
          a live service these would update automatically and cover a defined reporting period.
        </p>
      </Callout>
    </div>
  )
}
