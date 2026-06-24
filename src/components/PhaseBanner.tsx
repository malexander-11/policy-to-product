export function PhaseBanner() {
  return (
    <div className="border-b border-slate-200 bg-white">
      <div className="container-page flex items-center gap-3 py-2">
        <span className="rounded bg-govblue px-2 py-0.5 text-xs font-bold uppercase tracking-wide text-white">
          Alpha
        </span>
        <p className="text-sm text-midgrey">
          This is a prototype for a council discovery/alpha playback. All cases and data shown are mock data.
        </p>
      </div>
    </div>
  )
}
