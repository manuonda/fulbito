import { useEffect, useMemo } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import { useTournament } from '../hooks/useTournaments'
import { useMatches } from '../hooks/useMatches'
import { useTournamentPredictions } from '../hooks/usePredictions'
import { useUsersMap, userLabel } from '../hooks/useUsers'
import { buildRanking, computeTotals } from '../lib/scoring'
import { joinTournament, reactivateFromRemoved } from '../lib/db'
import { EmptyState, FullLoader, TopBar, btnPrimary, btnSecondary, fmt } from '../components/ui'
import trophy from '../assets/trophy-cup.webp'

export default function TournamentRanking() {
  const { tid } = useParams()
  const navigate = useNavigate()
  const user = useAuthStore((s) => s.user)
  const isAdmin = useAuthStore((s) => s.isAdmin)
  const tournament = useTournament(tid)
  const matches = useMatches(tid)
  const { predictions, error: predictionsError } = useTournamentPredictions(tid)
  const users = useUsersMap(tournament?.members)

  const ranking = useMemo(() => {
    if (!tournament || !matches || !predictions) return null
    return buildRanking(
      tournament.members,
      computeTotals(matches, predictions),
      tournament.disabledUids ?? [],
      tournament.removedUids ?? [],
    )
  }, [tournament, matches, predictions])

  // Cualquiera que abre el link de un torneo PUBLICADO se suma solo, ya
  // habilitado. Si había sido eliminado y vuelve a entrar, reaparece
  // deshabilitado (no se auto-habilita). Mientras está en borrador, nadie
  // se suma todavía (salvo el organizador, que ya es miembro desde que lo creó).
  useEffect(() => {
    if (!user || !tid || !tournament) return
    const isPublished = tournament.published ?? true
    const isMember = tournament.members.includes(user.uid)
    const isRemoved = (tournament.removedUids ?? []).includes(user.uid)
    if (!isMember && isPublished) {
      joinTournament(tid, user.uid).catch(() => {})
    } else if (isMember && isRemoved) {
      reactivateFromRemoved(tid, user.uid).catch(() => {})
    }
  }, [user, tid, tournament])

  if (tournament === undefined) return <FullLoader />
  if (tournament === null)
    return (
      <div className="min-h-dvh bg-white">
        <TopBar title="Torneo" backTo="/home" />
        <EmptyState icon="🤔" title="Este torneo no existe" subtitle="Quizás fue eliminado." />
      </div>
    )

  const isMember = !!user && tournament.members.includes(user.uid)
  const isPublished = tournament.published ?? true
  const accumulated = tournament.porotosPerMember * tournament.members.length

  async function handleShare() {
    const text = `⚽ Sumate a "${tournament!.name}" en fulbito: ${location.origin}/torneo/${tid}`
    if (navigator.share) {
      await navigator.share({ text }).catch(() => {})
    } else {
      await navigator.clipboard.writeText(text)
      alert('Link copiado 📋')
    }
  }

  return (
    <div className="min-h-dvh bg-white pb-8">
      <TopBar
        backTo="/home"
        right={
          isAdmin ? (
            <Link
              to="/admin/crear-torneo"
              className="rounded-2xl bg-indigo-600 px-4 py-2.5 text-sm font-bold text-white active:bg-indigo-700"
            >
              Crear nuevo torneo
            </Link>
          ) : undefined
        }
      />

      <div className="flex flex-col items-center px-5 text-center">
        <h1 className="text-2xl font-black">{tournament.name}</h1>
        <img src={trophy} alt="Copa del torneo" className="mt-2 h-28 w-auto drop-shadow-lg" />
        {tournament.type === 'porotos' ? (
          <>
            <p className="mt-1 text-3xl font-black">{fmt(tournament.porotosPerMember)}</p>
            <p className="text-sm text-gray-500">por integrante</p>
            <p className="mt-2 text-sm font-bold text-green-700">
              Porotos acumulados: {fmt(accumulated)}
            </p>
          </>
        ) : (
          <p className="mt-1 text-sm font-semibold text-gray-500">Amistoso · por el honor 🤝</p>
        )}
        <button
          type="button"
          onClick={handleShare}
          className="mt-2 text-sm font-bold text-indigo-600 active:text-indigo-800"
        >
          Compartí el ranking ↗
        </button>
      </div>

      {isAdmin && !isPublished && (
        <div className="mx-5 mt-4 rounded-2xl bg-amber-50 px-4 py-3 text-sm text-amber-800">
          <p className="font-bold">Este torneo está en borrador.</p>
          <p>
            Todavía nadie puede inscribirse. Armá los partidos tranquilo y publicalo desde{' '}
            <Link to={`/torneo/${tid}/editar`} className="font-bold underline">
              Editar torneo
            </Link>{' '}
            cuando esté listo.
          </p>
        </div>
      )}

      <div className="mt-6 px-5">
        {predictionsError && (
          <p className="mb-3 rounded-xl bg-amber-50 px-4 py-3 text-sm font-medium text-amber-800">
            ⚠️ {predictionsError}
          </p>
        )}
        <div className="flex items-baseline justify-between pb-2">
          <h2 className="text-base font-bold">Integrantes</h2>
          <span className="text-sm font-bold text-gray-700">Puntos</span>
        </div>
        {!ranking ? (
          <FullLoader />
        ) : ranking.length === 0 ? (
          <EmptyState icon="👥" title="Todavía no hay integrantes" />
        ) : (
          <ul>
            {ranking.map((entry) => {
              const isSelf = entry.uid === user?.uid
              const isOrganizer = entry.uid === tournament.createdBy
              return (
                <li key={entry.uid}>
                  <Link
                    to={`/torneo/${tid}/participante/${entry.uid}`}
                    className={`-mx-2 flex items-center gap-3 rounded-xl px-2 py-3.5 active:bg-gray-100 ${isSelf ? 'bg-gray-50' : ''}`}
                  >
                    <span className="w-7 shrink-0 text-sm font-bold text-gray-900">
                      {entry.position}°
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="flex items-center gap-2">
                        <span className="truncate text-[15px] text-gray-900">
                          {userLabel(entry.uid, users)}
                        </span>
                        {isSelf && (
                          <span className="rounded-full bg-indigo-600 px-2 py-0.5 text-[10px] font-black tracking-wide text-white">
                            VOS
                          </span>
                        )}
                      </span>
                      {isOrganizer && (
                        <span className="text-sm font-medium text-indigo-600">Organizador</span>
                      )}
                      {entry.disabled && (
                        <span className="block text-xs font-bold text-amber-600">Deshabilitado</span>
                      )}
                    </span>
                    <span className="text-lg font-black">{entry.points}</span>
                    <span className="text-gray-300">
                      <svg width="18" height="18" viewBox="0 0 20 20" fill="none" aria-hidden="true">
                        <path d="m7.5 4 5.5 6-5.5 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </span>
                  </Link>
                </li>
              )
            })}
          </ul>
        )}
      </div>

      <div className="flex flex-col gap-3 px-5 pt-4">
        {isAdmin && (
          <>
            <button type="button" onClick={handleShare} className={btnPrimary}>
              Invitar
            </button>
            <Link to={`/torneo/${tid}/partidos`} className={btnSecondary}>
              Gestionar partidos
            </Link>
            <Link to={`/torneo/${tid}/jugadores`} className={btnSecondary}>
              Gestionar jugadores
            </Link>
            <Link to={`/torneo/${tid}/editar`} className={btnSecondary}>
              Editar torneo
            </Link>
          </>
        )}
        {isMember && (
          <button
            type="button"
            onClick={() => navigate(`/torneo/${tid}/resultados`)}
            className={btnSecondary}
          >
            Seguí completando resultados
          </button>
        )}
      </div>
    </div>
  )
}
