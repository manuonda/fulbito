import { useState } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import { authErrorMessage, signInWithGoogle } from '../lib/auth'
import { consumeReturnTo } from '../lib/returnTo'
import { ErrorText } from '../components/ui'
import { isFirebaseConfigured } from '../lib/firebase'
import trophy from '../assets/trophy-cup.webp'
import messiHero from '../assets/messi-hero.webp'

function GoogleIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 48 48" aria-hidden="true">
      <path fill="#FFC107" d="M43.6 20.1H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.9 1.2 8 3l5.7-5.7C34.2 6 29.3 4 24 4 13 4 4 13 4 24s9 20 20 20 20-9 20-20c0-1.3-.1-2.6-.4-3.9z"/>
      <path fill="#FF3D00" d="m6.3 14.7 6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.9 1.2 8 3l5.7-5.7C34.2 6 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"/>
      <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-8l-6.5 5C9.5 39.6 16.2 44 24 44z"/>
      <path fill="#1976D2" d="M43.6 20.1H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C36.9 39.2 44 34 44 24c0-1.3-.1-2.6-.4-3.9z"/>
    </svg>
  )
}

const FEATURES = [
  { icon: '⚽', label: 'Pronosticá\ncada partido' },
  { icon: '🫘', label: 'Sumá\nporotos' },
  { icon: '🏆', label: 'Ganale\na tus amigos' },
]

export default function Landing() {
  const status = useAuthStore((s) => s.status)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  if (status === 'ready') return <Navigate to={consumeReturnTo('/home')} replace />

  async function handleGoogle() {
    setError('')
    setBusy(true)
    try {
      await signInWithGoogle()
    } catch (err) {
      setError(authErrorMessage(err))
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="flex min-h-dvh flex-col">
      {/* Hero */}
      <div className="relative isolate flex flex-1 flex-col items-center justify-center overflow-hidden bg-gradient-to-b from-[#2a1470] via-indigo-700 to-violet-700 px-6 pb-16 pt-14 text-white">
        {/* Messi de fondo, semi-transparente, detrás de todo el contenido */}
        <img
          src={messiHero}
          alt=""
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 -z-10 h-full w-full object-cover object-[85%_top] opacity-20"
        />

        {/* Fondo: aura + acentos decorativos */}
        <div className="pointer-events-none absolute -top-20 left-1/2 h-80 w-80 -translate-x-1/2 rounded-full bg-white/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-16 -left-10 h-56 w-56 rounded-full bg-violet-400/20 blur-3xl" />
        <div className="pointer-events-none absolute top-10 right-2 h-1.5 w-1.5 rounded-full bg-amber-300/80" />
        <div className="pointer-events-none absolute top-24 right-10 h-1 w-1 rounded-full bg-amber-200/70" />
        <div className="pointer-events-none absolute bottom-28 left-6 h-1 w-1 rounded-full bg-amber-200/60" />

        {/* Copa con aura dorada */}
        <div className="relative flex items-end justify-center">
          <div className="pointer-events-none absolute inset-x-0 bottom-4 top-6 rounded-full bg-amber-400/25 blur-2xl" />
          <img src={trophy} alt="Copa fulbito" className="relative h-52 w-auto drop-shadow-2xl" />
        </div>

        <h1 className="mt-3 bg-gradient-to-b from-amber-200 to-amber-400 bg-clip-text text-6xl font-black lowercase tracking-tight text-transparent drop-shadow-sm">
          fulbito
        </h1>
        <p className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-white/15 px-4 py-1.5 text-sm font-semibold tracking-wide ring-1 ring-white/20 backdrop-blur-sm">
          🌎 Torneo Mundial 2026
        </p>
        <p className="mt-4 max-w-xs text-center text-sm text-indigo-100">
          Pronosticá los partidos, sumá porotos y ganale el torneo a tus amigos.
        </p>
      </div>

      {/* Acciones */}
      <div className="-mt-6 rounded-t-3xl bg-white px-6 pb-10 pt-7 shadow-[0_-8px_30px_rgba(0,0,0,0.08)]">
        <div className="mb-6 grid grid-cols-3 gap-2">
          {FEATURES.map((f) => (
            <div key={f.label} className="flex flex-col items-center gap-1.5 text-center">
              <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-indigo-50 text-xl">
                {f.icon}
              </span>
              <span className="whitespace-pre-line text-xs font-semibold leading-tight text-gray-600">
                {f.label}
              </span>
            </div>
          ))}
        </div>

        <div className="flex flex-col gap-3">
          {!isFirebaseConfigured && (
            <p className="rounded-xl bg-amber-50 px-4 py-3 text-sm font-medium text-amber-800">
              Falta configurar Firebase: copiá <code>.env.example</code> a <code>.env</code> con tus
              credenciales (ver README).
            </p>
          )}
          <ErrorText>{error}</ErrorText>
          <button
            type="button"
            onClick={handleGoogle}
            disabled={busy || !isFirebaseConfigured}
            className="flex w-full items-center justify-center gap-3 rounded-2xl border border-gray-300 bg-white px-4 py-3.5 text-base font-bold text-gray-800 shadow-sm transition active:scale-[0.99] active:bg-gray-50 disabled:opacity-50"
          >
            <GoogleIcon />
            {busy ? 'Entrando…' : 'Continuar con Google'}
          </button>
        </div>
      </div>
    </div>
  )
}
