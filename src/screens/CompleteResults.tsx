import { useEffect, useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import { useTournament } from '../hooks/useTournaments'
import { useMatches } from '../hooks/useMatches'
import {
  savePrediction,
  usePredictionsByMatch,
  useTournamentPredictions,
} from '../hooks/usePredictions'
import { matchPoints } from '../lib/scoring'
import { dayLabel, isLocked, timeLabel } from '../lib/format'
import { PHASE_LABELS, type Match, type Prediction } from '../types/models'
import { EmptyState, Flag, FullLoader, TopBar } from '../components/ui'

type Tab = 'finalizados' | 'proximos'

function Tabs({ tab, onChange }: { tab: Tab; onChange: (t: Tab) => void }) {
  const base = 'flex-1 rounded-2xl py-3 text-center text-base font-bold transition'
  return (
    <div className="mx-4 flex gap-1 rounded-2xl border border-gray-200 bg-white p-1">
      <button
        type="button"
        onClick={() => onChange('finalizados')}
        className={`${base} ${tab === 'finalizados' ? 'bg-white text-gray-900 ring-2 ring-indigo-600' : 'text-gray-600'}`}
      >
        Finalizados
      </button>
      <button
        type="button"
        onClick={() => onChange('proximos')}
        className={`${base} ${tab === 'proximos' ? 'bg-white text-gray-900 ring-2 ring-indigo-600' : 'text-gray-600'}`}
      >
        Próximos
      </button>
    </div>
  )
}

function MatchHeader({ match }: { match: Match }) {
  return (
    <div className="flex items-baseline justify-between px-5 pt-4">
      <span className="text-[15px] font-bold text-gray-900">{PHASE_LABELS[match.phase]}</span>
      <span className="text-[15px] font-bold text-gray-900">{timeLabel(match.kickoff)}</span>
    </div>
  )
}

function TeamsRow({ match, center }: { match: Match; center?: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between px-8 py-4">
      <div className="flex w-20 flex-col items-center gap-1.5">
        <Flag code={match.teamA.flagCode} name={match.teamA.name} />
        <span className="text-center text-sm text-gray-700">{match.teamA.name}</span>
      </div>
      <div className="flex items-center justify-center">
        {center ?? <span className="text-base font-bold text-gray-900">VS</span>}
      </div>
      <div className="flex w-20 flex-col items-center gap-1.5">
        <Flag code={match.teamB.flagCode} name={match.teamB.name} />
        <span className="text-center text-sm text-gray-700">{match.teamB.name}</span>
      </div>
    </div>
  )
}

function ScoreEditor({
  match,
  initial,
  onConfirm,
  busy,
}: {
  match: Match
  initial: Prediction | undefined
  onConfirm: (a: number, b: number) => void
  busy: boolean
}) {
  const [a, setA] = useState(initial ? String(initial.scoreA) : '')
  const [b, setB] = useState(initial ? String(initial.scoreB) : '')
  const valid = /^\d{1,2}$/.test(a) && /^\d{1,2}$/.test(b)

  const inputCls =
    'h-14 w-14 rounded-xl border-2 border-gray-200 text-center text-xl font-bold outline-none focus:border-indigo-600'

  return (
    <div className="rounded-2xl ring-2 ring-indigo-600">
      <MatchHeader match={match} />
      <div className="flex items-center justify-between px-6 py-4">
        <div className="flex w-20 flex-col items-center gap-1.5">
          <Flag code={match.teamA.flagCode} name={match.teamA.name} />
          <span className="text-center text-sm text-gray-700">{match.teamA.name}</span>
        </div>
        <div className="flex items-center gap-2">
          <input
            inputMode="numeric"
            maxLength={2}
            value={a}
            onChange={(e) => setA(e.target.value.replace(/\D/g, ''))}
            aria-label={`Goles de ${match.teamA.name}`}
            className={inputCls}
          />
          <span className="text-sm font-bold text-gray-500">vs</span>
          <input
            inputMode="numeric"
            maxLength={2}
            value={b}
            onChange={(e) => setB(e.target.value.replace(/\D/g, ''))}
            aria-label={`Goles de ${match.teamB.name}`}
            className={inputCls}
          />
        </div>
        <div className="flex w-20 flex-col items-center gap-1.5">
          <Flag code={match.teamB.flagCode} name={match.teamB.name} />
          <span className="text-center text-sm text-gray-700">{match.teamB.name}</span>
        </div>
      </div>
      <div className="px-4 pb-4">
        <button
          type="button"
          disabled={!valid || busy}
          onClick={() => onConfirm(Number(a), Number(b))}
          className="w-full rounded-xl bg-indigo-600 py-3 text-base font-bold text-white active:bg-indigo-700 disabled:opacity-40"
        >
          {busy ? 'Guardando…' : 'Confirmar'}
        </button>
      </div>
    </div>
  )
}

function PointsChip({ points }: { points: 0 | 3 | 6 }) {
  const styles =
    points === 6
      ? 'bg-green-100 text-green-700'
      : points === 3
        ? 'bg-amber-100 text-amber-700'
        : 'bg-gray-100 text-gray-500'
  return (
    <span className={`rounded-full px-3 py-1 text-sm font-black ${styles}`}>
      +{points} porotos
    </span>
  )
}

export default function CompleteResults() {
  const { tid } = useParams()
  const user = useAuthStore((s) => s.user)
  const tournament = useTournament(tid)
  const matches = useMatches(tid)
  const { predictions, error: predictionsError } = useTournamentPredictions(tid)
  const byMatch = usePredictionsByMatch(predictions)

  const [tab, setTab] = useState<Tab>('proximos')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [savingId, setSavingId] = useState<string | null>(null)
  const [now, setNow] = useState(() => Date.now())

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 30_000)
    return () => clearInterval(id)
  }, [])

  const { upcoming, finished } = useMemo(() => {
    const all = matches ?? []
    return {
      upcoming: all.filter((m) => m.status !== 'finished'),
      finished: all.filter((m) => m.status === 'finished'),
    }
  }, [matches])

  if (!tournament || matches === null || predictions === null) return <FullLoader />

  const canPlay =
    !!user &&
    !(tournament.disabledUids ?? []).includes(user.uid) &&
    !(tournament.removedUids ?? []).includes(user.uid)

  const list = tab === 'proximos' ? upcoming : finished
  const groups: { day: string; items: Match[] }[] = []
  for (const m of list) {
    const day = dayLabel(m.kickoff)
    const last = groups[groups.length - 1]
    if (last && last.day === day) last.items.push(m)
    else groups.push({ day, items: [m] })
  }

  const myPred = (m: Match) => (user ? byMatch.get(m.id)?.get(user.uid) : undefined)

  async function handleConfirm(m: Match, a: number, b: number) {
    if (!user || !tid) return
    setSavingId(m.id)
    try {
      await savePrediction(tid, m.id, user.uid, a, b)
      setEditingId(null)
    } catch {
      alert('No se pudo guardar. ¿El partido ya empezó?')
    } finally {
      setSavingId(null)
    }
  }

  return (
    <div className="min-h-dvh bg-white pb-10">
      <TopBar title="Completá tus resultados" backTo={`/torneo/${tid}`} />
      <div className="pt-2">
        <Tabs tab={tab} onChange={setTab} />
      </div>

      {predictionsError && (
        <p className="mx-4 mt-3 rounded-xl bg-amber-50 px-4 py-3 text-sm font-medium text-amber-800">
          ⚠️ {predictionsError}
        </p>
      )}

      {!canPlay && (
        <p className="mx-4 mt-3 rounded-xl bg-amber-50 px-4 py-3 text-sm font-medium text-amber-800">
          El organizador te deshabilitó en este torneo. Podés ver tus pronósticos guardados, pero no
          cargar ni editar nuevos hasta que te vuelva a habilitar.
        </p>
      )}

      {groups.length === 0 && (
        <EmptyState
          icon={tab === 'proximos' ? '📅' : '🏁'}
          title={tab === 'proximos' ? 'No hay partidos próximos' : 'Todavía no hay partidos finalizados'}
          subtitle={tab === 'proximos' ? 'El organizador todavía no cargó partidos.' : undefined}
        />
      )}

      {groups.map((group) => (
        <section key={group.day} className="px-4">
          <h2 className="px-1 pb-2 pt-5 text-lg font-black">{group.day}</h2>
          <div className="flex flex-col gap-4">
            {group.items.map((m) => {
              const pred = myPred(m)
              const locked = isLocked(m.kickoff, now) || !canPlay

              if (tab === 'finalizados' && m.official) {
                const points = pred ? matchPoints(pred, m.official) : null
                return (
                  <article key={m.id} className="rounded-2xl border border-gray-200 shadow-sm">
                    <MatchHeader match={m} />
                    <TeamsRow
                      match={m}
                      center={
                        <span className="text-2xl font-black tracking-wide">
                          {m.official.a} - {m.official.b}
                        </span>
                      }
                    />
                    <div className="flex items-center justify-between border-t border-gray-100 px-5 py-3.5">
                      <span className="text-[15px] font-bold">Tu resultado</span>
                      {pred ? (
                        <span className="text-lg font-black">
                          {pred.scoreA} - {pred.scoreB}
                        </span>
                      ) : (
                        <span className="text-sm text-gray-400">Sin pronóstico</span>
                      )}
                      {points !== null && <PointsChip points={points} />}
                    </div>
                  </article>
                )
              }

              // Próximos: colapsado por defecto, se abre solo el que se toca en "Editar".
              const editing = !locked && editingId === m.id
              if (editing) {
                return (
                  <ScoreEditor
                    key={m.id}
                    match={m}
                    initial={pred}
                    busy={savingId === m.id}
                    onConfirm={(a, b) => handleConfirm(m, a, b)}
                  />
                )
              }
              return (
                <article key={m.id} className="rounded-2xl border border-gray-200 shadow-sm">
                  <MatchHeader match={m} />
                  <TeamsRow match={m} />
                  <div className="flex items-center justify-between border-t border-gray-100 px-5 py-3">
                    <span className="text-[15px] font-bold">Tu resultado</span>
                    {pred ? (
                      <span className="text-lg font-black">
                        {pred.scoreA} - {pred.scoreB}
                      </span>
                    ) : (
                      <span className="text-sm text-gray-400">Sin pronóstico</span>
                    )}
                    {locked ? (
                      <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-bold text-gray-500">
                        🔒 Cerrado
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setEditingId(m.id)}
                        className="rounded-full bg-indigo-600 px-5 py-2 text-sm font-bold text-white active:bg-indigo-700"
                      >
                        {pred ? 'Editar' : 'Completar'}
                      </button>
                    )}
                  </div>
                </article>
              )
            })}
          </div>
        </section>
      ))}
    </div>
  )
}
