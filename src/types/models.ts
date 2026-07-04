import type { Timestamp } from 'firebase/firestore'

export type Provider = 'google' | 'password'

export interface UserDoc {
  email: string
  username?: string
  firstName?: string
  lastName?: string
  displayName: string
  photoURL?: string | null
  provider: Provider
}

export type TournamentType = 'amistoso' | 'porotos'

export interface Tournament {
  id: string
  name: string
  type: TournamentType
  porotosPerMember: number
  createdBy: string
  members: string[]
  createdAt: Timestamp | null
}

export type Phase = '16vos' | 'octavos' | 'cuartos' | 'semis' | 'final'

export const PHASES: Phase[] = ['16vos', 'octavos', 'cuartos', 'semis', 'final']

export const PHASE_LABELS: Record<Phase, string> = {
  '16vos': '16vos de final',
  octavos: 'Octavos de final',
  cuartos: 'Cuartos de final',
  semis: 'Semifinal',
  final: 'Final',
}

export interface Team {
  name: string
  flagCode: string
}

export type MatchStatus = 'upcoming' | 'finished'

export interface Match {
  id: string
  phase: Phase
  teamA: Team
  teamB: Team
  kickoff: Timestamp
  status: MatchStatus
  official: { a: number; b: number } | null
}

export interface Prediction {
  uid: string
  tournamentId: string
  matchId: string
  scoreA: number
  scoreB: number
  updatedAt: Timestamp | null
}
