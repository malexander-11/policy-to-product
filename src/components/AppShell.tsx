import { Outlet, useLocation } from 'react-router-dom'
import { Landmark } from 'lucide-react'
import { ViewSwitcher } from './ViewSwitcher'
import { PhaseBanner } from './PhaseBanner'
import { Footer } from './Footer'

/** The simulated signed-in user, by view (no real auth — demo only). */
function identityFor(pathname: string): { who: string; detail: string } {
  if (pathname.startsWith('/ops')) return { who: 'Dispatcher', detail: 'Riverford Ops' }
  if (pathname.startsWith('/performance')) return { who: 'Public', detail: 'Open data' }
  return { who: 'Aisha Bello', detail: '12 Acacia House, Flat 4' }
}

export function AppShell() {
  const { pathname } = useLocation()
  const id = identityFor(pathname)

  return (
    <div className="flex min-h-screen flex-col">
      <a href="#main" className="skip-link">
        Skip to main content
      </a>

      <header>
        {/* Thin GOV.UK-style black masthead */}
        <div className="bg-ink text-white">
          <div className="container-page flex flex-wrap items-center gap-x-4 gap-y-2 py-2.5">
            <div className="flex items-center gap-2">
              <span
                className="flex h-7 w-7 items-center justify-center rounded-sm bg-white/10 ring-1 ring-inset ring-white/25"
                aria-hidden="true"
              >
                <Landmark className="h-4 w-4" />
              </span>
              <span className="text-lg font-extrabold tracking-tight">Patch</span>
              <span className="hidden text-sm text-white/70 sm:inline">— Right to Repair Digital Service</span>
            </div>

            <div className="ml-auto flex items-center gap-3">
              <span className="hidden items-center gap-1.5 text-xs md:inline-flex">
                <span className="text-white/55">Signed in as</span>
                <span className="font-semibold text-white">{id.who}</span>
                <span className="text-white/55">· {id.detail}</span>
              </span>
              <ViewSwitcher />
            </div>
          </div>
        </div>
        <PhaseBanner />
      </header>

      <main id="main" className="container-page w-full flex-1 py-6 sm:py-8">
        <Outlet />
      </main>

      <Footer />
    </div>
  )
}
