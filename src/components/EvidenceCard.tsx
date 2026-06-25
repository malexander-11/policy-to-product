import { ImageIcon, Play, User, Building2, ShieldCheck } from 'lucide-react'
import type { EvidenceFile } from '../types'

export function EvidenceCard({ file, onRemove }: { file: EvidenceFile; onRemove?: () => void }) {
  const isVideo = file.type === 'video'
  return (
    <figure className="overflow-hidden rounded-lg border border-slate-200 bg-white">
      <div
        className={`relative flex h-28 items-center justify-center ${
          isVideo
            ? 'bg-gradient-to-br from-slate-700 to-slate-900'
            : 'bg-gradient-to-br from-sky-100 to-indigo-100'
        }`}
      >
        {isVideo ? (
          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-white/90">
            <Play className="h-5 w-5 text-slate-900" aria-hidden="true" />
          </div>
        ) : (
          <ImageIcon className="h-8 w-8 text-indigo-400" aria-hidden="true" />
        )}
        <span className="absolute right-2 top-2 rounded bg-black/55 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white">
          {file.type}
        </span>
        {onRemove && (
          <button
            type="button"
            onClick={onRemove}
            className="absolute left-2 top-2 rounded bg-white/90 px-2 py-0.5 text-xs font-semibold text-red-700 hover:bg-white"
          >
            Remove
          </button>
        )}
      </div>
      <figcaption className="p-2.5">
        <p className="truncate text-sm font-medium text-ink" title={file.name}>
          {file.name}
        </p>
        <p className="mt-0.5 flex items-center gap-1 text-xs text-midgrey">
          {file.uploadedBy === 'resident' ? (
            <User className="h-3 w-3" aria-hidden="true" />
          ) : (
            <Building2 className="h-3 w-3" aria-hidden="true" />
          )}
          {file.sizeLabel} · {file.uploadedBy === 'resident' ? 'Resident' : 'Council'}
        </p>
        {file.scanned && (
          <p className="mt-0.5 flex items-center gap-1 text-xs font-semibold text-govgreen">
            <ShieldCheck className="h-3 w-3" aria-hidden="true" />
            Scanned
          </p>
        )}
      </figcaption>
    </figure>
  )
}
