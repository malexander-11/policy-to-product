import { Link } from 'react-router-dom'

export function Footer() {
  return (
    <footer className="mt-16 border-t-4 border-govblue bg-white">
      <div className="container-page py-8">
        <div className="flex flex-col gap-6 sm:flex-row sm:justify-between">
          <div className="max-w-md">
            <p className="font-bold text-ink">Patch — Right to Repair</p>
            <p className="mt-1 text-sm text-midgrey">
              A prototype social housing repairs service delivered by Riverford Borough Council under the national
              Right to Repair digital initiative.
            </p>
          </div>
          <nav aria-label="Footer" className="grid grid-cols-2 gap-x-10 gap-y-2 text-sm">
            <Link className="text-govblue hover:underline" to="/">
              Report a repair
            </Link>
            <Link className="text-govblue hover:underline" to="/ops">
              Council Ops
            </Link>
            <Link className="text-govblue hover:underline" to="/performance">
              Performance data
            </Link>
          </nav>
        </div>
        <p className="mt-8 border-t border-slate-200 pt-4 text-xs text-midgrey">
          Prototype only · No real personal data · Built for a council discovery/alpha playback. Emergency phone
          numbers shown are illustrative.
        </p>
      </div>
    </footer>
  )
}
