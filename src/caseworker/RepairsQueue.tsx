import { useMemo, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { Search, AlertTriangle, X } from 'lucide-react'
import { useRepairs } from '../state/RepairsContext'
import { CATEGORIES, PRIORITIES, STATUSES } from '../types'
import { isOverdue } from '../lib/policy'
import { matchesPreset, presetLabel, urgentOpen, type Preset } from '../lib/buckets'
import { formatDate, formatDateTime } from '../lib/format'
import { StatusBadge } from '../components/StatusBadge'
import { PriorityBadge } from '../components/PriorityBadge'
import { Tag } from '../components/Tag'

const PRESETS: Preset[] = ['triage', 'dueack', 'today']

export function RepairsQueue() {
  const { repairs } = useRepairs()
  const navigate = useNavigate()
  const now = useMemo(() => new Date(), [])
  const [params] = useSearchParams()
  const initialPreset = params.get('preset')

  const [status, setStatus] = useState(params.get('status') ?? 'all')
  const [priority, setPriority] = useState(params.get('priority') ?? 'all')
  const [category, setCategory] = useState(params.get('category') ?? 'all')
  const [search, setSearch] = useState(params.get('q') ?? '')
  const [overdueOnly, setOverdueOnly] = useState(initialPreset === 'overdue')
  const [urgentOnly, setUrgentOnly] = useState(initialPreset === 'urgent')
  const [preset, setPreset] = useState<Preset | null>(
    PRESETS.includes(initialPreset as Preset) ? (initialPreset as Preset) : null,
  )

  const filtered = useMemo(() => {
    return repairs
      .filter((r) => {
        if (status !== 'all' && r.status !== status) return false
        if (priority !== 'all' && r.priority !== priority) return false
        if (category !== 'all' && r.category !== category) return false
        if (overdueOnly && !isOverdue(r, now)) return false
        if (urgentOnly && !urgentOpen(r)) return false
        if (preset && !matchesPreset(r, preset, now)) return false
        if (search.trim()) {
          const q = search.trim().toLowerCase()
          const hay = `${r.reference} ${r.resident.name} ${r.resident.address} ${r.category}`.toLowerCase()
          if (!hay.includes(q)) return false
        }
        return true
      })
      .sort((a, b) => {
        const ac = a.status === 'Completed' ? 1 : 0
        const bc = b.status === 'Completed' ? 1 : 0
        if (ac !== bc) return ac - bc
        const ao = isOverdue(a, now) ? 0 : 1
        const bo = isOverdue(b, now) ? 0 : 1
        if (ao !== bo) return ao - bo
        return new Date(a.acknowledgementDeadline).getTime() - new Date(b.acknowledgementDeadline).getTime()
      })
  }, [repairs, status, priority, category, overdueOnly, urgentOnly, preset, search, now])

  const hasFilters =
    status !== 'all' || priority !== 'all' || category !== 'all' || overdueOnly || urgentOnly || preset || search.trim()

  function clearAll() {
    setStatus('all')
    setPriority('all')
    setCategory('all')
    setOverdueOnly(false)
    setUrgentOnly(false)
    setPreset(null)
    setSearch('')
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-extrabold text-navy">Repairs queue</h1>
        <p className="mt-1 text-midgrey">All repair cases for the Riverford housing repairs team.</p>
      </div>

      {/* Filters */}
      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-card">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <FilterSelect id="f-status" label="Status" value={status} onChange={setStatus} options={STATUSES} />
          <FilterSelect id="f-priority" label="Priority" value={priority} onChange={setPriority} options={PRIORITIES} />
          <FilterSelect id="f-category" label="Category" value={category} onChange={setCategory} options={CATEGORIES} />
          <div>
            <label htmlFor="f-search" className="block text-xs font-semibold uppercase tracking-wide text-midgrey">
              Search
            </label>
            <div className="relative mt-1">
              <Search className="pointer-events-none absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" aria-hidden="true" />
              <input
                id="f-search"
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Reference, name, address"
                className="w-full rounded-lg border border-slate-300 bg-white py-2 pl-8 pr-3 text-sm shadow-sm focus:border-govblue focus:outline-none"
              />
            </div>
          </div>
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-2">
          <label className="flex cursor-pointer items-center gap-2 text-sm font-medium text-ink">
            <input
              type="checkbox"
              checked={overdueOnly}
              onChange={(e) => setOverdueOnly(e.target.checked)}
              className="h-4 w-4 rounded border-slate-400 text-govblue focus:ring-govblue"
            />
            Overdue only
          </label>
          <label className="flex cursor-pointer items-center gap-2 text-sm font-medium text-ink">
            <input
              type="checkbox"
              checked={urgentOnly}
              onChange={(e) => setUrgentOnly(e.target.checked)}
              className="h-4 w-4 rounded border-slate-400 text-govblue focus:ring-govblue"
            />
            Urgent &amp; emergency only
          </label>
          {preset && (
            <Tag tone="blue" className="gap-1.5">
              {presetLabel[preset]}
              <button type="button" onClick={() => setPreset(null)} aria-label={`Clear ${presetLabel[preset]} filter`}>
                <X className="h-3 w-3" aria-hidden="true" />
              </button>
            </Tag>
          )}
          <span className="ml-auto text-sm text-midgrey">
            Showing <strong className="text-ink">{filtered.length}</strong> of {repairs.length}
          </span>
          {hasFilters && (
            <button type="button" onClick={clearAll} className="text-sm font-semibold text-govblue hover:underline">
              Clear filters
            </button>
          )}
        </div>
      </div>

      {/* Desktop table */}
      <div className="hidden overflow-hidden rounded-xl border border-slate-200 bg-white shadow-card lg:block">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-xs uppercase tracking-wide text-midgrey">
            <tr>
              <th scope="col" className="px-4 py-3 font-semibold">Reference</th>
              <th scope="col" className="px-4 py-3 font-semibold">Resident &amp; address</th>
              <th scope="col" className="px-4 py-3 font-semibold">Category</th>
              <th scope="col" className="px-4 py-3 font-semibold">Priority</th>
              <th scope="col" className="px-4 py-3 font-semibold">Status</th>
              <th scope="col" className="px-4 py-3 font-semibold">Acknowledge by</th>
              <th scope="col" className="px-4 py-3 font-semibold">Assigned to</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filtered.map((r) => {
              const overdue = isOverdue(r, now)
              return (
                <tr
                  key={r.reference}
                  onClick={() => navigate(`/officer/case/${r.reference}`)}
                  className="cursor-pointer hover:bg-slate-50"
                >
                  <th scope="row" className="px-4 py-3 align-top font-normal">
                    <Link
                      to={`/officer/case/${r.reference}`}
                      onClick={(e) => e.stopPropagation()}
                      className="font-semibold text-govblue hover:underline"
                    >
                      {r.reference}
                    </Link>
                    {r.riskFlags.length > 0 && (
                      <span className="mt-1 flex items-center gap-1 text-xs font-medium text-red-700">
                        <AlertTriangle className="h-3 w-3" aria-hidden="true" />
                        {r.riskFlags.length} risk flag{r.riskFlags.length > 1 ? 's' : ''}
                      </span>
                    )}
                  </th>
                  <td className="px-4 py-3 align-top">
                    <p className="font-medium text-ink">{r.resident.name}</p>
                    <p className="max-w-[16rem] truncate text-xs text-midgrey">{r.resident.address}</p>
                  </td>
                  <td className="px-4 py-3 align-top text-ink">{r.category}</td>
                  <td className="px-4 py-3 align-top"><PriorityBadge priority={r.priority} /></td>
                  <td className="px-4 py-3 align-top">
                    <div className="flex flex-col items-start gap-1">
                      <StatusBadge status={r.status} />
                      {overdue && <Tag tone="red">Overdue</Tag>}
                    </div>
                  </td>
                  <td className={`px-4 py-3 align-top ${overdue ? 'font-semibold text-red-700' : 'text-ink'}`}>
                    {formatDateTime(r.acknowledgementDeadline)}
                  </td>
                  <td className="px-4 py-3 align-top text-ink">{r.assignedTo ?? <span className="text-midgrey">—</span>}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
        {filtered.length === 0 && <EmptyRow />}
      </div>

      {/* Mobile cards */}
      <ul className="space-y-3 lg:hidden">
        {filtered.map((r) => {
          const overdue = isOverdue(r, now)
          return (
            <li key={r.reference}>
              <Link
                to={`/officer/case/${r.reference}`}
                className="block rounded-xl border border-slate-200 bg-white p-4 shadow-card focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-bold text-navy">{r.reference}</p>
                    <p className="text-sm text-ink">{r.resident.name}</p>
                    <p className="text-xs text-midgrey">{r.resident.address}</p>
                  </div>
                  <PriorityBadge priority={r.priority} />
                </div>
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <StatusBadge status={r.status} />
                  {overdue && <Tag tone="red">Overdue</Tag>}
                  <Tag>{r.category}</Tag>
                </div>
                <p className={`mt-2 text-xs ${overdue ? 'font-semibold text-red-700' : 'text-midgrey'}`}>
                  Acknowledge by {formatDate(r.acknowledgementDeadline)} · {r.assignedTo ?? 'Unassigned'}
                </p>
              </Link>
            </li>
          )
        })}
        {filtered.length === 0 && (
          <li className="rounded-xl border border-slate-200 bg-white p-6 text-center text-sm text-midgrey">
            No repairs match these filters.
          </li>
        )}
      </ul>
    </div>
  )
}

function FilterSelect({
  id,
  label,
  value,
  onChange,
  options,
}: {
  id: string
  label: string
  value: string
  onChange: (v: string) => void
  options: readonly string[]
}) {
  return (
    <div>
      <label htmlFor={id} className="block text-xs font-semibold uppercase tracking-wide text-midgrey">
        {label}
      </label>
      <select
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-govblue focus:outline-none"
      >
        <option value="all">All {label.toLowerCase()}</option>
        {options.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
    </div>
  )
}

function EmptyRow() {
  return <p className="px-4 py-10 text-center text-sm text-midgrey">No repairs match these filters.</p>
}
