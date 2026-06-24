# Right to Repair

An interactive MVP prototype for a fictional UK government **"Right to Repair"** digital service —
a single, accessible service for residents to report and track social/council housing repairs, and
for council officers to triage and manage them.

It is one product with **two views of the same mock data**, switched with a persistent toggle in the
top navigation:

- **Resident view** — report a repair, track progress, and see published performance data.
- **Council officer view** — triage cases, manage SLAs, and report on performance.

The defining idea: when an officer acknowledges a case, books an appointment or changes its status,
the change appears **immediately in the resident's tracking view**, because both read from one
shared in-memory store.

> This is a prototype for a council discovery/alpha playback. It uses **mock data only** — no backend,
> no authentication, no real file storage, and no real personal data. Phone numbers and SLA figures
> are illustrative.

## Running it locally

Requires Node 18+ (built with Node 22).

```bash
npm install
npm run dev
```

Then open the URL Vite prints (default **http://localhost:5173**).

Other scripts:

```bash
npm run build      # type-check (tsc) + production build
npm run preview    # serve the production build
npm run typecheck  # type-check only
```

## What's included

**Resident**
- **Landing page** with a plain-English explanation, start/track actions, and emergency guidance
  (when to call 999 instead of using the form).
- **Report a repair** form: contact details, category, description, urgent/vulnerable flags, mocked
  photo/video upload, and consent. It detects urgent/emergency wording live (e.g. "no heating",
  "sparks", "won't lock"), shows the matching warning, and previews the SLA before you submit.
- **Confirmation** with a generated reference, priority, acknowledgement time, repair timeline and
  next steps.
- **Track a repair** with live status, timeline, appointment, and the ability to add notes or more
  evidence.
- **Public performance** page with headline metrics and a repairs-by-category breakdown.

**Council officer**
- **Dashboard** with triage / urgent / due-for-acknowledgement / overdue / due-today buckets,
  a "needs attention" list, a recent-updates feed and a performance snapshot.
- **Repairs queue** — filterable table (status, priority, category, overdue-only, urgent-only,
  search) that collapses to cards on mobile.
- **Case detail** with resident & repair details, evidence, an **AI-style suggested priority** (with
  rationale and matched keywords), an **SLA/policy guidance** panel, internal notes and the full
  timeline.
- **Case actions** — acknowledge, assign, set appointment, update status, request more information,
  mark complete. Every action updates the resident's view.
- **Performance reporting** with a "publish to the public page" preview.

## Policy logic (visible in the UI)

Priority and SLA rules live in `src/lib/policy.ts` and drive both the resident warnings and the
officer suggestions:

| Priority  | Acknowledge within | Repair target        |
| --------- | ------------------ | -------------------- |
| Emergency | 2 hours            | 24 hours (make safe) |
| Urgent    | 1 working day      | 7 days               |
| Standard  | 5 working days     | 28 days              |

## Project structure

```
src/
  types.ts                 Domain model + shared enums
  data/seed.ts             13 mock cases (timestamps relative to "now")
  lib/
    policy.ts              SLA rules, priority suggestion, overdue logic
    metrics.ts             Performance metrics derived from the live data
    buckets.ts             Dashboard/queue predicates
    format.ts              Date/time/duration helpers
    useMode.ts             Derives resident/caseworker mode from the route
  state/RepairsContext.tsx Shared store + mutators (the single source of truth)
  components/              StatusBadge, PriorityBadge, Timeline, MetricCard,
                           EvidenceCard, ModeToggle, BarChart, AppShell, …
  resident/                ResidentHome, RepairRequestForm, Confirmation,
                           TrackRepair, PublicPerformance
  caseworker/              CaseworkerDashboard, RepairsQueue, CaseDetail,
                           CaseActions, PerformanceDashboard
```

## Stack

React 18 · TypeScript · Vite · Tailwind CSS · React Router · lucide-react.

## Notes & assumptions

- **State is session-only.** Changes persist while the tab is open; a refresh resets to the seed data.
- **Mode is derived from the URL** (`/officer/*` = officer view), so the nav and URL can't disagree.
- **Evidence uploads are mocked** — the file name, size and type are captured and shown as a card; no
  bytes are stored.
- Mock timestamps are generated as offsets from the current time, so "overdue", "due today" and
  deadlines always look realistic whenever you run it.
- Branding (Riverford Borough Council), phone numbers and SLA thresholds are fictional/illustrative.
