import type { RepairStatus } from '../types'

// GOV.UK tag colours mapped to repair statuses.
const styles: Record<RepairStatus, string> = {
  Submitted: 'bg-[#eeefef] text-[#383f43]',
  Acknowledged: 'bg-[#d2e2f1] text-[#144e81]',
  Triaged: 'bg-[#d2e2f1] text-[#144e81]',
  'Appointment booked': 'bg-[#bfe3e0] text-[#10403c]',
  'In progress': 'bg-[#fff7bf] text-[#594d00]',
  'Awaiting information': 'bg-[#fcd6c3] text-[#6e3619]',
  Completed: 'bg-[#cce2d8] text-[#005a30]',
}

export function StatusBadge({ status }: { status: RepairStatus }) {
  return <span className={`inline-block px-2 py-1 text-sm font-bold ${styles[status]}`}>{status}</span>
}
