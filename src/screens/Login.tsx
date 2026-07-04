import { useState, type FormEvent } from 'react'
import { Link, Navigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import { authErrorMessage, signInWithEmail } from '../lib/auth'
import { consumeReturnTo } from '../lib/returnTo'
import { ErrorText, TopBar, btnPrimary, inputBase } from '../components/ui'

export default function Login() {
  const status = useAuthStore((s) => s.status)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  if (status === 'ready') return <Navigate to={consumeReturnTo('/home')} replace />
  if (status === 'waiting') return <Navigate to="/esperando" replace />

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError('')
    setBusy(true)
    try {
      await signInWithEmail(email, password)
    } catch (err) {
      setError(authErrorMessage(err))
      setBusy(false)
    }
  }

  return (
    <div className="min-h-dvh bg-white">
      <TopBar title="Iniciar sesión" backTo="/" />
      <form onSubmit={handleSubmit} className="flex flex-col gap-4 px-6 pt-6">
        <label className="flex flex-col gap-1.5">
          <span className="text-sm font-semibold text-gray-700">Email</span>
          <input
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="tu@email.com"
            className={inputBase}
          />
        </label>
        <label className="flex flex-col gap-1.5">
          <span className="text-sm font-semibold text-gray-700">Contraseña</span>
          <input
            type="password"
            required
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            className={inputBase}
          />
        </label>
        <ErrorText>{error}</ErrorText>
        <button type="submit" disabled={busy} className={btnPrimary}>
          {busy ? 'Entrando…' : 'Entrar'}
        </button>
        <div className="flex flex-col items-center gap-2 pt-2 text-sm">
          <Link to="/recuperar" className="font-semibold text-indigo-600">
            ¿Olvidaste tu contraseña?
          </Link>
          <p className="text-gray-500">
            ¿No tenés cuenta?{' '}
            <Link to="/registro" className="font-semibold text-indigo-600">
              Registrate
            </Link>
          </p>
        </div>
      </form>
    </div>
  )
}
