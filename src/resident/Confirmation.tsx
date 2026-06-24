import { Link, useParams } from 'react-router-dom'
import { CheckCircle2, ArrowRight, Search } from 'lucide-react'
import { useRepairs } from '../state/RepairsContext'
import { SLA_POLICY } from '../lib/policy'
import { formatDate, formatDateTime, relativeTime } from '../lib/format'
import { PriorityBadge } from '../components/PriorityBadge'
import { buttonClasses } from '../components/Button'
import { Card } from '../components/Card'
import type { Priority } from '../types'

const nextSteps: Record<Priority, string[]> = {
  Emergency: [
    'We will contact you within 2 hours to confirm the details.',
    'We will arrange an emergency visit to make the situation safe, usually within 24 hours.',
    'We will then book any follow-up work needed to fully complete the repair.',
  ],
  Urgent: [
    'We will acknowledge your request within 1 working day.',
    'We will triage the repair, assign it to a team and book an appointment with you.',
    'We aim to complete urgent repairs within 7 days.',
  ],
  Standard: [
    'We will acknowledge your request within 5 working days.',
    'We will book an appointment at a time that suits you.',
    'We aim to complete routine repairs within 28 days.',
  ],
}

export function Confirmation() {
  const { ref } = useParams()
  const { getRepair } = useRepairs()
  const repair = ref ? getRepair(ref) : undefined

  if (!repair) {
    return (
      <div className="mx-auto max-w-2xl text-center">
        <h1 className="text-2xl font-bold text-navy">We couldn’t find that request</h1>
        <p className="mt-2 text-ink">The reference {ref} isn’t available in this prototype session.</p>
        <Link to="/track" className={buttonClasses('primary', 'mt-6')}>
          Track a repair
        </Link>
      </div>
    )
  }

  const sla = SLA_POLICY[repair.priority]

  return (
    <div className="mx-auto max-w-3xl">
      {/* GOV.UK-style confirmation panel */}
      <div className="rounded-xl bg-govgreen px-6 py-8 text-center text-white">
        <CheckCircle2 className="mx-auto h-10 w-10" aria-hidden="true" />
        <h1 className="mt-3 text-3xl font-extrabold">Repair request submitted</h1>
        <p className="mt-2 text-white/90">Your reference number is</p>
        <p className="mt-1 text-2xl font-extrabold tracking-wide">{repair.reference}</p>
      </div>

      <p className="mt-6 text-ink">
        Thank you. We have received your repair request and a copy of these details. Save your reference number — you
        can use it to track progress at any time.
      </p>

      <Card className="mt-6 p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-lg font-bold text-navy">Summary</h2>
          <PriorityBadge priority={repair.priority} />
        </div>
        <dl className="mt-4 grid gap-x-6 gap-y-3 sm:grid-cols-2">
          <Detail label="Repair category" value={repair.category} />
          <Detail label="Property" value={repair.resident.address} />
          <Detail label="Priority" value={`${repair.priority} — ${sla.summary}`} />
          <Detail label="Current status" value="Submitted" />
        </dl>
      </Card>

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <Card className="p-5">
          <p className="text-sm font-medium text-midgrey">We will acknowledge your request by</p>
          <p className="mt-1 text-lg font-bold text-navy">{formatDateTime(repair.acknowledgementDeadline)}</p>
          <p className="mt-0.5 text-sm text-midgrey">{relativeTime(repair.acknowledgementDeadline)} (within {sla.acknowledgeWithin})</p>
        </Card>
        <Card className="p-5">
          <p className="text-sm font-medium text-midgrey">Estimated repair timeline</p>
          <p className="mt-1 text-lg font-bold text-navy">By {formatDate(repair.estimatedCompletion)}</p>
          <p className="mt-0.5 text-sm text-midgrey">Target: {sla.repairWithin}</p>
        </Card>
      </div>

      <Card className="mt-4 p-5">
        <h2 className="text-lg font-bold text-navy">What the council will do next</h2>
        <ol className="mt-3 space-y-2">
          {nextSteps[repair.priority].map((step, i) => (
            <li key={i} className="flex gap-3 text-sm text-ink">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-100 text-xs font-bold text-govblue">
                {i + 1}
              </span>
              {step}
            </li>
          ))}
        </ol>
      </Card>

      <Card className="mt-4 p-5">
        <h2 className="text-lg font-bold text-navy">Your next steps</h2>
        <ul className="mt-3 list-disc space-y-1.5 pl-5 text-sm text-ink">
          <li>Make a note of your reference number, {repair.reference}.</li>
          <li>Track your repair online to see status updates and your appointment.</li>
          <li>You can add more photos or information to your repair at any time.</li>
          <li>If the problem gets worse or becomes dangerous, call the emergency line on 0800 123 4567.</li>
        </ul>
        <div className="mt-5 flex flex-col gap-3 sm:flex-row">
          <Link to={`/track/${repair.reference}`} className={buttonClasses('primary')}>
            <Search className="h-5 w-5" aria-hidden="true" />
            Track this repair
          </Link>
          <Link to="/" className={buttonClasses('ghost')}>
            Back to home
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>
      </Card>
    </div>
  )
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-sm font-medium text-midgrey">{label}</dt>
      <dd className="text-sm font-semibold text-ink">{value}</dd>
    </div>
  )
}
