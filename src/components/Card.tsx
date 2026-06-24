import type { ReactNode } from 'react'

export function Card({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <div className={`rounded-xl border border-slate-200 bg-white shadow-card ${className}`}>{children}</div>
  )
}

export function CardHeader({
  title,
  subtitle,
  action,
  className = '',
}: {
  title: ReactNode
  subtitle?: ReactNode
  action?: ReactNode
  className?: string
}) {
  return (
    <div className={`flex items-start justify-between gap-4 border-b border-slate-200 px-5 py-4 ${className}`}>
      <div>
        <h2 className="text-base font-bold text-navy">{title}</h2>
        {subtitle && <p className="mt-0.5 text-sm text-midgrey">{subtitle}</p>}
      </div>
      {action}
    </div>
  )
}
