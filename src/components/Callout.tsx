import type { ReactNode } from 'react'
import { AlertTriangle, Info, Phone, CheckCircle2 } from 'lucide-react'

type Tone = 'info' | 'warning' | 'emergency' | 'success'

const config: Record<Tone, { wrap: string; icon: ReactNode; title: string }> = {
  info: {
    wrap: 'border-govblue bg-blue-50/70',
    icon: <Info className="h-5 w-5 text-govblue" aria-hidden="true" />,
    title: 'text-navy',
  },
  warning: {
    wrap: 'border-amber-500 bg-amber-50',
    icon: <AlertTriangle className="h-5 w-5 text-amber-600" aria-hidden="true" />,
    title: 'text-amber-900',
  },
  emergency: {
    wrap: 'border-red-600 bg-red-50',
    icon: <Phone className="h-5 w-5 text-red-600" aria-hidden="true" />,
    title: 'text-red-800',
  },
  success: {
    wrap: 'border-govgreen bg-green-50',
    icon: <CheckCircle2 className="h-5 w-5 text-govgreen" aria-hidden="true" />,
    title: 'text-green-900',
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
