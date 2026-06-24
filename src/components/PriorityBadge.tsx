import type { Priority } from '../types'

const styles: Record<Priority, string> = {
  Emergency: 'bg-red-50 text-red-800 ring-red-600/30',
  Urgent: 'bg-amber-50 text-amber-900 ring-amber-600/40',
  Standard: 'bg-slate-100 text-slate-700 ring-slate-500/30',
}

const dot: Record<Priority, string> = {
  Emergency: 'bg-red-600',
  Urgent: 'bg-amber-500',
  Standard: 'bg-slate-400',
}

export function PriorityBadge({ priority }: { priority: Priority }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${styles[priority]}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${dot[priority]}`} aria-hidden="true" />
      {priority}
    </span>
  )
}
