import type { RepairStatus } from '../types'

const styles: Record<RepairStatus, string> = {
  Submitted: 'bg-slate-100 text-slate-700 ring-slate-500/30',
  Acknowledged: 'bg-blue-50 text-blue-800 ring-blue-600/30',
  Triaged: 'bg-violet-50 text-violet-800 ring-violet-600/30',
  'Appointment booked': 'bg-cyan-50 text-cyan-800 ring-cyan-600/30',
  'In progress': 'bg-indigo-50 text-indigo-800 ring-indigo-600/30',
  'Awaiting information': 'bg-orange-50 text-orange-900 ring-orange-600/30',
  Completed: 'bg-green-50 text-green-800 ring-green-600/30',
}

export function StatusBadge({ status }: { status: RepairStatus }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${styles[status]}`}
    >
      {status}
    </span>
  )
}
