import { useState, type FormEvent } from 'react'
import { useParams } from 'react-router-dom'
import { useTournament } from '../hooks/useTournaments'
import { useMatches } from '../hooks/useMatches'
import {
  clearOfficialResult,
  createMatch,
  deleteMatch,
  setOfficialResult,
  updateMatch,
} from '../lib/db'
import { dayLabel, timeLabel, toLocalInputValue } from '../lib/format'
import { PHASES, PHASE_LABELS, type Match, type Phase } from '../types/models'
import { EmptyState, Flag, FullLoader, TopBar, btnPrimary, btnSecondary, inputBase } from '../components/ui'

interface FormState {
  phase: Phase
  teamAName: string
  teamAFlag: string
  teamBName: string
  teamBFlag: string
  kickoff: string
}

const emptyForm = (): FormState => ({
  phase: '16vos',
  teamAName: '',
  teamAFlag: '',
  teamBName: '',
  teamBFlag: '',
  kickoff: '',
})

function MatchForm({
  initial,
  onSave,
  onCancel,
}: {
  initial: FormState
  onSave: (f: FormState) => Promise<void>
  onCancel: () => void
}) {
  const [form, setForm] = useState(initial)
  const [busy, setBusy] = useState(false)
  const set = (key: keyof FormState) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm((f) => ({ ...f, [key]: e.target.value }))

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setBusy(true)
    try {
      await onSave(form)
    } finally {
      setBusy(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3 rounded-2xl border-2 border-indigo-200 bg-indigo-50/40 p-4">
      <label className="flex flex-col gap-1">
        <span className="text-sm font-semibold text-gray-700">Fase</span>
        <select value={form.phase} onChange={set('phase')} className={inputBase}>
          {PHASES.map((p) => (
            <option key={p} value={p}>
              {PHASE_LABELS[p]}
            </option>
          ))}
        </select>
      </label>
      <div className="grid grid-cols-2 gap-3">
        <label className="flex flex-col gap-1">
          <span className="text-sm font-semibold text-gray-700">Equipo A</span>
          <input required value={form.teamAName} onChange={set('teamAName')} placeholder="Argentina" className={inputBase} />
        </label>
        <label className="flex flex-col gap-1">
          <span className="flex items-center gap-2 text-sm font-semibold text-gray-700">
            Bandera {form.teamAFlag.length === 2 && <Flag code={form.teamAFlag} name="" size={20} />}
          </span>
          <input required maxLength={2} value={form.teamAFlag} onChange={set('teamAFlag')} placeholder="ar" className={inputBase} />
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-sm font-semibold text-gray-700">Equipo B</span>
          <input required value={form.teamBName} onChange={set('teamBName')} placeholder="Brasil" className={inputBase} />
        </label>
        <label className="flex flex-col gap-1">
          <span className="flex items-center gap-2 text-sm font-semibold text-gray-700">
            Bandera {form.teamBFlag.length === 2 && <Flag code={form.teamBFlag} name="" size={20} />}
          </span>
          <input required maxLength={2} value={form.teamBFlag} onChange={set('teamBFlag')} placeholder="br" className={inputBase} />
        </label>
      </div>
      <p className="text-xs text-gray-500">
        Bandera: código de país de 2 letras (ar, br, fr, ca, ma…).
      </p>
      <label className="flex flex-col gap-1">
        <span className="text-sm font-semibold text-gray-700">Fecha y hora (kickoff)</span>
        <input type="datetime-local" required value={form.kickoff} onChange={set('kickoff')} className={inputBase} />
      </label>
      <div className="flex gap-2 pt-1">
        <button type="button" onClick={onCancel} className={`${btnSecondary} flex-1`}>
          Cancelar
        </button>
        <button type="submit" disabled={busy} className={`${btnPrimary} flex-1`}>
          {busy ? 'Guardando…' : 'Guardar'}
        </button>
      </div>
    </form>
  )
}

function ResultForm({ match, onSave }: { match: Match; onSave: (a: number, b: number) => Promise<void> }) {
  const [a, setA] = useState(match.official ? String(match.official.a) : '')
  const [b, setB] = useState(match.official ? String(match.official.b) : '')
  const [busy, setBusy] = useState(false)
  const valid = /^\d{1,2}$/.test(a) && /^\d{1,2}$/.test(b)
  const inputCls =
    'h-12 w-12 rounded-xl border-2 border-gray-200 text-center text-lg font-bold outline-none focus:border-indigo-600'

  return (
    <div className="flex items-center justify-between gap-2 border-t border-gray-100 px-4 py-3">
      <span className="text-sm font-bold">Resultado oficial</span>
      <div className="flex items-center gap-2">
        <input inputMode="numeric" maxLength={2} value={a} onChange={(e) => setA(e.target.value.replace(/\D/g, ''))} className={inputCls} aria-label={`Goles de ${match.teamA.name}`} />
        <span className="text-sm font-bold text-gray-500">-</span>
        <input inputMode="numeric" maxLength={2} value={b} onChange={(e) => setB(e.target.value.replace(/\D/g, ''))} className={inputCls} aria-label={`Goles de ${match.teamB.name}`} />
      </div>
      <button
        type="button"
        disabled={!valid || busy}
        onClick={async () => {
          setBusy(true)
          try {
            await onSave(Number(a), Number(b))
          } finally {
            setBusy(false)
          }
        }}
        className="rounded-full bg-green-600 px-4 py-2 text-sm font-bold text-white active:bg-green-700 disabled:opacity-40"
      >
        {match.status === 'finished' ? 'Actualizar' : 'Finalizar'}
      </button>
    </div>
  )
}

export default function AdminMatches() {
  const { tid } = useParams()
  const tournament = useTournament(tid)
  const matches = useMatches(tid)
  const [creating, setCreating] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)

  if (!tournament || matches === null) return <FullLoader />

  const toForm = (m: Match): FormState => ({
    phase: m.phase,
    teamAName: m.teamA.name,
    teamAFlag: m.teamA.flagCode,
    teamBName: m.teamB.name,
    teamBFlag: m.teamB.flagCode,
    kickoff: toLocalInputValue(m.kickoff.toDate()),
  })

  const fromForm = (f: FormState) => ({
    phase: f.phase,
    teamA: { name: f.teamAName.trim(), flagCode: f.teamAFlag.trim().toLowerCase() },
    teamB: { name: f.teamBName.trim(), flagCode: f.teamBFlag.trim().toLowerCase() },
    kickoff: new Date(f.kickoff),
  })

  return (
    <div className="min-h-dvh bg-white pb-10">
      <TopBar title={`Partidos · ${tournament.name}`} backTo={`/torneo/${tid}`} />
      <div className="flex flex-col gap-4 px-4 pt-2">
        {creating ? (
          <MatchForm
            initial={emptyForm()}
            onCancel={() => setCreating(false)}
            onSave={async (f) => {
              await createMatch(tid!, fromForm(f))
              setCreating(false)
            }}
          />
        ) : (
          <button type="button" onClick={() => setCreating(true)} className={btnPrimary}>
            + Agregar partido
          </button>
        )}

        {matches.length === 0 && !creating && (
          <EmptyState
            icon="⚽"
            title="Sin partidos todavía"
            subtitle="Agregá los cruces de 16vos para arrancar."
          />
        )}

        {matches.map((m) =>
          editingId === m.id ? (
            <MatchForm
              key={m.id}
              initial={toForm(m)}
              onCancel={() => setEditingId(null)}
              onSave={async (f) => {
                await updateMatch(tid!, m.id, fromForm(f))
                setEditingId(null)
              }}
            />
          ) : (
            <article key={m.id} className="rounded-2xl border border-gray-200 shadow-sm">
              <div className="flex items-baseline justify-between px-4 pt-3">
                <span className="text-sm font-bold">{PHASE_LABELS[m.phase]}</span>
                <span className="text-xs text-gray-500">
                  {dayLabel(m.kickoff)} · {timeLabel(m.kickoff)}
                </span>
              </div>
              <div className="flex items-center justify-between px-6 py-3">
                <div className="flex items-center gap-2">
                  <Flag code={m.teamA.flagCode} name={m.teamA.name} size={36} />
                  <span className="text-sm">{m.teamA.name}</span>
                </div>
                <span className="text-base font-black">
                  {m.official ? `${m.official.a} - ${m.official.b}` : 'VS'}
                </span>
                <div className="flex items-center gap-2">
                  <span className="text-sm">{m.teamB.name}</span>
                  <Flag code={m.teamB.flagCode} name={m.teamB.name} size={36} />
                </div>
              </div>
              <ResultForm match={m} onSave={(a, b) => setOfficialResult(tid!, m.id, a, b)} />
              <div className="flex items-center justify-end gap-3 border-t border-gray-100 px-4 py-2.5">
                {m.status === 'finished' && (
                  <button
                    type="button"
                    onClick={() => clearOfficialResult(tid!, m.id)}
                    className="text-xs font-bold text-amber-600"
                  >
                    Reabrir
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setEditingId(m.id)}
                  className="text-xs font-bold text-indigo-600"
                >
                  Editar
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (confirm(`¿Borrar ${m.teamA.name} vs ${m.teamB.name}? Se pierden los pronósticos.`))
                      deleteMatch(tid!, m.id)
                  }}
                  className="text-xs font-bold text-red-600"
                >
                  Borrar
                </button>
              </div>
            </article>
          ),
        )}
      </div>
    </div>
  )
}
