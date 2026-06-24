import { NavLink } from 'react-router-dom'
import { useMode } from '../lib/useMode'

interface NavItem {
  to: string
  label: string
  end?: boolean
}

const residentNav: NavItem[] = [
  { to: '/', label: 'Home', end: true },
  { to: '/report', label: 'Report a repair' },
  { to: '/track', label: 'Track a repair' },
  { to: '/performance', label: 'Performance' },
]

const caseworkerNav: NavItem[] = [
  { to: '/officer', label: 'Dashboard', end: true },
  { to: '/officer/queue', label: 'Repairs queue' },
  { to: '/officer/performance', label: 'Performance' },
]

export function TopNav() {
  const mode = useMode()
  const items = mode === 'caseworker' ? caseworkerNav : residentNav

  return (
    <nav aria-label="Primary" className="border-b border-slate-200 bg-white">
      <div className="container-page flex items-center gap-1 overflow-x-auto">
        <span className="mr-2 hidden shrink-0 text-xs font-semibold uppercase tracking-wide text-slate-400 sm:inline">
          {mode === 'caseworker' ? 'Officer area' : 'Resident area'}
        </span>
        {items.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) =>
              `whitespace-nowrap border-b-2 px-3 py-3 text-sm font-semibold transition-colors ${
                isActive
                  ? 'border-govgreen text-navy'
                  : 'border-transparent text-midgrey hover:border-slate-300 hover:text-navy'
              }`
            }
          >
            {item.label}
          </NavLink>
        ))}
      </div>
    </nav>
  )
}
