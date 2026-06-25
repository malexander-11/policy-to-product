export interface ErrorItem {
  id: string
  text: string
}

/** GOV.UK error summary — red box listing problems, each linking to its field. */
export function ErrorSummary({ errors, title = 'There is a problem' }: { errors: ErrorItem[]; title?: string }) {
  if (errors.length === 0) return null
  return (
    <div className="mb-6 border-4 border-emergency p-4" role="alert" aria-labelledby="error-summary-title" tabIndex={-1}>
      <h2 id="error-summary-title" className="text-lg font-bold text-ink">
        {title}
      </h2>
      <ul className="mt-2 space-y-1">
        {errors.map((e) => (
          <li key={e.id}>
            <a href={`#${e.id}`} className="font-bold text-emergency underline hover:text-emergency-dark">
              {e.text}
            </a>
          </li>
        ))}
      </ul>
    </div>
  )
}
