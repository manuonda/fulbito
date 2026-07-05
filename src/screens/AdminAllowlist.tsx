import { useState, type FormEvent } from 'react'
import { useAllowlist } from '../hooks/useAllowlist'
import { addAllowedEmail, removeAllowedEmail } from '../lib/db'
import { EmptyState, ErrorText, TopBar, btnPrimary, inputBase } from '../components/ui'

export default function AdminAllowlist() {
  const allowlist = useAllowlist()
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  async function handleAdd(e: FormEvent) {
    e.preventDefault()
    setError('')
    setBusy(true)
    try {
      await addAllowedEmail(email)
      setEmail('')
    } catch {
      setError('No se pudo agregar el email.')
    } finally {
      setBusy(false)
    }
  }

  async function handleRemove(target: string) {
    if (!confirm(`¿Quitar a ${target} de esta lista?`)) return
    await removeAllowedEmail(target)
  }

  return (
    <div className="min-h-dvh bg-white pb-10">
      <TopBar title="Lista de emails (opcional)" backTo="/home" />
      <div className="flex flex-col gap-4 px-5 pt-4">
        <p className="text-sm text-gray-500">
          Ahora cualquiera con cuenta de Google puede entrar y sumarse a un torneo abriendo su link;
          esta lista ya no bloquea el acceso. Para habilitar, pausar o sacar gente de un torneo
          puntual, entrá al torneo → <strong>Gestionar jugadores</strong>.
        </p>
        <form onSubmit={handleAdd} className="flex gap-2">
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="amigo@gmail.com"
            className={inputBase}
          />
          <button type="submit" disabled={busy} className={`${btnPrimary} w-auto px-5`}>
            Agregar
          </button>
        </form>
        <ErrorText>{error}</ErrorText>

        {allowlist.length === 0 ? (
          <EmptyState
            icon="✉️"
            title="Nadie habilitado todavía"
            subtitle="Agregá el primer email arriba."
          />
        ) : (
          <ul className="divide-y divide-gray-100 rounded-2xl border border-gray-200">
            {allowlist.map((e) => (
              <li key={e} className="flex items-center justify-between px-4 py-3">
                <span className="min-w-0 truncate text-[15px]">{e}</span>
                <button
                  type="button"
                  onClick={() => handleRemove(e)}
                  className="ml-3 shrink-0 rounded-full bg-red-50 px-3 py-1.5 text-xs font-bold text-red-600 active:bg-red-100"
                >
                  Quitar
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
