import { useState, type FormEvent, type ReactNode } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, Sparkles, ScrollText, Mail, Phone, ShieldAlert, StickyNote } from 'lucide-react'
import { useRepairs } from '../state/RepairsContext'
import { SLA_POLICY, isOverdue, suggestPriority } from '../lib/policy'
import { formatDate, formatDateTime, relativeTime } from '../lib/format'
import { StatusBadge } from '../components/StatusBadge'
import { PriorityBadge } from '../components/PriorityBadge'
import { Tag } from '../components/Tag'
import { Timeline } from '../components/Timeline'
import { EvidenceCard } from '../components/EvidenceCard'
import { Card, CardHeader } from '../components/Card'
import { Button, buttonClasses } from '../components/Button'
import { Callout } from '../components/Callout'
import { CaseActions } from './CaseActions'

export function CaseDetail() {
  const { ref } = useParams()
  const { getRepair, addNote, updatePriority } = useRepairs()
  const repair = ref ? getRepair(ref) : undefined
  const [noteText, setNoteText] = useState('')

  if (!repair) {
    return (
      <div className="mx-auto max-w-2xl text-center">
        <h1 className="text-2xl font-bold text-navy">Case not found</h1>
        <p className="mt-2 text-ink">No case with reference {ref} exists in this prototype session.</p>
        <Link to="/officer/queue" className={buttonClasses('primary', 'mt-6')}>
          Back to queue
        </Link>
      </div>
    )
  }

  const suggestion = suggestPriority(repair.category, repair.description, {
    vulnerable: repair.resident.vulnerable,
    urgentReported: repair.urgentReported,
  })
  const suggestionDiffers = suggestion.priority !== repair.priority
  const sla = SLA_POLICY[repair.priority]
  const overdue = isOverdue(repair)

  function submitNote(e: FormEvent) {
    e.preventDefault()
    if (!noteText.trim()) return
    addNote(repair!.reference, noteText.trim())
    setNoteText('')
  }

  return (
    <div className="space-y-6">
      <Link to="/officer/queue" className="inline-flex items-center gap-1 text-sm font-semibold text-govblue hover:underline">
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        Repairs queue
      </Link>

      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-3xl font-extrabold text-navy">{repair.reference}</h1>
            {overdue && <Tag tone="red">Overdue</Tag>}
          </div>
          <p className="mt-1 text-midgrey">
            {repair.category} · Reported {formatDateTime(repair.submittedAt)}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <PriorityBadge priority={repair.priority} />
          <StatusBadge status={repair.status} />
        </div>
      </div>

      {overdue && (
        <Callout tone="warning" title="This case has breached its SLA">
          Acknowledgement was due by {formatDateTime(repair.acknowledgementDeadline)}. Prioritise this case.
        </Callout>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main column */}
        <div className="space-y-6 lg:col-span-2">
          <Card>
            <CardHeader title="Resident & repair details" />
            <div className="grid gap-x-6 gap-y-4 p-5 sm:grid-cols-2">
              <Detail label="Resident">{repair.resident.name}</Detail>
              <Detail label="Address">{repair.resident.address}</Detail>
              <Detail label="Email">
                <span className="inline-flex items-center gap-1">
                  <Mail className="h-3.5 w-3.5 text-midgrey" aria-hidden="true" />
                  {repair.resident.email || '—'}
                </span>
              </Detail>
              <Detail label="Phone">
                <span className="inline-flex items-center gap-1">
                  <Phone className="h-3.5 w-3.5 text-midgrey" aria-hidden="true" />
                  {repair.resident.phone || '—'}
                </span>
              </Detail>
              <div className="sm:col-span-2">
                <p className="text-sm font-medium text-midgrey">Description</p>
                <p className="mt-1 text-ink">{repair.description}</p>
              </div>
              {(repair.riskFlags.length > 0 || repair.resident.vulnerable) && (
                <div className="sm:col-span-2">
                  <p className="flex items-center gap-1.5 text-sm font-medium text-midgrey">
                    <ShieldAlert className="h-4 w-4 text-red-600" aria-hidden="true" />
                    Risk flags
                  </p>
                  <div className="mt-1.5 flex flex-wrap gap-2">
                    {repair.resident.vulnerable && <Tag tone="red">Vulnerable household</Tag>}
                    {repair.riskFlags.map((f) => (
                      <Tag key={f} tone="amber">
                        {f}
                      </Tag>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </Card>

          <Card>
            <CardHeader title="Evidence" subtitle={`${repair.evidence.length} item${repair.evidence.length === 1 ? '' : 's'} attached`} />
            <div className="p-5">
              {repair.evidence.length === 0 ? (
                <p className="text-sm text-midgrey">No evidence attached.</p>
              ) : (
                <ul className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                  {repair.evidence.map((f) => (
                    <li key={f.id}>
                      <EvidenceCard file={f} />
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </Card>

          <Card>
            <CardHeader title="Case timeline" />
            <div className="p-5">
              <Timeline events={repair.timeline} />
            </div>
          </Card>

          <Card>
            <CardHeader title="Internal notes" subtitle="Only visible to council staff." />
            <div className="p-5">
              <ul className="space-y-3">
                {repair.notes.length === 0 && <li className="text-sm text-midgrey">No internal notes yet.</li>}
                {repair.notes.map((n) => (
                  <li key={n.id} className="rounded-lg bg-slate-50 p-3">
                    <div className="flex items-baseline justify-between gap-3">
                      <p className="flex items-center gap-1.5 text-sm font-semibold text-navy">
                        <StickyNote className="h-3.5 w-3.5 text-midgrey" aria-hidden="true" />
                        {n.author}
                      </p>
                      <time className="text-xs text-midgrey" dateTime={n.timestamp}>
                        {formatDateTime(n.timestamp)}
                      </time>
                    </div>
                    <p className="mt-1 text-sm text-ink">{n.text}</p>
                  </li>
                ))}
              </ul>
              <form onSubmit={submitNote} className="mt-4">
                <label htmlFor="internal-note" className="sr-only">
                  Add an internal note
                </label>
                <textarea
                  id="internal-note"
                  value={noteText}
                  onChange={(e) => setNoteText(e.target.value)}
                  placeholder="Add an internal note…"
                  className="block min-h-[4rem] w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm placeholder:text-slate-400 focus:border-govblue focus:outline-none"
                />
                <Button type="submit" variant="secondary" className="mt-2" disabled={!noteText.trim()}>
                  Add note
                </Button>
              </form>
            </div>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <CaseActions repair={repair} />

          {/* AI-style suggested priority */}
          <Card>
            <CardHeader
              title={
                <span className="inline-flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-govblue" aria-hidden="true" />
                  Suggested priority
                </span>
              }
              subtitle="Generated from the category and description."
            />
            <div className="space-y-3 p-5">
              <div className="flex items-center justify-between">
                <span className="text-sm text-midgrey">Recommendation</span>
                <PriorityBadge priority={suggestion.priority} />
              </div>
              <p className="text-sm text-ink">{suggestion.rationale}</p>
              {suggestion.matchedKeywords.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {suggestion.matchedKeywords.map((k) => (
                    <Tag key={k} tone="amber">
                      {k}
                    </Tag>
                  ))}
                </div>
              )}
              {suggestionDiffers ? (
                <div className="rounded-lg border border-amber-200 bg-amber-50 p-3">
                  <p className="text-sm text-amber-900">
                    Current priority is <strong>{repair.priority}</strong> but the suggestion is{' '}
                    <strong>{suggestion.priority}</strong>.
                  </p>
                  <Button
                    variant="secondary"
                    className="mt-2"
                    onClick={() =>
                      updatePriority(
                        repair.reference,
                        suggestion.priority,
                        'Applied suggested priority based on category and description.',
                      )
                    }
                  >
                    Apply suggested priority
                  </Button>
                </div>
              ) : (
                <p className="text-sm font-medium text-govgreen">Matches the current priority.</p>
              )}
            </div>
          </Card>

          {/* SLA / policy guidance */}
          <Card>
            <CardHeader
              title={
                <span className="inline-flex items-center gap-2">
                  <ScrollText className="h-4 w-4 text-govblue" aria-hidden="true" />
                  SLA &amp; policy guidance
                </span>
              }
              subtitle={`${repair.priority} repair`}
            />
            <div className="space-y-3 p-5 text-sm">
              <p className="text-ink">{sla.summary}</p>
              <dl className="space-y-2">
                <GuidanceRow label="Acknowledge within" value={sla.acknowledgeWithin} />
                <GuidanceRow label="Repair target" value={sla.repairWithin} />
                <GuidanceRow
                  label="Acknowledgement deadline"
                  value={formatDateTime(repair.acknowledgementDeadline)}
                  warn={overdue}
                  hint={relativeTime(repair.acknowledgementDeadline)}
                />
                <GuidanceRow
                  label="Target completion"
                  value={formatDate(repair.estimatedCompletion)}
                  hint={relativeTime(repair.estimatedCompletion)}
                />
              </dl>
              <div className="rounded-lg bg-slate-50 p-3">
                <p className="text-xs font-semibold uppercase tracking-wide text-midgrey">Examples at this priority</p>
                <ul className="mt-1 list-disc space-y-0.5 pl-4 text-xs text-ink">
                  {sla.examples.slice(0, 3).map((ex) => (
                    <li key={ex}>{ex}</li>
                  ))}
                </ul>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}

function Detail({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div>
      <p className="text-sm font-medium text-midgrey">{label}</p>
      <p className="mt-0.5 font-semibold text-ink">{children}</p>
    </div>
  )
}

function GuidanceRow({
  label,
  value,
  hint,
  warn,
}: {
  label: string
  value: string
  hint?: string
  warn?: boolean
}) {
  return (
    <div className="flex items-baseline justify-between gap-3">
      <dt className="text-midgrey">{label}</dt>
      <dd className={`text-right font-semibold ${warn ? 'text-red-700' : 'text-ink'}`}>
        {value}
        {hint && <span className="block text-xs font-normal text-midgrey">{hint}</span>}
      </dd>
    </div>
  )
}
