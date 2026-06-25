import { Link } from 'react-router-dom'
import { Crown } from 'lucide-react'

export function Footer() {
  return (
    <footer className="mt-12 border-t border-line bg-lightgrey">
      <div className="container-page py-8">
        <nav aria-label="Footer" className="mb-6 flex flex-wrap gap-x-6 gap-y-2 text-sm">
          <Link className="text-govblue underline hover:text-govblue-dark" to="/">
            Report a repair
          </Link>
          <Link className="text-govblue underline hover:text-govblue-dark" to="/ops">
            Council Ops
          </Link>
          <Link className="text-govblue underline hover:text-govblue-dark" to="/performance">
            Performance data
          </Link>
          <a className="text-govblue underline hover:text-govblue-dark" href={`${import.meta.env.BASE_URL}presentation.html`}>
            The thinking behind this
          </a>
        </nav>

        <div className="flex flex-col gap-4 border-t border-line pt-6 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-start gap-2">
            <Crown className="h-6 w-6 shrink-0 text-ink" aria-hidden="true" />
            <p className="max-w-2xl text-sm text-ink">
              All content is available under the{' '}
              <a
                className="text-govblue underline hover:text-govblue-dark"
                href="https://www.nationalarchives.gov.uk/doc/open-government-licence/version/3/"
                rel="noopener noreferrer"
                target="_blank"
              >
                Open Government Licence v3.0
              </a>
              , except where otherwise stated. This is a prototype — all cases and data shown are mock data.
            </p>
          </div>
          <p className="shrink-0 text-sm text-ink">© Crown copyright</p>
        </div>
      </div>
    </footer>
  )
}
