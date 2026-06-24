import { Link, Outlet } from 'react-router-dom'
import { Wrench } from 'lucide-react'
import { ModeToggle } from './ModeToggle'
import { TopNav } from './TopNav'
import { PhaseBanner } from './PhaseBanner'
import { Footer } from './Footer'
import { useMode } from '../lib/useMode'

export function AppShell() {
  const mode = useMode()
  const homeHref = mode === 'caseworker' ? '/officer' : '/'

  return (
    <div className="flex min-h-screen flex-col">
      <a href="#main" className="skip-link">
        Skip to main content
      </a>

      <header>
        <div className="bg-navy text-white">
          <div className="container-page flex flex-col gap-3 py-3 sm:flex-row sm:items-center sm:justify-between">
            <Link
              to={homeHref}
              className="flex items-center gap-3 rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus"
            >
              <span className="flex h-9 w-9 items-center justify-center rounded-md bg-white/10 ring-1 ring-inset ring-white/20">
                <Wrench className="h-5 w-5" aria-hidden="true" />
              </span>
              <span>
                <span className="block text-lg font-extrabold leading-tight">Right to Repair</span>
                <span className="block text-xs text-white/70">Riverford Borough Council</span>
              </span>
            </Link>
            <ModeToggle />
          </div>
        </div>
        <TopNav />
        <PhaseBanner />
      </header>

      <main id="main" className="container-page w-full flex-1 py-8">
        <Outlet />
      </main>

      <Footer />
    </div>
  )
}
