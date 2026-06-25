import { Crown } from 'lucide-react'

/** GOV.UK masthead lockup: Crown glyph + "GOV.UK" wordmark. */
export function GovukLogo({ className = '' }: { className?: string }) {
  return (
    <span className={`inline-flex items-center gap-1 ${className}`}>
      <Crown className="h-[28px] w-[28px]" aria-hidden="true" />
      <span className="text-2xl font-bold leading-none tracking-tight">GOV.UK</span>
    </span>
  )
}
