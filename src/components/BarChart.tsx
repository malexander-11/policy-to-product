export interface BarDatum {
  label: string
  value: number
  display?: string
  tone?: 'blue' | 'green' | 'amber' | 'red' | 'slate'
}

const barTone: Record<NonNullable<BarDatum['tone']>, string> = {
  blue: 'bg-govblue',
  green: 'bg-govgreen',
  amber: 'bg-amber-500',
  red: 'bg-red-500',
  slate: 'bg-slate-400',
}

export function BarChart({ data, ariaLabel }: { data: BarDatum[]; ariaLabel?: string }) {
  const max = Math.max(1, ...data.map((d) => d.value))
  return (
    <ul className="space-y-2.5" aria-label={ariaLabel}>
      {data.map((d) => (
        <li key={d.label} className="flex items-center gap-3">
          <span className="w-32 shrink-0 truncate text-sm text-ink" title={d.label}>
            {d.label}
          </span>
          <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-slate-100">
            <div
              className={`h-full rounded-full ${barTone[d.tone ?? 'blue']}`}
              style={{ width: `${Math.round((d.value / max) * 100)}%` }}
            />
          </div>
          <span className="w-12 shrink-0 text-right text-sm font-semibold tabular-nums text-navy">
            {d.display ?? d.value}
          </span>
        </li>
      ))}
    </ul>
  )
}
