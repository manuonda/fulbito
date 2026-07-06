import type { ReactNode } from 'react'
import { Navigate, useLocation, useParams } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import { useTournament } from '../hooks/useTournaments'
import { isOrganizerOf } from '../config/roles'
import { FullLoader } from './ui'
import { rememberReturnTo } from '../lib/returnTo'

export function RequireAuth({ children }: { children: ReactNode }) {
  const status = useAuthStore((s) => s.status)
  const location = useLocation()
  if (status === 'loading') return <FullLoader />
  if (status === 'signedOut') {
    rememberReturnTo(location.pathname)
    return <Navigate to="/" replace />
  }
  return children
}

export function RequireAdmin({ children }: { children: ReactNode }) {
  const status = useAuthStore((s) => s.status)
  const isAdmin = useAuthStore((s) => s.isAdmin)
  if (status === 'loading') return <FullLoader />
  if (status === 'signedOut') return <Navigate to="/" replace />
  if (!isAdmin) return <Navigate to="/home" replace />
  return children
}

export function RequireOrganizer({ children }: { children: ReactNode }) {
  const { tid } = useParams()
  const status = useAuthStore((s) => s.status)
  const isAdmin = useAuthStore((s) => s.isAdmin)
  const user = useAuthStore((s) => s.user)
  const tournament = useTournament(tid)

  if (status === 'loading' || tournament === undefined) return <FullLoader />
  if (status === 'signedOut') return <Navigate to="/" replace />
  if (!isAdmin && !isOrganizerOf(tournament, user?.uid)) return <Navigate to="/home" replace />
  return children
}
