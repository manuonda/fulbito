import { useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { authErrorMessage, resetPassword } from '../lib/auth'
import { ErrorText, TopBar, btnPrimary, inputBase } from '../components/ui'

export default function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [sent, setSent] = useState(false)
  const [busy, setBusy] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError('')
    setBusy(true)
    try {
      await resetPassword(email)
      setSent(true)
    } catch (err) {
      setError(authErrorMessage(err))
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="min-h-dvh bg-white">
      <TopBar title="Recuperar contraseña" backTo="/login" />
      {sent ? (
        <div className="flex flex-col items-center gap-3 px-6 pt-12 text-center">
          <span className="text-5xl">📬</span>
          <p className="text-lg font-bold">Revisá tu correo</p>
          <p className="text-sm text-gray-500">
            Si existe una cuenta para <span className="font-semibold">{email}</span>, te enviamos un
            link para restablecer la contraseña.
          </p>
          <Link to="/login" className="mt-4 font-semibold text-indigo-600">
            Volver a iniciar sesión
          </Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 px-6 pt-6">
          <p className="text-sm text-gray-500">
            Ingresá tu email y te mandamos un link para restablecer la contraseña.
          </p>
          <input
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="tu@email.com"
            className={inputBase}
          />
          <ErrorText>{error}</ErrorText>
          <button type="submit" disabled={busy} className={btnPrimary}>
            {busy ? 'Enviando…' : 'Enviar link'}
          </button>
        </form>
      )}
    </div>
  )
}
