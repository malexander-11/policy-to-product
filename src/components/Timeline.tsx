import type { Actor, TimelineEvent } from '../types'
import { formatDateTime } from '../lib/format'

const actorDot: Record<Actor, string> = {
  resident: 'bg-govgreen',
  council: 'bg-govblue',
  system: 'bg-slate-400',
}

const actorLabel: Record<Actor, string> = {
  resident: 'Resident',
  council: 'Council',
  system: 'System',
}

export function Timeline({ events, newestFirst = true }: { events: TimelineEvent[]; newestFirst?: boolean }) {
  const ordered = [...events].sort((a, b) => {
    const diff = new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    return newestFirst ? -diff : diff
  })

  if (ordered.length === 0) {
    return <p className="text-sm text-midgrey">No events yet.</p>
  }

  return (
    <ol className="relative space-y-5">
      {ordered.map((ev, i) => (
        <li key={ev.id} className="relative flex gap-4">
          <div className="flex flex-col items-center">
            <span className={`mt-1 h-3 w-3 shrink-0 rounded-full ring-4 ring-white ${actorDot[ev.actor]}`} />
            {i < ordered.length - 1 && <span className="mt-1 w-px flex-1 bg-slate-200" />}
          </div>
          <div className="min-w-0 flex-1 pb-1">
            <div className="flex flex-wrap items-baseline justify-between gap-x-3">
              <p className="font-semibold text-navy">{ev.title}</p>
              <time className="text-xs text-midgrey" dateTime={ev.timestamp}>
                {formatDateTime(ev.timestamp)}
              </time>
            </div>
            {ev.description && <p className="mt-0.5 text-sm text-ink">{ev.description}</p>}
            <p className="mt-0.5 text-xs text-midgrey">{actorLabel[ev.actor]}</p>
          </div>
        </li>
      ))}
    </ol>
  )
}
