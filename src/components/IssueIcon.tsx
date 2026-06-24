import type { IssueType } from '../types'
import { Flame, Droplets, CloudRain, Hammer, Zap, Wrench } from 'lucide-react'

const map: Record<IssueType, typeof Wrench> = {
  boiler: Flame,
  leak: Droplets,
  damp: CloudRain,
  structural: Hammer,
  electrical: Zap,
  other: Wrench,
}

export function IssueIcon({ issue, className = 'h-5 w-5' }: { issue?: IssueType; className?: string }) {
  const Icon = map[issue ?? 'other']
  return <Icon className={className} aria-hidden="true" />
}
