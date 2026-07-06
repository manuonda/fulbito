import { useMemo } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import { isOrganizerOf } from '../config/roles'
import { useTournament } from '../hooks/useTournaments'
import { useMatches } from '../hooks/useMatches'
import { usePredictionsByMatch, useTournamentPredictions } from '../hooks/usePredictions'
import { useUsersMap, userLabel } from '../hooks/useUsers'
import { matchPoints } from '../lib/scoring'
import { deletePrediction, removePlayer } from '../lib/db'
import { dayLabel, isLocked, timeLabel } from '../lib/format'
import { PHASE_LABELS } from '../types/models'
import { EmptyState, Flag, FullLoader, TopBar } from '../components/ui'

export default function ParticipantDetail() {
  const { tid, puid } = useParams()
  const navigate = useNavigate()
  const me = useAuthStore((s) => s.user)
  const isAdmin = useAuthStore((s) => s.isAdmin)
  const tournament = useTournament(tid)
  const matches = useMatches(tid)
  const { predictions } = useTournamentPredictions(tid)
  const byMatch = usePredictionsByMatch(predictions)
  const users = useUsersMap(tournament?.members)

  const isSelf = me?.uid === puid

  const rows = useMemo(() => {
    if (!matches || !puid) return null
    // Los pronósticos ajenos se revelan recién tras el kickoff (para no espiar)
    return matches
      .filter((m) => isSelf || isLocked(m.kickoff) || m.status === 'finished')
      .map((m) => {
        const pred = byMatch.get(m.id)?.get(puid)
        const points = pred && m.official ? matchPoints(pred, m.official) : null
        return { match: m, pred, points }
      })
  }, [matches, byMatch, puid, isSelf])

  if (!tournament || rows === null) return <FullLoader />

  const canManage = isAdmin || isOrganizerOf(tournament, me?.uid)
  const total = rows.reduce((acc, r) => acc + (r.points ?? 0), 0)
  const hiddenCount = (matches?.length ?? 0) - rows.length

  async function handleRemoveMember() {
    if (!tid || !puid) return
    const label = userLabel(puid, users)
    if (
      !confirm(
        `¿Eliminar a ${label} del torneo? Deja de contar en el ranking (sus pronósticos quedan guardados por si lo volvés a habilitar desde Gestionar jugadores).`,
      )
    )
      return
    await removePlayer(tid, puid)
    navigate(`/torneo/${tid}`, { replace: true })
  }

  async function handleDeletePrediction(matchId: string) {
    if (!tid || !puid) return
    if (!confirm('¿Eliminar este pronóstico? No se puede deshacer.')) return
    await deletePrediction(tid, matchId, puid)
  }

  return (
    <div className="min-h-dvh bg-white pb-10">
      <TopBar title={puid ? userLabel(puid, users) : ''} backTo={`/torneo/${tid}`} />

      <div className="flex flex-col items-center pt-2">
        <p className="text-4xl font-black">{total}</p>
        <p className="text-sm text-gray-500">porotos en {tournament.name}</p>
        {canManage && !isSelf && (
          <button
            type="button"
            onClick={handleRemoveMember}
            className="mt-3 rounded-full bg-red-50 px-4 py-1.5 text-xs font-bold text-red-600 active:bg-red-100"
          >
            Eliminar del torneo
          </button>
        )}
      </div>

      <div className="flex flex-col gap-3 px-4 pt-6">
        {rows.length === 0 && (
          <EmptyState
            icon="🙈"
            title="Nada para ver todavía"
            subtitle="Los pronósticos de otros jugadores se revelan cuando arranca cada partido."
          />
        )}
        {rows.map(({ match: m, pred, points }) => (
          <article key={m.id} className="rounded-2xl border border-gray-200 shadow-sm">
            <div className="flex items-baseline justify-between px-4 pt-3">
              <span className="text-sm font-bold text-gray-900">{PHASE_LABELS[m.phase]}</span>
              <span className="text-xs text-gray-500">
                {dayLabel(m.kickoff)} · {timeLabel(m.kickoff)}
              </span>
            </div>
            <div className="flex items-center justify-between px-5 py-3">
              <div className="flex items-center gap-2">
                <Flag code={m.teamA.flagCode} name={m.teamA.name} size={36} />
                <span className="text-sm text-gray-700">{m.teamA.name}</span>
              </div>
              <span className="px-2 text-base font-black">
                {m.official ? `${m.official.a} - ${m.official.b}` : 'VS'}
              </span>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-700">{m.teamB.name}</span>
                <Flag code={m.teamB.flagCode} name={m.teamB.name} size={36} />
              </div>
            </div>
            <div className="flex items-center justify-between border-t border-gray-100 px-4 py-2.5">
              <span className="text-sm font-bold">
                {isSelf ? 'Tu pronóstico' : 'Su pronóstico'}
              </span>
              {pred ? (
                <span className="text-base font-black">
                  {pred.scoreA} - {pred.scoreB}
                </span>
              ) : (
                <span className="text-sm text-gray-400">Sin pronóstico</span>
              )}
              {points !== null && (
                <span
                  className={`rounded-full px-2.5 py-0.5 text-sm font-black ${
                    points === 6
                      ? 'bg-green-100 text-green-700'
                      : points === 3
                        ? 'bg-amber-100 text-amber-700'
                        : 'bg-gray-100 text-gray-500'
                  }`}
                >
                  +{points}
                </span>
              )}
              {canManage && pred && (
                <button
                  type="button"
                  onClick={() => handleDeletePrediction(m.id)}
                  className="ml-2 text-xs font-bold text-red-600 active:text-red-800"
                >
                  Eliminar
                </button>
              )}
            </div>
          </article>
        ))}
        {hiddenCount > 0 && !isSelf && (
          <p className="pt-2 text-center text-xs text-gray-400">
            🔒 {hiddenCount} {hiddenCount === 1 ? 'pronóstico oculto' : 'pronósticos ocultos'} hasta
            el inicio de cada partido.
          </p>
        )}
      </div>
    </div>
  )
}
