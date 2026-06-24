import { useLocation } from 'react-router-dom'
import type { Mode } from '../types'

/** The current view (resident vs caseworker) is derived from the route, so the
 *  nav and the URL can never disagree. */
export function useMode(): Mode {
  const { pathname } = useLocation()
  return pathname.startsWith('/officer') ? 'caseworker' : 'resident'
}
