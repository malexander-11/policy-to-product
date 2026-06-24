import { useNavigate } from 'react-router-dom'
import { Home, Building2 } from 'lucide-react'
import { useMode } from '../lib/useMode'
import type { Mode } from '../types'

const options: { key: Mode; label: string; to: string; icon: typeof Home }[] = [
  { key: 'resident', label: 'Resident', to: '/', icon: Home },
  { key: 'caseworker', label: 'Council officer', to: '/officer', icon: Building2 },
]

export function ModeToggle() {
  const mode = useMode()
  const navigate = useNavigate()

  return (
    <div
      role="group"
      aria-label="Switch between resident and council officer views"
      className="inline-flex rounded-lg bg-black/25 p-1 ring-1 ring-inset ring-white/20"
    >
      {options.map((o) => {
        const active = mode === o.key
        const Icon = o.icon
        return (
          <button
            key={o.key}
            type="button"
            aria-pressed={active}
            onClick={() => navigate(o.to)}
            className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-semibold transition-colors ${
              active ? 'bg-white text-navy shadow-sm' : 'text-white/85 hover:bg-white/10 hover:text-white'
            }`}
          >
            <Icon className="h-4 w-4" aria-hidden="true" />
            {o.label}
          </button>
        )
      })}
    </div>
  )
}
