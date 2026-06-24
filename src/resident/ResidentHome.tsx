import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { ClipboardList, Search, ArrowRight, ClipboardCheck, CalendarClock, CheckCircle2, BarChart3 } from 'lucide-react'
import { EmergencyGuidance } from '../components/EmergencyGuidance'
import { buttonClasses } from '../components/Button'
import { Card } from '../components/Card'

const steps = [
  {
    icon: ClipboardCheck,
    title: '1. Report it',
    body: 'Tell us what is wrong, add photos or video, and let us know if anyone is at risk.',
  },
  {
    icon: CalendarClock,
    title: '2. We respond',
    body: 'We acknowledge your request within a set time, give it a priority and propose a repair timeline.',
  },
  {
    icon: CheckCircle2,
    title: '3. Track to completion',
    body: 'Follow real-time status updates, see your appointment and add more information at any time.',
  },
]

export function ResidentHome() {
  return (
    <div className="space-y-10">
      <section className="grid items-center gap-8 lg:grid-cols-2">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-govblue">Council housing repairs</p>
          <h1 className="mt-2 text-4xl font-extrabold leading-tight text-navy sm:text-5xl">
            Report and track repairs to your home
          </h1>
          <p className="mt-4 text-lg text-ink">
            Use this service to report a repair to your council home, send photos as evidence, and follow your
            request from start to finish. Urgent and emergency repairs are prioritised automatically.
          </p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <Link to="/report" className={buttonClasses('primary')}>
              <ClipboardList className="h-5 w-5" aria-hidden="true" />
              Report a repair
            </Link>
            <Link to="/track" className={buttonClasses('secondary')}>
              <Search className="h-5 w-5" aria-hidden="true" />
              Track an existing repair
            </Link>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
          <CtaCard
            to="/report"
            icon={<ClipboardList className="h-6 w-6 text-govgreen" aria-hidden="true" />}
            title="Start a new request"
            body="Heating, plumbing, damp and mould, electrics, doors and windows, and more."
          />
          <CtaCard
            to="/track"
            icon={<Search className="h-6 w-6 text-govblue" aria-hidden="true" />}
            title="Track a repair"
            body="Enter your reference number to see the latest status and updates."
          />
        </div>
      </section>

      <EmergencyGuidance />

      <section>
        <h2 className="text-2xl font-bold text-navy">How it works</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-3">
          {steps.map((s) => {
            const Icon = s.icon
            return (
              <Card key={s.title} className="p-5">
                <Icon className="h-7 w-7 text-govblue" aria-hidden="true" />
                <h3 className="mt-3 text-lg font-bold text-navy">{s.title}</h3>
                <p className="mt-1 text-sm text-ink">{s.body}</p>
              </Card>
            )
          })}
        </div>
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-card sm:flex sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <BarChart3 className="h-7 w-7 shrink-0 text-govblue" aria-hidden="true" />
          <div>
            <h2 className="text-xl font-bold text-navy">How we are performing</h2>
            <p className="mt-1 text-sm text-ink">
              We publish our repair performance, including how quickly we respond and complete repairs.
            </p>
          </div>
        </div>
        <Link to="/performance" className={buttonClasses('secondary', 'mt-4 sm:mt-0')}>
          View performance data
          <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </Link>
      </section>
    </div>
  )
}

function CtaCard({
  to,
  icon,
  title,
  body,
}: {
  to: string
  icon: ReactNode
  title: string
  body: string
}) {
  return (
    <Link
      to={to}
      className="group flex flex-col rounded-xl border border-slate-200 bg-white p-5 shadow-card transition-shadow hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy"
    >
      <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-slate-100">{icon}</div>
      <h3 className="mt-3 text-lg font-bold text-navy">{title}</h3>
      <p className="mt-1 flex-1 text-sm text-ink">{body}</p>
      <span className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-govblue group-hover:gap-2">
        Continue <ArrowRight className="h-4 w-4 transition-all" aria-hidden="true" />
      </span>
    </Link>
  )
}
