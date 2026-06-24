import type { ReactNode } from 'react'

type Tone = 'neutral' | 'red' | 'amber' | 'green' | 'blue'

const tones: Record<Tone, string> = {
  neutral: 'bg-slate-100 text-midgrey ring-line/50',
  red: 'bg-emergency-light text-emergency-dark ring-emergency/30',
  amber: 'bg-urgent-light text-urgent-dark ring-urgent/40',
  green: 'bg-govgreen/10 text-govgreen-dark ring-govgreen/30',
  blue: 'bg-govblue/10 text-govblue-dark ring-govblue/30',
}

export function Tag({
  children,
  tone = 'neutral',
  className = '',
}: {
  children: ReactNode
  tone?: Tone
  className?: string
}) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded px-2 py-0.5 text-xs font-medium ring-1 ring-inset ${tones[tone]} ${className}`}
    >
      {children}
    </span>
  )
}
