import { Link, Outlet, useLocation } from 'react-router-dom'
import { GovukLogo } from './GovukLogo'
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
        {/* GOV.UK black masthead */}
        <div className="bg-ink text-white">
          <div className="container-page py-2">
            <Link to="/" className="inline-flex text-white no-underline hover:text-white">
              <GovukLogo />
            </Link>
          </div>
        </div>

        {/* GDS service navigation */}
        <div className="border-b border-line bg-white">
          <div className="container-page flex flex-wrap items-center gap-x-6 gap-y-1">
            <Link to="/" className="py-3 text-base font-bold text-ink no-underline hover:underline">
              Patch
            </Link>
            <ViewSwitcher />
            <span className="ml-auto hidden py-3 text-sm text-midgrey lg:inline">
              Signed in as <span className="font-semibold text-ink">{id.who}</span> · {id.detail}
            </span>
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
