export function PhaseBanner() {
  return (
    <div className="border-b border-line bg-white">
      <div className="container-page flex items-center gap-3 py-2">
        <span className="inline-block bg-govblue px-2 py-0.5 text-xs font-bold uppercase tracking-wide text-white">
          Alpha
        </span>
        <p className="text-sm text-ink">
          This is a new service – your feedback will help us to improve it. All data shown is mock data.
        </p>
      </div>
    </div>
  )
}
