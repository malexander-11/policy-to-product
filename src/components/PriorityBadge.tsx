import type { Priority } from '../types'

// GOV.UK tag colours.
const styles: Record<Priority, string> = {
  Emergency: 'bg-[#f6d7d2] text-[#942514]',
  Urgent: 'bg-[#fcd6c3] text-[#6e3619]',
  Routine: 'bg-[#cce2d8] text-[#005a30]',
}

export function PriorityBadge({ priority }: { priority: Priority }) {
  return <span className={`inline-block px-2 py-1 text-sm font-bold ${styles[priority]}`}>{priority}</span>
}
