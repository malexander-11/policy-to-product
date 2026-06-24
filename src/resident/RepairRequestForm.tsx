import { useMemo, useRef, useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { Upload, ImagePlus, Send } from 'lucide-react'
import { CATEGORIES, type Category, type EvidenceFile, type Repair } from '../types'
import { deadlinesFrom, SLA_POLICY, suggestPriority } from '../lib/policy'
import { nextReference, useRepairs } from '../state/RepairsContext'
import { TextInput, TextArea, Select, CheckboxCard } from '../components/Field'
import { Button } from '../components/Button'
import { Callout } from '../components/Callout'
import { EmergencyGuidance } from '../components/EmergencyGuidance'
import { EvidenceCard } from '../components/EvidenceCard'
import { PriorityBadge } from '../components/PriorityBadge'

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

interface Errors {
  name?: string
  address?: string
  contact?: string
  category?: string
  description?: string
  consent?: string
}

export function RepairRequestForm() {
  const navigate = useNavigate()
  const { addRepair } = useRepairs()
  const summaryRef = useRef<HTMLDivElement>(null)

  const [name, setName] = useState('')
  const [address, setAddress] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [category, setCategory] = useState<Category | ''>('')
  const [description, setDescription] = useState('')
  const [urgent, setUrgent] = useState(false)
  const [vulnerable, setVulnerable] = useState(false)
  const [evidence, setEvidence] = useState<EvidenceFile[]>([])
  const [consent, setConsent] = useState(false)
  const [errors, setErrors] = useState<Errors>({})

  const suggestion = useMemo(
    () => (category ? suggestPriority(category, description, { vulnerable, urgentReported: urgent }) : null),
    [category, description, vulnerable, urgent],
  )

  function addEvidenceFiles(files: FileList | null) {
    if (!files || files.length === 0) return
    const added: EvidenceFile[] = Array.from(files).map((f, i) => ({
      id: `up-${Date.now()}-${i}`,
      name: f.name,
      type: f.type.startsWith('video') ? 'video' : 'image',
      sizeLabel: formatBytes(f.size),
      uploadedBy: 'resident',
    }))
    setEvidence((prev) => [...prev, ...added])
  }

  function addSampleEvidence() {
    setEvidence((prev) => [
      ...prev,
      {
        id: `sample-${Date.now()}`,
        name: `photo-evidence-${prev.length + 1}.jpg`,
        type: 'image',
        sizeLabel: '2.1 MB',
        uploadedBy: 'resident',
      },
    ])
  }

  function validate(): Errors {
    const e: Errors = {}
    if (!name.trim()) e.name = 'Enter your name'
    if (!address.trim()) e.address = 'Enter your address'
    if (!email.trim() && !phone.trim()) e.contact = 'Enter an email address or a phone number so we can contact you'
    else if (email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()))
      e.contact = 'Enter a valid email address, or leave it blank and give a phone number'
    if (!category) e.category = 'Choose a repair category'
    if (description.trim().length < 10) e.description = 'Describe the issue in a little more detail (at least 10 characters)'
    if (!consent) e.consent = 'You need to confirm before submitting'
    return e
  }

  function handleSubmit(ev: FormEvent) {
    ev.preventDefault()
    const found = validate()
    setErrors(found)
    if (Object.keys(found).length > 0) {
      summaryRef.current?.focus()
      return
    }

    const nowIso = new Date().toISOString()
    const priority = suggestion?.priority ?? 'Standard'
    const { acknowledgementDeadline, estimatedCompletion } = deadlinesFrom(nowIso, priority)
    const reference = nextReference()

    const riskFlags: string[] = []
    if (vulnerable) riskFlags.push('Vulnerable resident or at-risk household')
    if (suggestion?.emergencySignals) riskFlags.push('Emergency indicators in description')
    else if (urgent) riskFlags.push('Reported as urgent by resident')

    const repair: Repair = {
      reference,
      resident: { name: name.trim(), address: address.trim(), email: email.trim(), phone: phone.trim(), vulnerable },
      category: category as Category,
      description: description.trim(),
      priority,
      status: 'Submitted',
      submittedAt: nowIso,
      acknowledgementDeadline,
      estimatedCompletion,
      assignedTo: undefined,
      riskFlags,
      urgentReported: urgent,
      evidence,
      timeline: [
        {
          id: `${reference}-t1`,
          timestamp: nowIso,
          title: 'Repair reported',
          description: 'Submitted online via Right to Repair.',
          actor: 'resident',
        },
      ],
      notes: [],
    }

    addRepair(repair)
    navigate(`/report/confirmation/${reference}`)
  }

  const errorList = Object.entries(errors)
  const fieldAnchor: Record<string, string> = {
    name: 'name',
    address: 'address',
    contact: 'email',
    category: 'category',
    description: 'description',
    consent: 'consent',
  }

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="text-3xl font-extrabold text-navy">Report a repair</h1>
      <p className="mt-2 text-ink">
        Tell us what needs repairing in your council home. Fields marked <span className="font-semibold">(required)</span>{' '}
        must be filled in.
      </p>

      <div className="mt-6">
        <EmergencyGuidance compact />
      </div>

      {errorList.length > 0 && (
        <div
          ref={summaryRef}
          tabIndex={-1}
          role="alert"
          className="mt-6 rounded-lg border-2 border-red-600 bg-red-50 p-4 focus-visible:outline-none"
        >
          <h2 className="font-bold text-red-800">There is a problem</h2>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-sm">
            {errorList.map(([key, msg]) => (
              <li key={key}>
                <a href={`#${fieldAnchor[key]}`} className="font-semibold text-red-700 underline">
                  {msg}
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate className="mt-6 space-y-8">
        <fieldset className="space-y-4">
          <legend className="text-xl font-bold text-navy">About you</legend>
          <TextInput
            id="name"
            label="Full name"
            required
            autoComplete="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            error={errors.name}
          />
          <TextInput
            id="address"
            label="Property address"
            hint="The address of the council home that needs the repair."
            required
            autoComplete="street-address"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            error={errors.address}
          />
          <div className="grid gap-4 sm:grid-cols-2">
            <TextInput
              id="email"
              label="Email address"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              error={errors.contact}
            />
            <TextInput
              id="phone"
              label="Phone number"
              type="tel"
              autoComplete="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </div>
        </fieldset>

        <fieldset className="space-y-4">
          <legend className="text-xl font-bold text-navy">About the repair</legend>
          <Select
            id="category"
            label="What needs repairing?"
            required
            placeholder="Choose a category"
            options={CATEGORIES}
            value={category}
            onChange={(e) => setCategory(e.target.value as Category)}
            error={errors.category}
          />
          <TextArea
            id="description"
            label="Describe the issue"
            hint="Include where it is, when it started, and anything that makes it worse. Mention if it is unsafe."
            required
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            error={errors.description}
          />

          {suggestion && (suggestion.priority === 'Emergency' || suggestion.emergencySignals) && (
            <Callout tone="emergency" title="This sounds like an emergency repair">
              <p>
                Based on what you have described, this would be treated as an <strong>Emergency</strong>. If anyone is
                in immediate danger, or you smell gas, please call <strong>999</strong> or the council’s emergency
                line on <strong>0800 123 4567</strong> instead of waiting for an online response.
              </p>
            </Callout>
          )}
          {suggestion && suggestion.priority === 'Urgent' && !suggestion.emergencySignals && (
            <Callout tone="warning" title="This looks like an urgent repair">
              <p>
                We expect to treat this as <strong>Urgent</strong>, so it will be prioritised. We will confirm the
                priority when we acknowledge your request.
              </p>
            </Callout>
          )}
        </fieldset>

        <fieldset className="space-y-3">
          <legend className="text-xl font-bold text-navy">Safety and risk</legend>
          <CheckboxCard
            id="urgent"
            label="I think this repair is urgent"
            description="For example: no heating, a leak you cannot stop, or you cannot secure your home."
            checked={urgent}
            onChange={setUrgent}
          />
          <CheckboxCard
            id="vulnerable"
            label="Someone in the household is vulnerable or at risk"
            description="For example: a young child, an older person, or someone with a health condition or disability."
            checked={vulnerable}
            onChange={setVulnerable}
          />
        </fieldset>

        <fieldset className="space-y-3">
          <legend className="text-xl font-bold text-navy">Photos or video</legend>
          <p className="text-sm text-midgrey">
            Adding evidence helps us understand the problem and bring the right tools. Uploads are simulated in this
            prototype — no files are stored.
          </p>
          <div className="flex flex-wrap gap-3">
            <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-dashed border-slate-400 bg-white px-4 py-2.5 text-sm font-semibold text-navy hover:bg-slate-50">
              <Upload className="h-5 w-5" aria-hidden="true" />
              Choose files
              <input
                type="file"
                multiple
                accept="image/*,video/*"
                className="sr-only"
                onChange={(e) => {
                  addEvidenceFiles(e.target.files)
                  e.target.value = ''
                }}
              />
            </label>
            <button
              type="button"
              onClick={addSampleEvidence}
              className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-navy hover:bg-slate-50"
            >
              <ImagePlus className="h-5 w-5" aria-hidden="true" />
              Add example photo
            </button>
          </div>
          {evidence.length > 0 && (
            <ul className="mt-2 grid grid-cols-2 gap-3 sm:grid-cols-3">
              {evidence.map((f) => (
                <li key={f.id}>
                  <EvidenceCard file={f} onRemove={() => setEvidence((prev) => prev.filter((x) => x.id !== f.id))} />
                </li>
              ))}
            </ul>
          )}
        </fieldset>

        {suggestion && (
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-5">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-lg font-bold text-navy">What happens next</h2>
              <PriorityBadge priority={suggestion.priority} />
            </div>
            <p className="mt-2 text-sm text-ink">{suggestion.rationale}</p>
            <dl className="mt-4 grid gap-4 sm:grid-cols-2">
              <div className="rounded-lg bg-white p-4 ring-1 ring-slate-200">
                <dt className="text-sm font-medium text-midgrey">We will acknowledge your request within</dt>
                <dd className="mt-1 text-lg font-bold text-navy">{SLA_POLICY[suggestion.priority].acknowledgeWithin}</dd>
              </div>
              <div className="rounded-lg bg-white p-4 ring-1 ring-slate-200">
                <dt className="text-sm font-medium text-midgrey">Target time to complete the repair</dt>
                <dd className="mt-1 text-lg font-bold text-navy">{SLA_POLICY[suggestion.priority].repairWithin}</dd>
              </div>
            </dl>
            <p className="mt-3 text-sm text-midgrey">
              When you submit, you will get a reference number to track your repair. We will confirm the final priority
              after triage.
            </p>
          </div>
        )}

        <fieldset>
          <legend className="sr-only">Confirmation</legend>
          <CheckboxCard
            id="consent"
            label="I confirm the information I have given is correct"
            description="We will use these details only to carry out and track your repair."
            checked={consent}
            onChange={setConsent}
          />
          {errors.consent && <p className="mt-1 text-sm font-semibold text-red-700">⚠ {errors.consent}</p>}
        </fieldset>

        <div className="flex flex-col gap-3 sm:flex-row">
          <Button type="submit" variant="primary">
            <Send className="h-5 w-5" aria-hidden="true" />
            Submit repair request
          </Button>
          <Button type="button" variant="ghost" onClick={() => navigate('/')}>
            Cancel
          </Button>
        </div>
      </form>
    </div>
  )
}
