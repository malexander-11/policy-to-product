// A live SLA countdown to a deadline. The owning view passes a ticking `now`
// (from useNow) so these update every second across the dispatcher.

function fmt(ms: number): string {
  const totalMin = Math.floor(Math.abs(ms) / 60_000)
  const d = Math.floor(totalMin / 1440)
  const h = Math.floor((totalMin % 1440) / 60)
  const m = totalMin % 60
  if (d > 0) return `${d}d ${h}h`
  if (h > 0) return `${h}h ${String(m).padStart(2, '0')}m`
  return `${m}m`
}

export function SlaCountdown({
  deadline,
  now,
  className = '',
}: {
  deadline: string
  now: Date
  className?: string
}) {
  const ms = new Date(deadline).getTime() - now.getTime()
  const breached = ms <= 0
  const hrs = ms / 3_600_000
  const tone = breached || hrs < 2 ? 'text-emergency' : hrs < 24 ? 'text-urgent-dark' : 'text-midgrey'
  return (
    <span className={`tabular-nums font-semibold ${tone} ${className}`}>
      {breached ? `SLA breached ${fmt(ms)} ago` : `${fmt(ms)} remaining`}
    </span>
  )
}
