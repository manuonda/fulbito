import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import { createTournament } from '../lib/db'
import { ErrorText, TopBar, btnPrimary, inputBase } from '../components/ui'
import type { TournamentType } from '../types/models'
import trophy from '../assets/trophy.svg'

export default function AdminCreateTournament() {
  const navigate = useNavigate()
  const user = useAuthStore((s) => s.user)
  const [name, setName] = useState('')
  const [type, setType] = useState<TournamentType>('porotos')
  const [porotos, setPorotos] = useState('0')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!user) return
    setError('')
    setBusy(true)
    try {
      const tid = await createTournament({
        name,
        type,
        porotosPerMember: Number(porotos) || 0,
        createdBy: user.uid,
      })
      navigate(`/torneo/${tid}/partidos`, { replace: true })
    } catch {
      setError('No se pudo crear el torneo. Probá de nuevo.')
      setBusy(false)
    }
  }

  const radio = (checked: boolean) =>
    `flex h-6 w-6 items-center justify-center rounded-full border-2 ${
      checked ? 'border-indigo-600' : 'border-gray-300'
    }`

  return (
    <div className="min-h-dvh bg-white pb-10">
      <TopBar title="Crear torneo desde 16vos" backTo="/home" />
      <form onSubmit={handleSubmit} className="flex flex-col gap-4 px-5 pt-2">
        <img src={trophy} alt="" className="mx-auto h-32 w-32" />

        <div className="flex items-start gap-3 rounded-2xl bg-indigo-50 px-4 py-3.5">
          <span className="pt-0.5 text-indigo-600">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
              <circle cx="10" cy="10" r="8.5" stroke="currentColor" strokeWidth="1.5" />
              <path d="M10 9v5M10 6.5v.01" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
          </span>
          <p className="text-sm text-gray-800">
            El torneo empieza en 16vos y los puntos se acumulan desde esa fase.
          </p>
        </div>

        <label className="flex flex-col gap-1.5">
          <span className="text-base font-medium text-gray-800">Nombre del torneo</span>
          <input
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Nombre del torneo"
            className={inputBase}
          />
        </label>

        <fieldset className="flex flex-col gap-3">
          <legend className="pb-1 text-lg font-black">Tipo de torneo</legend>
          <label className="flex cursor-pointer items-start gap-3">
            <input
              type="radio"
              name="type"
              className="sr-only"
              checked={type === 'amistoso'}
              onChange={() => setType('amistoso')}
            />
            <span className={radio(type === 'amistoso')}>
              {type === 'amistoso' && <span className="h-3 w-3 rounded-full bg-indigo-600" />}
            </span>
            <span>
              <span className="block text-base font-bold">Amistoso</span>
              <span className="block text-sm text-gray-500">Por el honor.</span>
            </span>
          </label>
          <label className="flex cursor-pointer items-start gap-3">
            <input
              type="radio"
              name="type"
              className="sr-only"
              checked={type === 'porotos'}
              onChange={() => setType('porotos')}
            />
            <span className={radio(type === 'porotos')}>
              {type === 'porotos' && <span className="h-3 w-3 rounded-full bg-indigo-600" />}
            </span>
            <span className="text-base font-bold">Por los porotos</span>
          </label>
        </fieldset>

        {type === 'porotos' && (
          <label className="flex flex-col gap-1.5">
            <span className="text-base font-medium text-gray-800">Porotos por integrante</span>
            <input
              inputMode="numeric"
              value={porotos}
              onChange={(e) => setPorotos(e.target.value.replace(/\D/g, ''))}
              className={inputBase}
            />
            <span className="text-sm text-gray-500">
              Los participantes coordinarán de forma voluntaria, sin ninguna obligación de por
              medio.
            </span>
          </label>
        )}

        <ErrorText>{error}</ErrorText>
        <button type="submit" disabled={busy} className={`${btnPrimary} mt-4`}>
          {busy ? 'Creando…' : 'Crear'}
        </button>
      </form>
    </div>
  )
}
