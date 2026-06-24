import type { Priority } from '../types'

const styles: Record<Priority, string> = {
  Emergency: 'bg-emergency-light text-emergency-dark ring-emergency/40',
  Urgent: 'bg-urgent-light text-urgent-dark ring-urgent/50',
  Routine: 'bg-govgreen/10 text-govgreen-dark ring-govgreen/30',
}

const dot: Record<Priority, string> = {
  Emergency: 'bg-emergency',
  Urgent: 'bg-urgent',
  Routine: 'bg-govgreen',
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
