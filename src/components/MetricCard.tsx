import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'

export function MetricCard({
  label,
  value,
  sublabel,
  icon,
  tone = 'default',
  to,
}: {
  label: string
  value: ReactNode
  sublabel?: ReactNode
  icon?: ReactNode
  tone?: 'default' | 'red' | 'amber' | 'green' | 'blue'
  to?: string
}) {
  const accent: Record<string, string> = {
    default: 'text-ink',
    red: 'text-red-700',
    amber: 'text-amber-700',
    green: 'text-govgreen',
    blue: 'text-govblue',
  }

  const inner = (
    <div className="flex h-full flex-col border border-line bg-white p-5">
      <div className="flex items-start justify-between gap-2">
        <p className="text-sm font-medium text-midgrey">{label}</p>
        {icon && <div className="shrink-0 text-slate-400">{icon}</div>}
      </div>
      <p className={`mt-2 text-3xl font-extrabold tracking-tight ${accent[tone]}`}>{value}</p>
      {sublabel && <p className="mt-1 text-sm text-midgrey">{sublabel}</p>}
    </div>
  )

  if (to) {
    return (
      <Link to={to} className="block">

        {inner}
      </Link>
    )
  }
  return inner
}
