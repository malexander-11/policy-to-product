import { useEffect, useMemo, useState } from 'react'
import {
  Search,
  Send,
  ImagePlus,
  Camera,
  CheckCircle2,
  CircleDot,
  Circle,
  ShieldCheck,
  MessageSquare,
  Building2,
} from 'lucide-react'
import type { EvidenceFile, Repair } from '../types'
import { useRepairs, nextReference } from '../state/RepairsContext'
import { analyzeReport } from '../lib/agent'
import { deadlinesFrom, SLA_POLICY } from '../lib/policy'
import { formatDate, formatDateTime, relativeTime } from '../lib/format'
import { Card, CardHeader } from '../components/Card'
import { Button } from '../components/Button'
import { TextArea } from '../components/Field'
import { EvidenceCard } from '../components/EvidenceCard'
import { PriorityBadge } from '../components/PriorityBadge'
import { Callout } from '../components/Callout'
import { IssueIcon } from '../components/IssueIcon'
import { ErrorSummary } from '../components/ErrorSummary'

// The simulated signed-in resident.
const ME = {
  name: 'Aisha Bello',
  address: '12 Acacia House, Flat 4',
  email: 'aisha.bello@example.com',
  phone: '07700 900100',
  vulnerable: false,
}

const STEP_LABELS = ['Acknowledged', 'Engineer assigned', 'Repair scheduled', 'Complete']

/** Furthest reached step index (0..3) for the 4-step resident tracker. */
function reachedStep(r: Repair): number {
  if (r.status === 'Completed') return 3
  if (r.status === 'Appointment booked' || r.status === 'In progress') return 2
  if (r.acknowledgedAt) return 0
  return 0
}

function bytesLabel(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

let evId = 0

type Step = 'report' | 'analysing' | 'result'

export function ResidentView() {
  const { repairs, addRepair } = useRepairs()

  const myRepairs = useMemo(
    () =>
      repairs
        .filter((r) => r.resident.address === ME.address)
        .sort((a, b) => (a.submittedAt < b.submittedAt ? 1 : -1)),
    [repairs],
  )

  const [step, setStep] = useState<Step>(() => (myRepairs.length ? 'result' : 'report'))
  const [activeRef, setActiveRef] = useState<string | null>(myRepairs[0]?.reference ?? null)

  const active = repairs.find((r) => r.reference === activeRef) ?? myRepairs[0]

  // Drive the brief "Analysing…" state.
  useEffect(() => {
    if (step !== 'analysing') return
    const id = setTimeout(() => setStep('result'), 1600)
    return () => clearTimeout(id)
  }, [step])

  if (step === 'analysing') return <AnalysingStep />
  if (step === 'result' && active) {
    return (
      <ResultView
        repair={active}
        onReportAnother={() => {
          setActiveRef(null)
          setStep('report')
        }}
      />
    )
  }

  return (
    <ReportStep
      onSubmit={(description, evidence) => {
        const ref = nextReference()
        const submittedAt = new Date().toISOString()
        const a = analyzeReport(description)
        const { acknowledgementDeadline, estimatedCompletion } = deadlinesFrom(submittedAt, a.priority)
        const repair: Repair = {
          reference: ref,
          resident: { ...ME },
          category: a.category,
          description,
          priority: a.priority,
          status: 'Acknowledged',
          submittedAt,
          acknowledgementDeadline,
          estimatedCompletion,
          riskFlags: a.emergencySignals ? ['Emergency indicators in report'] : [],
          urgentReported: false,
          evidence,
          timeline: [
            { id: `${ref}-t1`, timestamp: submittedAt, title: 'Repair reported', description, actor: 'resident' },
            {
              id: `${ref}-t2`,
              timestamp: submittedAt,
              title: 'Repair acknowledged',
              description: 'Acknowledged automatically by Patch and sent to the council for triage.',
              actor: 'council',
            },
          ],
          notes: [],
          acknowledgedAt: submittedAt,
          issueType: a.issueType,
          aiSummary: a.plainSummary,
          suggestedTrade: a.suggestedTrade,
          estRepairHours: a.estRepairHours,
          materials: a.materials,
        }
        addRepair(repair)
        setActiveRef(ref)
        setStep('analysing')
      }}
    />
  )
}

// ---------------------------------------------------------------------------
// Step 1 — Report
// ---------------------------------------------------------------------------

function ReportStep({ onSubmit }: { onSubmit: (description: string, evidence: EvidenceFile[]) => void }) {
  const [description, setDescription] = useState('')
  const [evidence, setEvidence] = useState<EvidenceFile[]>([])
  const [error, setError] = useState<string | undefined>()

  function addFiles(files: FileList | null) {
    if (!files) return
    const next = Array.from(files).map<EvidenceFile>((f) => ({
      id: `ev-${(evId += 1)}`,
      name: f.name,
      type: f.type.startsWith('video') ? 'video' : 'image',
      sizeLabel: bytesLabel(f.size),
      uploadedBy: 'resident',
    }))
    setEvidence((xs) => [...xs, ...next])
  }

  function addSample() {
    setEvidence((xs) => [
      ...xs,
      { id: `ev-${(evId += 1)}`, name: `photo-${xs.length + 1}.jpg`, type: 'image', sizeLabel: '1.8 MB', uploadedBy: 'resident' },
    ])
  }

  function submit(e: React.FormEvent) {
    e.preventDefault()
    if (description.trim().length < 8) {
      setError('Please describe the repair in a little more detail.')
      return
    }
    onSubmit(description.trim(), evidence)
  }

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">Report a repair</h1>
      <p className="mt-2 text-midgrey">
        Tell us what's wrong and Patch will work out how urgent it is and what needs to happen next.
      </p>

      <div className="mt-6">
        <ErrorSummary errors={error ? [{ id: 'description', text: error }] : []} />
      </div>

      <form onSubmit={submit}>
        <Card>
          <div className="space-y-5 p-5">
            <TextArea
              id="description"
              label="What's the problem?"
              hint="For example: “No heating and the boiler is making a banging noise.”"
              rows={4}
              required
              value={description}
              error={error}
              onChange={(e) => {
                setDescription(e.target.value)
                if (error) setError(undefined)
              }}
            />

            <div>
              <p className="text-sm font-semibold text-ink">Add a photo or video (optional)</p>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <label className="inline-flex cursor-pointer items-center gap-2 rounded border border-line bg-white px-3 py-2 text-sm font-semibold text-ink hover:bg-slate-50">
                  <ImagePlus className="h-4 w-4" aria-hidden="true" />
                  Choose files
                  <input type="file" accept="image/*,video/*" multiple className="sr-only" onChange={(e) => addFiles(e.target.files)} />
                </label>
                <button
                  type="button"
                  onClick={addSample}
                  className="inline-flex items-center gap-2 rounded border border-line bg-white px-3 py-2 text-sm font-semibold text-ink hover:bg-slate-50"
                >
                  <Camera className="h-4 w-4" aria-hidden="true" />
                  Add example photo
                </button>
              </div>
              {evidence.length > 0 && (
                <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3">
                  {evidence.map((f) => (
                    <EvidenceCard key={f.id} file={f} onRemove={() => setEvidence((xs) => xs.filter((x) => x.id !== f.id))} />
                  ))}
                </div>
              )}
            </div>

            <div className="rounded border border-line/70 bg-slate-50 p-3 text-sm">
              <span className="font-semibold text-ink">Your address</span>
              <p className="text-midgrey">{ME.address} · auto-filled from your account</p>
            </div>
          </div>
          <div className="flex items-center justify-end border-t border-line/60 px-5 py-4">
            <Button type="submit">
              <Send className="h-4 w-4" aria-hidden="true" />
              Send to council
            </Button>
          </div>
        </Card>
      </form>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Step 2 — Analysing
// ---------------------------------------------------------------------------

function AnalysingStep() {
  return (
    <div className="mx-auto flex max-w-md flex-col items-center py-20 text-center">
      <span className="relative flex h-16 w-16 items-center justify-center">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-govblue/20" />
        <span className="relative inline-flex h-16 w-16 items-center justify-center rounded-full bg-govblue/10 text-govblue">
          <Search className="h-7 w-7" aria-hidden="true" />
        </span>
      </span>
      <p className="mt-6 text-lg font-semibold text-ink">Analysing your report…</p>
      <p className="mt-1 text-sm text-midgrey">Working out how urgent this is and what needs to happen next.</p>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Step 3 — Result: AI summary + live tracker + council notes
// ---------------------------------------------------------------------------

function ResultView({ repair, onReportAnother }: { repair: Repair; onReportAnother: () => void }) {
  const analysis = useMemo(
    () => analyzeReport(repair.description, { vulnerable: repair.resident.vulnerable, urgentReported: repair.urgentReported }),
    [repair.description, repair.resident.vulnerable, repair.urgentReported],
  )
  const sla = SLA_POLICY[repair.priority]
  const councilNotes = repair.timeline.filter((e) => e.actor === 'council').slice().reverse()

  return (
    <div className="mx-auto max-w-3xl animate-fade-in space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl">Your repair</h1>
          <p className="text-sm text-midgrey">
            Reference <span className="font-semibold text-ink">{repair.reference}</span>
          </p>
        </div>
        <Button variant="secondary" onClick={onReportAnother}>
          Report another repair
        </Button>
      </div>

      {/* AI summary */}
      <Card>
        <div className="space-y-4 p-5">
          <div className="flex items-start gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded bg-govblue/10 text-govblue">
              <IssueIcon issue={repair.issueType} className="h-5 w-5" />
            </span>
            <div className="min-w-0">
              <p className="text-base font-semibold text-ink">{analysis.plainSummary}</p>
              <div className="mt-1.5 flex items-center gap-2">
                <PriorityBadge priority={repair.priority} />
              </div>
            </div>
          </div>

          <p className="text-sm text-ink">
            <span className="font-semibold">Why {repair.priority}:</span> {analysis.rationale}
          </p>

          <Callout tone={repair.priority === 'Emergency' ? 'emergency' : 'info'} title="Council promise">
            We aim to resolve a {repair.priority.toLowerCase()} repair within{' '}
            <span className="font-semibold">{sla.repairWithin}</span>, and to acknowledge it within{' '}
            <span className="font-semibold">{sla.acknowledgeWithin}</span>.
          </Callout>
        </div>
      </Card>

      {/* Live tracker */}
      <Card>
        <CardHeader title="Track your repair" subtitle="Updates here automatically as the council acts." />
        <div className="p-5">
          <StatusTracker repair={repair} />
          {repair.assignedTo && (
            <div className="mt-5 flex items-center gap-2 rounded border border-line/70 bg-slate-50 p-3 text-sm">
              <ShieldCheck className="h-5 w-5 shrink-0 text-govgreen" aria-hidden="true" />
              <span>
                <span className="font-semibold text-ink">Your engineer:</span> {repair.assignedTo}
                {repair.appointment && (
                  <>
                    {' '}
                    — {formatDate(repair.appointment.start ?? repair.appointment.date)}, {repair.appointment.window}
                  </>
                )}
              </span>
            </div>
          )}
        </div>
      </Card>

      {/* Notes from the council */}
      <Card>
        <CardHeader title="Notes from the council" />
        <div className="p-5">
          {councilNotes.length === 0 ? (
            <p className="text-sm text-midgrey">No updates yet. We'll post here when something changes.</p>
          ) : (
            <ul className="space-y-3">
              {councilNotes.map((n) => (
                <li key={n.id} className="flex gap-3">
                  <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-govblue/10 text-govblue">
                    <Building2 className="h-4 w-4" aria-hidden="true" />
                  </span>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-ink">{n.title}</p>
                    {n.description && <p className="text-sm text-midgrey">{n.description}</p>}
                    <p className="text-xs text-midgrey">{relativeTime(n.timestamp)}</p>
                  </div>
                </li>
              ))}
            </ul>
          )}
          <p className="mt-4 flex items-center gap-1.5 text-xs text-midgrey">
            <MessageSquare className="h-3.5 w-3.5" aria-hidden="true" />
            Reported {formatDateTime(repair.submittedAt)}
          </p>
        </div>
      </Card>
    </div>
  )
}

function StatusTracker({ repair }: { repair: Repair }) {
  const reached = reachedStep(repair)
  const sublabel = stepSublabels(repair)

  return (
    <ol className="grid grid-cols-1 gap-3 sm:grid-cols-4">
      {STEP_LABELS.map((label, i) => {
        const done = i < reached || repair.status === 'Completed'
        const current = i === reached && repair.status !== 'Completed'
        const Icon = done ? CheckCircle2 : current ? CircleDot : Circle
        return (
          <li key={label} className="flex items-start gap-2 sm:flex-col sm:gap-1.5">
            <Icon
              className={`h-6 w-6 shrink-0 ${done ? 'text-govgreen' : current ? 'text-govblue' : 'text-line'}`}
              aria-hidden="true"
            />
            <div className="min-w-0">
              <p className={`text-sm font-semibold ${done || current ? 'text-ink' : 'text-midgrey'}`}>{label}</p>
              <p className="text-xs text-midgrey">{sublabel[i]}</p>
            </div>
          </li>
        )
      })}
    </ol>
  )
}

function stepSublabels(r: Repair): string[] {
  const sla = SLA_POLICY[r.priority]
  const assigned = r.assignedTo ? r.assignedTo.split(' (')[0] : `within ${sla.acknowledgeWithin}`
  const scheduled = r.appointment
    ? `${formatDate(r.appointment.start ?? r.appointment.date)}, ${r.appointment.window}`
    : `target ${formatDate(r.estimatedCompletion)}`
  return [
    r.acknowledgedAt ? formatDate(r.acknowledgedAt) : 'Pending',
    assigned,
    scheduled,
    r.completedAt ? formatDate(r.completedAt) : `by ${formatDate(r.estimatedCompletion)}`,
  ]
}
