import { useState, type ReactNode } from 'react'
import { CheckCircle2, CheckCheck, UserPlus, CalendarPlus, RefreshCw, HelpCircle } from 'lucide-react'
import { ASSIGNEES, STATUSES, type Repair } from '../types'
import { useRepairs } from '../state/RepairsContext'
import { Card, CardHeader } from '../components/Card'
import { Button } from '../components/Button'

const WINDOWS = ['08:00–12:00', '12:00–16:00', '13:00–17:00', 'All day (08:00–18:00)']

function toDateInput(ms: number): string {
  return new Date(ms).toISOString().slice(0, 10)
}

export function CaseActions({ repair }: { repair: Repair }) {
  const { acknowledge, assignContractor, setAppointment, updateStatus, requestInfo, markComplete } = useRepairs()
  const [message, setMessage] = useState<string | null>(null)

  const [assignee, setAssignee] = useState(repair.assignedTo ?? ASSIGNEES[0])
  const [apptDate, setApptDate] = useState(toDateInput(Date.now() + 86_400_000))
  const [apptWindow, setApptWindow] = useState(WINDOWS[0])
  const [statusValue, setStatusValue] = useState(repair.status)
  const [infoMsg, setInfoMsg] = useState('')

  const completed = repair.status === 'Completed'

  function notify(text: string) {
    setMessage(text)
  }

  return (
    <Card>
      <CardHeader title="Actions" subtitle="Updates here appear instantly in the resident’s tracking view." />
      <div className="space-y-5 p-5">
        {message && (
          <div
            role="status"
            className="flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 px-3 py-2 text-sm font-semibold text-green-800"
          >
            <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
            {message}
          </div>
        )}

        <div className="flex flex-wrap gap-3">
          <Button
            variant="primary"
            disabled={!!repair.acknowledgedAt}
            onClick={() => {
              acknowledge(repair.reference)
              notify('Acknowledgement sent to the resident.')
            }}
          >
            <CheckCheck className="h-4 w-4" aria-hidden="true" />
            {repair.acknowledgedAt ? 'Acknowledged' : 'Acknowledge'}
          </Button>
          <Button
            variant="secondary"
            disabled={completed}
            onClick={() => {
              markComplete(repair.reference)
              notify('Repair marked as complete.')
            }}
          >
            <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
            Mark complete
          </Button>
        </div>

        <ActionRow label="Assign contractor or officer" htmlFor="assign-select" icon={<UserPlus className="h-4 w-4" />}>
          <select
            id="assign-select"
            value={assignee}
            onChange={(e) => setAssignee(e.target.value)}
            className="min-w-0 flex-1 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-govblue focus:outline-none"
          >
            {ASSIGNEES.map((a) => (
              <option key={a} value={a}>
                {a}
              </option>
            ))}
          </select>
          <Button
            variant="secondary"
            onClick={() => {
              assignContractor(repair.reference, assignee)
              notify(`Assigned to ${assignee}.`)
            }}
          >
            Assign
          </Button>
        </ActionRow>

        <div>
          <p className="flex items-center gap-2 text-sm font-semibold text-navy">
            <CalendarPlus className="h-4 w-4 text-midgrey" aria-hidden="true" />
            Set an appointment
          </p>
          <div className="mt-2 flex flex-col gap-2 sm:flex-row">
            <input
              type="date"
              aria-label="Appointment date"
              value={apptDate}
              onChange={(e) => setApptDate(e.target.value)}
              className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-govblue focus:outline-none"
            />
            <select
              aria-label="Appointment time window"
              value={apptWindow}
              onChange={(e) => setApptWindow(e.target.value)}
              className="min-w-0 flex-1 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-govblue focus:outline-none"
            >
              {WINDOWS.map((w) => (
                <option key={w} value={w}>
                  {w}
                </option>
              ))}
            </select>
            <Button
              variant="secondary"
              onClick={() => {
                setAppointment(repair.reference, {
                  date: new Date(`${apptDate}T00:00:00`).toISOString(),
                  window: apptWindow,
                })
                notify('Appointment booked and shared with the resident.')
              }}
            >
              Book
            </Button>
          </div>
        </div>

        <ActionRow label="Update status" htmlFor="status-select" icon={<RefreshCw className="h-4 w-4" />}>
          <select
            id="status-select"
            value={statusValue}
            onChange={(e) => setStatusValue(e.target.value as Repair['status'])}
            className="min-w-0 flex-1 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-govblue focus:outline-none"
          >
            {STATUSES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
          <Button
            variant="secondary"
            onClick={() => {
              updateStatus(repair.reference, statusValue)
              notify(`Status updated to ${statusValue}.`)
            }}
          >
            Update
          </Button>
        </ActionRow>

        <div>
          <label htmlFor="info-msg" className="flex items-center gap-2 text-sm font-semibold text-navy">
            <HelpCircle className="h-4 w-4 text-midgrey" aria-hidden="true" />
            Request more information
          </label>
          <textarea
            id="info-msg"
            value={infoMsg}
            onChange={(e) => setInfoMsg(e.target.value)}
            placeholder="e.g. Please confirm a date you’re available for access."
            className="mt-2 block min-h-[4.5rem] w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm placeholder:text-slate-400 focus:border-govblue focus:outline-none"
          />
          <Button
            variant="secondary"
            className="mt-2"
            disabled={!infoMsg.trim()}
            onClick={() => {
              requestInfo(repair.reference, infoMsg.trim())
              setInfoMsg('')
              notify('Information request sent. Status set to “Awaiting information”.')
            }}
          >
            Request information
          </Button>
        </div>
      </div>
    </Card>
  )
}

function ActionRow({
  label,
  htmlFor,
  icon,
  children,
}: {
  label: string
  htmlFor: string
  icon: ReactNode
  children: ReactNode
}) {
  return (
    <div>
      <label htmlFor={htmlFor} className="flex items-center gap-2 text-sm font-semibold text-navy">
        <span className="text-midgrey">{icon}</span>
        {label}
      </label>
      <div className="mt-2 flex gap-2">{children}</div>
    </div>
  )
}
