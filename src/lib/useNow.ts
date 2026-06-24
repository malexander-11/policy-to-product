import { useEffect, useState } from 'react'

/**
 * A clock that re-renders on an interval — drives live SLA countdowns and
 * at-risk recomputation in the Ops dispatcher. Defaults to once per second.
 */
export function useNow(intervalMs = 1000): Date {
  const [now, setNow] = useState(() => new Date())
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), intervalMs)
    return () => clearInterval(id)
  }, [intervalMs])
  return now
}
