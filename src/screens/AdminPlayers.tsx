import { useMemo } from 'react'
import { useParams } from 'react-router-dom'
import { useTournament } from '../hooks/useTournaments'
import { useUsersMap, userLabel } from '../hooks/useUsers'
import { disablePlayer, enablePlayer, removePlayer } from '../lib/db'
import { EmptyState, FullLoader, TopBar } from '../components/ui'

type Status = 'enabled' | 'disabled' | 'removed'

const STATUS_LABEL: Record<Status, string> = {
  enabled: 'Habilitado',
  disabled: 'Deshabilitado',
  removed: 'Eliminado',
}

const STATUS_STYLE: Record<Status, string> = {
  enabled: 'bg-green-100 text-green-700',
  disabled: 'bg-amber-100 text-amber-700',
  removed: 'bg-red-100 text-red-700',
}

export default function AdminPlayers() {
  const { tid } = useParams()
  const tournament = useTournament(tid)
  const users = useUsersMap(tournament?.members)

  const rows = useMemo(() => {
    if (!tournament) return null
    const disabled = new Set(tournament.disabledUids ?? [])
    const removed = new Set(tournament.removedUids ?? [])
    return tournament.members.map((uid) => {
      const status: Status = removed.has(uid) ? 'removed' : disabled.has(uid) ? 'disabled' : 'enabled'
      return { uid, status }
    })
  }, [tournament])

  if (tournament === undefined || rows === null) return <FullLoader />
  if (tournament === null)
    return (
      <div className="min-h-dvh bg-white">
        <TopBar title="Jugadores" backTo="/home" />
        <EmptyState icon="🤔" title="Este torneo no existe" />
      </div>
    )

  return (
    <div className="min-h-dvh bg-white pb-10">
      <TopBar title={`Jugadores · ${tournament.name}`} backTo={`/torneo/${tid}`} />
      <p className="px-5 pt-2 text-sm text-gray-500">
        Cualquiera que abra el link del torneo se suma solo, ya habilitado. Desde acá podés
        pausarlo o sacarlo si hace falta.
      </p>

      <div className="flex flex-col gap-3 px-4 pt-4">
        {rows.length === 0 && <EmptyState icon="👥" title="Todavía no se sumó nadie" />}
        {rows.map(({ uid, status }) => (
          <div
            key={uid}
            className="flex items-center justify-between gap-3 rounded-2xl border border-gray-200 px-4 py-3"
          >
            <div className="min-w-0 flex-1">
              <p className="truncate text-[15px] font-semibold text-gray-900">
                {userLabel(uid, users)}
              </p>
              <span
                className={`mt-0.5 inline-block rounded-full px-2 py-0.5 text-xs font-bold ${STATUS_STYLE[status]}`}
              >
                {STATUS_LABEL[status]}
              </span>
            </div>
            <div className="flex shrink-0 gap-2">
              {status !== 'enabled' && (
                <button
                  type="button"
                  onClick={() => enablePlayer(tid!, uid)}
                  className="rounded-full bg-green-50 px-3 py-1.5 text-xs font-bold text-green-700 active:bg-green-100"
                >
                  Habilitar
                </button>
              )}
              {status === 'enabled' && (
                <button
                  type="button"
                  onClick={() => disablePlayer(tid!, uid)}
                  className="rounded-full bg-amber-50 px-3 py-1.5 text-xs font-bold text-amber-700 active:bg-amber-100"
                >
                  Deshabilitar
                </button>
              )}
              {status !== 'removed' && (
                <button
                  type="button"
                  onClick={() => {
                    if (
                      confirm(
                        `¿Eliminar a ${userLabel(uid, users)} del torneo? Deja de contar en el ranking; si vuelve a abrir el link, reaparece deshabilitado.`,
                      )
                    )
                      removePlayer(tid!, uid)
                  }}
                  className="rounded-full bg-red-50 px-3 py-1.5 text-xs font-bold text-red-600 active:bg-red-100"
                >
                  Eliminar
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
