import { NavLink } from 'react-router-dom'
import { Home, LayoutDashboard, BarChart3 } from 'lucide-react'

const tabs = [
  { to: '/', label: 'Resident View', icon: Home, end: true },
  { to: '/ops', label: 'Council Ops', icon: LayoutDashboard, end: false },
  { to: '/performance', label: 'Public Dashboard', icon: BarChart3, end: false },
]

/** Top-level switch between the three views (simulates two logged-in users). */
export function ViewSwitcher() {
  return (
    <div
      role="tablist"
      aria-label="Switch view"
      className="inline-flex items-center gap-1 rounded bg-white/10 p-1 ring-1 ring-white/20"
    >
      {tabs.map(({ to, label, icon: Icon, end }) => (
        <NavLink
          key={to}
          to={to}
          end={end}
          className={({ isActive }) =>
            `inline-flex items-center gap-1.5 rounded px-2.5 py-1.5 text-sm font-semibold transition-colors ${
              isActive ? 'bg-white text-ink' : 'text-white/80 hover:bg-white/10 hover:text-white'
            }`
          }
        >
          <Icon className="h-4 w-4" aria-hidden="true" />
          <span className="hidden sm:inline">{label}</span>
        </NavLink>
      ))}
    </div>
  )
}
