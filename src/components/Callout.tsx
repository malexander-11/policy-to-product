import type { ReactNode } from 'react'
import { AlertTriangle, Info, Phone, CheckCircle2 } from 'lucide-react'

type Tone = 'info' | 'warning' | 'emergency' | 'success'

const config: Record<Tone, { wrap: string; icon: ReactNode; title: string }> = {
  info: {
    wrap: 'border-govblue bg-govblue/5',
    icon: <Info className="h-5 w-5 text-govblue" aria-hidden="true" />,
    title: 'text-ink',
  },
  warning: {
    wrap: 'border-urgent bg-urgent-light',
    icon: <AlertTriangle className="h-5 w-5 text-urgent-dark" aria-hidden="true" />,
    title: 'text-urgent-dark',
  },
  emergency: {
    wrap: 'border-emergency bg-emergency-light',
    icon: <Phone className="h-5 w-5 text-emergency" aria-hidden="true" />,
    title: 'text-emergency-dark',
  },
  success: {
    wrap: 'border-govgreen bg-govgreen/5',
    icon: <CheckCircle2 className="h-5 w-5 text-govgreen" aria-hidden="true" />,
    title: 'text-govgreen-dark',
  },
}

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
  const c = config[tone]
  return (
    <div className={`rounded-r-md border-l-4 p-4 ${c.wrap} ${className}`} role={role}>
      <div className="flex gap-3">
        <div className="mt-0.5 shrink-0">{c.icon}</div>
        <div className="min-w-0 flex-1">
          {title && <p className={`font-bold ${c.title}`}>{title}</p>}
          {children && <div className={`text-sm text-ink ${title ? 'mt-1' : ''}`}>{children}</div>}
        </div>
      </div>
    </div>
  )
}
