import { NavLink } from 'react-router-dom'

const tabs = [
  { to: '/', label: 'Resident', end: true },
  { to: '/ops', label: 'Council Ops', end: false },
  { to: '/performance', label: 'Public Dashboard', end: false },
]

/** GDS service-navigation links (active = bold with a 4px blue underline). */
export function ViewSwitcher() {
  return (
    <nav aria-label="Service navigation">
      <ul className="flex flex-wrap items-center gap-x-5">
        {tabs.map(({ to, label, end }) => (
          <li key={to}>
            <NavLink
              to={to}
              end={end}
              className={({ isActive }) =>
                `inline-block border-b-[3px] py-3 text-base font-semibold no-underline ${
                  isActive
                    ? 'border-govblue text-ink'
                    : 'border-transparent text-govblue hover:text-govblue-dark hover:underline'
                }`
              }
            >
              {label}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  )
}
