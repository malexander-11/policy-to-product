import type { ReactNode } from 'react'

type Tone = 'neutral' | 'red' | 'amber' | 'green' | 'blue'

// GOV.UK tag colours.
const tones: Record<Tone, string> = {
  neutral: 'bg-[#eeefef] text-[#383f43]',
  red: 'bg-[#f6d7d2] text-[#942514]',
  amber: 'bg-[#fcd6c3] text-[#6e3619]',
  green: 'bg-[#cce2d8] text-[#005a30]',
  blue: 'bg-[#d2e2f1] text-[#144e81]',
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
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-sm font-bold ${tones[tone]} ${className}`}>
      {children}
    </span>
  )
}
