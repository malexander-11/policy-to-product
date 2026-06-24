import { useState, type FormEvent, type ReactNode } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Bell, CalendarClock, Hammer, MessageSquarePlus, Upload, ImagePlus } from 'lucide-react'
import { useRepairs } from '../state/RepairsContext'
import type { EvidenceFile, Repair } from '../types'
import { isOverdue } from '../lib/policy'
import { formatDate, formatDateTime, relativeTime } from '../lib/format'
import { StatusBadge } from '../components/StatusBadge'
import { PriorityBadge } from '../components/PriorityBadge'
import { Tag } from '../components/Tag'
import { Timeline } from '../components/Timeline'
import { EvidenceCard } from '../components/EvidenceCard'
import { Card, CardHeader } from '../components/Card'
import { Button, buttonClasses } from '../components/Button'
import { TextInput } from '../components/Field'

function nextUpdate(repair: Repair): string {
  switch (repair.status) {
    case 'Submitted':
      return `We will acknowledge your request by ${formatDateTime(repair.acknowledgementDeadline)}.`
    case 'Acknowledged':
    case 'Triaged':
      return 'We will contact you to arrange an appointment.'
    case 'Appointment booked':
      return repair.appointment
        ? `Your appointment is ${formatDate(repair.appointment.date)}, ${repair.appointment.window}.`
        : 'Your appointment will be confirmed shortly.'
    case 'In progress':
      return 'Work is underway. We will update you when it is complete.'
    case 'Awaiting information':
      return 'We are waiting for more information from you before we can continue.'
    case 'Completed':
      return 'This repair is complete. Contact us if the problem returns.'
    default:
      return 'We will keep you updated.'
  }
}

export function TrackRepair() {
  const { ref } = useParams()
  const { repairs, getRepair } = useRepairs()

  if (ref) {
    const repair = getRepair(ref)
    if (!repair) return <NotFound reference={ref} />
    return <TrackDetail repair={repair} />
  }

  return <TrackLookup repairs={repairs} />
}

function TrackLookup({ repairs }: { repairs: Repair[] }) {
  const navigate = useNavigate()
  const { getRepair } = useRepairs()
  const [value, setValue] = useState('')
  const [error, setError] = useState<string | undefined>()

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    const trimmed = value.trim().toUpperCase()
    if (!trimmed) {
      setError('Enter your repair reference number')
      return
    }
    if (!getRepair(trimmed)) {
      setError(`We couldn’t find a repair with reference ${trimmed} in this prototype.`)
      return
    }
    navigate(`/track/${trimmed}`)
  }

  const recent = [...repairs].sort(
    (a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime(),
  )

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="text-3xl font-extrabold text-navy">Track a repair</h1>
      <p className="mt-2 text-ink">Enter the reference number from your confirmation to see the latest status.</p>

      <form onSubmit={handleSubmit} noValidate className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-end">
        <div className="flex-1">
          <TextInput
            id="reference"
            label="Repair reference number"
            placeholder="e.g. RR-2026-0501"
            hint="It looks like RR-2026-0000."
            value={value}
            onChange={(e) => {
              setValue(e.target.value)
              setError(undefined)
            }}
            error={error}
          />
        </div>
        <Button type="submit" className="sm:mb-0.5">
          Track repair
        </Button>
      </form>

      <h2 className="mt-10 text-lg font-bold text-navy">Recent requests in this prototype</h2>
      <p className="mt-1 text-sm text-midgrey">
        In a real service you would only see your own repairs after signing in. For the demo, all mock cases are listed
        here.
      </p>
      <ul className="mt-4 space-y-3">
        {recent.map((r) => (
          <li key={r.reference}>
            <Link
              to={`/track/${r.reference}`}
              className="flex flex-col gap-2 rounded-xl border border-slate-200 bg-white p-4 shadow-card transition-shadow hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy sm:flex-row sm:items-center sm:justify-between"
            >
              <div>
                <p className="font-bold text-navy">{r.reference}</p>
                <p className="text-sm text-ink">
                  {r.category} · {r.resident.address}
                </p>
                <p className="text-xs text-midgrey">Reported {formatDate(r.submittedAt)}</p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                {isOverdue(r) && <Tag tone="red">Overdue</Tag>}
                <PriorityBadge priority={r.priority} />
                <StatusBadge status={r.status} />
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}

function TrackDetail({ repair }: { repair: Repair }) {
  const { addResidentNote, addEvidence } = useRepairs()
  const [note, setNote] = useState('')
  const [noteSaved, setNoteSaved] = useState(false)

  const overdue = isOverdue(repair)
  const latest = [...repair.timeline].sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
  )[0]

  function submitNote(e: FormEvent) {
    e.preventDefault()
    if (!note.trim()) return
    addResidentNote(repair.reference, note.trim())
    setNote('')
    setNoteSaved(true)
  }

  function addSampleEvidence() {
    const file: EvidenceFile = {
      id: `res-${Date.now()}`,
      name: `update-photo-${repair.evidence.length + 1}.jpg`,
      type: 'image',
      sizeLabel: '1.9 MB',
      uploadedBy: 'resident',
    }
    addEvidence(repair.reference, file)
  }

  function handleFiles(files: FileList | null) {
    if (!files) return
    Array.from(files).forEach((f, i) =>
      addEvidence(repair.reference, {
        id: `res-up-${Date.now()}-${i}`,
        name: f.name,
        type: f.type.startsWith('video') ? 'video' : 'image',
        sizeLabel: f.size < 1024 * 1024 ? `${Math.round(f.size / 1024)} KB` : `${(f.size / 1048576).toFixed(1)} MB`,
        uploadedBy: 'resident',
      }),
    )
  }

  return (
    <div className="mx-auto max-w-5xl">
      <Link to="/track" className="inline-flex items-center gap-1 text-sm font-semibold text-govblue hover:underline">
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        All repairs
      </Link>

      <div className="mt-3 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-3xl font-extrabold text-navy">{repair.category} repair</h1>
          <p className="mt-1 text-midgrey">
            Reference <span className="font-semibold text-ink">{repair.reference}</span> · Reported{' '}
            {formatDate(repair.submittedAt)}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {overdue && <Tag tone="red">Overdue</Tag>}
          <PriorityBadge priority={repair.priority} />
          <StatusBadge status={repair.status} />
        </div>
      </div>

      {/* Latest update highlight */}
      <div className="mt-5 rounded-xl border-l-4 border-govblue bg-blue-50/70 p-4">
        <p className="flex items-center gap-2 text-sm font-semibold text-govblue">
          <Bell className="h-4 w-4" aria-hidden="true" /> Latest update
        </p>
        <p className="mt-1 font-semibold text-navy">{latest?.title ?? 'Repair reported'}</p>
        {latest?.description && <p className="text-sm text-ink">{latest.description}</p>}
        <p className="mt-1 text-xs text-midgrey">{latest ? relativeTime(latest.timestamp) : ''}</p>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card>
            <CardHeader title="Progress" subtitle="Every update to your repair appears here." />
            <div className="p-5">
              <Timeline events={repair.timeline} />
            </div>
          </Card>

          {repair.evidence.length > 0 && (
            <Card>
              <CardHeader title="Your evidence" subtitle="Photos and video attached to this repair." />
              <div className="p-5">
                <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                  {repair.evidence.map((f) => (
                    <li key={f.id}>
                      <EvidenceCard file={f} />
                    </li>
                  ))}
                </ul>
              </div>
            </Card>
          )}
        </div>

        <div className="space-y-6">
          <Card className="p-5">
            <h2 className="text-base font-bold text-navy">What happens next</h2>
            <p className="mt-2 flex gap-2 text-sm text-ink">
              <CalendarClock className="h-5 w-5 shrink-0 text-govblue" aria-hidden="true" />
              {nextUpdate(repair)}
            </p>
            <dl className="mt-4 space-y-3 border-t border-slate-200 pt-4 text-sm">
              {repair.appointment && (
                <Row label="Appointment">
                  {formatDate(repair.appointment.date)}, {repair.appointment.window}
                </Row>
              )}
              <Row label="Priority">{repair.priority}</Row>
              <Row label="Status">{repair.status}</Row>
              <Row label="Acknowledge by">{formatDateTime(repair.acknowledgementDeadline)}</Row>
              <Row label="Target completion">{formatDate(repair.estimatedCompletion)}</Row>
              <Row label="Assigned to">
                {repair.assignedTo ? (
                  <span className="inline-flex items-center gap-1">
                    <Hammer className="h-3.5 w-3.5 text-midgrey" aria-hidden="true" />
                    {repair.assignedTo}
                  </span>
                ) : (
                  'Awaiting allocation'
                )}
              </Row>
            </dl>
          </Card>

          <Card className="p-5">
            <h2 className="text-base font-bold text-navy">Add to this repair</h2>
            <form onSubmit={submitNote} className="mt-3">
              <label htmlFor="resident-note" className="block text-sm font-semibold text-navy">
                Add a note
              </label>
              <textarea
                id="resident-note"
                value={note}
                onChange={(e) => {
                  setNote(e.target.value)
                  setNoteSaved(false)
                }}
                placeholder="Tell us anything that has changed, or ask a question."
                className="mt-1.5 block min-h-[5rem] w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-ink shadow-sm placeholder:text-slate-400 focus:border-govblue focus:outline-none"
              />
              <div className="mt-2 flex items-center gap-3">
                <Button type="submit" variant="secondary" disabled={!note.trim()}>
                  <MessageSquarePlus className="h-4 w-4" aria-hidden="true" />
                  Add note
                </Button>
                {noteSaved && <span className="text-sm font-semibold text-govgreen">Note added</span>}
              </div>
            </form>

            <div className="mt-5 border-t border-slate-200 pt-4">
              <p className="text-sm font-semibold text-navy">Add more evidence</p>
              <div className="mt-2 flex flex-wrap gap-2">
                <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-dashed border-slate-400 bg-white px-3 py-2 text-sm font-semibold text-navy hover:bg-slate-50">
                  <Upload className="h-4 w-4" aria-hidden="true" />
                  Choose files
                  <input
                    type="file"
                    multiple
                    accept="image/*,video/*"
                    className="sr-only"
                    onChange={(e) => {
                      handleFiles(e.target.files)
                      e.target.value = ''
                    }}
                  />
                </label>
                <button
                  type="button"
                  onClick={addSampleEvidence}
                  className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-navy hover:bg-slate-50"
                >
                  <ImagePlus className="h-4 w-4" aria-hidden="true" />
                  Add example photo
                </button>
              </div>
            </div>
          </Card>

          <Link to="/performance" className={buttonClasses('ghost', 'w-full')}>
            See how we are performing
          </Link>
        </div>
      </div>
    </div>
  )
}

function Row({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex justify-between gap-3">
      <dt className="text-midgrey">{label}</dt>
      <dd className="text-right font-semibold text-ink">{children}</dd>
    </div>
  )
}

function NotFound({ reference }: { reference: string }) {
  return (
    <div className="mx-auto max-w-2xl text-center">
      <h1 className="text-2xl font-bold text-navy">We couldn’t find that repair</h1>
      <p className="mt-2 text-ink">No repair with reference {reference} exists in this prototype session.</p>
      <Link to="/track" className={buttonClasses('primary', 'mt-6')}>
        Back to track a repair
      </Link>
    </div>
  )
}
