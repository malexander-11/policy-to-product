import type { RepairStatus } from '../types'

const styles: Record<RepairStatus, string> = {
  Submitted: 'bg-slate-100 text-ink ring-line/60',
  Acknowledged: 'bg-govblue/10 text-govblue-dark ring-govblue/30',
  Triaged: 'bg-govblue/10 text-govblue-dark ring-govblue/30',
  'Appointment booked': 'bg-govblue/15 text-govblue-dark ring-govblue/40',
  'In progress': 'bg-govblue/15 text-govblue-dark ring-govblue/40',
  'Awaiting information': 'bg-urgent-light text-urgent-dark ring-urgent/40',
  Completed: 'bg-govgreen/10 text-govgreen-dark ring-govgreen/30',
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
