import type { ReactNode } from 'react'

type Tone = 'info' | 'warning' | 'emergency' | 'success'

function WarningIcon({ className }: { className: string }) {
  return (
    <span
      className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-white ${className}`}
      aria-hidden="true"
    >
      <span className="text-xl font-bold leading-none">!</span>
    </span>
  )
}

/**
 * GDS-flavoured callouts:
 *  - info     → inset text (10px grey left border)
 *  - warning  → warning text (black "!" + bold)
 *  - emergency→ warning text (red "!")
 *  - success  → notification banner (green)
 */
export function Callout({
  tone = 'info',
  title,
  children,
  role,
  className = '',
}: {
  tone?: Tone
  title?: ReactNode
  children?: ReactNode
  role?: 'alert' | 'status'
  className?: string
}) {
  if (tone === 'success') {
    return (
      <div className={`border-4 border-govgreen ${className}`} role={role}>
        <div className="bg-govgreen px-4 py-2 text-base font-bold text-white">{title ?? 'Success'}</div>
        <div className="p-4 text-base text-ink">{children}</div>
      </div>
    )
  }

  if (tone === 'warning' || tone === 'emergency') {
    return (
      <div className={`flex items-start gap-3 ${className}`} role={role}>
        <WarningIcon className={tone === 'emergency' ? 'bg-emergency' : 'bg-ink'} />
        <div className="min-w-0 font-bold text-ink">
          {title && <p>{title}</p>}
          {children && <div className={`text-base ${title ? 'mt-0.5' : ''}`}>{children}</div>}
        </div>
      </div>
    )
  }

  return (
    <div className={`border-l-[10px] border-line py-1 pl-4 ${className}`} role={role}>
      {title && <p className="font-bold text-ink">{title}</p>}
      {children && <div className={`text-base text-ink ${title ? 'mt-1' : ''}`}>{children}</div>}
    </div>
  )
}
