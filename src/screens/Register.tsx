import { useState, type FormEvent } from 'react'
import { Link, Navigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import { authErrorMessage, registerWithEmail } from '../lib/auth'
import { consumeReturnTo } from '../lib/returnTo'
import { ErrorText, TopBar, btnPrimary, inputBase } from '../components/ui'

export default function Register() {
  const status = useAuthStore((s) => s.status)
  const [form, setForm] = useState({
    username: '',
    firstName: '',
    lastName: '',
    email: '',
    password: '',
  })
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  if (status === 'ready') return <Navigate to={consumeReturnTo('/home')} replace />

  const set = (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [key]: e.target.value }))

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError('')
    setBusy(true)
    try {
      await registerWithEmail(form)
    } catch (err) {
      setError(authErrorMessage(err))
      setBusy(false)
    }
  }

  return (
    <div className="min-h-dvh bg-white pb-10">
      <TopBar title="Crear cuenta" backTo="/" />
      <form onSubmit={handleSubmit} className="flex flex-col gap-4 px-6 pt-6">
        <label className="flex flex-col gap-1.5">
          <span className="text-sm font-semibold text-gray-700">Usuario</span>
          <input
            required
            autoComplete="username"
            value={form.username}
            onChange={set('username')}
            placeholder="ej: elpela10"
            className={inputBase}
          />
          <span className="text-xs text-gray-400">
            3 a 20 caracteres, sin espacios. Letras, números, punto o guión bajo.
          </span>
        </label>
        <div className="grid grid-cols-2 gap-3">
          <label className="flex flex-col gap-1.5">
            <span className="text-sm font-semibold text-gray-700">Nombre</span>
            <input
              required
              autoComplete="given-name"
              value={form.firstName}
              onChange={set('firstName')}
              placeholder="David"
              className={inputBase}
            />
          </label>
          <label className="flex flex-col gap-1.5">
            <span className="text-sm font-semibold text-gray-700">Apellido</span>
            <input
              required
              autoComplete="family-name"
              value={form.lastName}
              onChange={set('lastName')}
              placeholder="García"
              className={inputBase}
            />
          </label>
        </div>
        <label className="flex flex-col gap-1.5">
          <span className="text-sm font-semibold text-gray-700">Email</span>
          <input
            type="email"
            required
            autoComplete="email"
            value={form.email}
            onChange={set('email')}
            placeholder="tu@email.com"
            className={inputBase}
          />
        </label>
        <label className="flex flex-col gap-1.5">
          <span className="text-sm font-semibold text-gray-700">Contraseña</span>
          <input
            type="password"
            required
            minLength={6}
            autoComplete="new-password"
            value={form.password}
            onChange={set('password')}
            placeholder="Mínimo 6 caracteres"
            className={inputBase}
          />
        </label>
        <ErrorText>{error}</ErrorText>
        <button type="submit" disabled={busy} className={btnPrimary}>
          {busy ? 'Creando cuenta…' : 'Crear cuenta'}
        </button>
        <p className="pt-2 text-center text-sm text-gray-500">
          ¿Ya tenés cuenta?{' '}
          <Link to="/login" className="font-semibold text-indigo-600">
            Iniciá sesión
          </Link>
        </p>
      </form>
    </div>
  )
}
