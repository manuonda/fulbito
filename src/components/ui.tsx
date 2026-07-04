import { useState, type ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'

export function FullLoader() {
  return (
    <div className="flex min-h-dvh items-center justify-center">
      <div className="h-10 w-10 animate-spin rounded-full border-4 border-indigo-200 border-t-indigo-600" />
    </div>
  )
}

export function TopBar({
  title,
  right,
  backTo,
}: {
  title?: ReactNode
  right?: ReactNode
  backTo?: string
}) {
  const navigate = useNavigate()
  return (
    <header className="flex items-center gap-3 px-4 pt-4 pb-2">
      <button
        type="button"
        onClick={() => (backTo ? navigate(backTo) : navigate(-1))}
        aria-label="Volver"
        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 active:bg-indigo-100"
      >
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
          <path d="M12.5 4 7 10l5.5 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
      <h1 className="min-w-0 flex-1 truncate text-center text-lg font-bold text-gray-900">
        {title}
      </h1>
      <div className="flex shrink-0 items-center justify-end">{right ?? <span className="w-11" />}</div>
    </header>
  )
}

const FLAG_RE = /^[a-z]{2}$/i

export function flagEmoji(code: string): string {
  if (!FLAG_RE.test(code)) return '🏳️'
  return [...code.toUpperCase()]
    .map((c) => String.fromCodePoint(0x1f1e6 + c.charCodeAt(0) - 65))
    .join('')
}

export function Flag({ code, name, size = 56 }: { code: string; name: string; size?: number }) {
  const [broken, setBroken] = useState(false)
  if (broken || !FLAG_RE.test(code)) {
    return (
      <span
        className="flex items-center justify-center rounded-xl bg-gray-100"
        style={{ width: size, height: size, fontSize: size * 0.55 }}
        role="img"
        aria-label={name}
      >
        {flagEmoji(code)}
      </span>
    )
  }
  return (
    <img
      src={`https://flagcdn.com/w160/${code.toLowerCase()}.png`}
      alt={name}
      width={size}
      height={size}
      loading="lazy"
      onError={() => setBroken(true)}
      className="rounded-xl object-cover shadow-sm ring-1 ring-black/5"
      style={{ width: size, height: size }}
    />
  )
}

export function ErrorText({ children }: { children: ReactNode }) {
  if (!children) return null
  return (
    <p className="rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-700">{children}</p>
  )
}

export function EmptyState({ icon, title, subtitle }: { icon: string; title: string; subtitle?: string }) {
  return (
    <div className="flex flex-col items-center gap-2 px-6 py-14 text-center">
      <span className="text-5xl">{icon}</span>
      <p className="text-base font-semibold text-gray-900">{title}</p>
      {subtitle && <p className="text-sm text-gray-500">{subtitle}</p>}
    </div>
  )
}

export const btnPrimary =
  'block w-full rounded-2xl bg-indigo-600 px-4 py-3.5 text-center text-base font-bold text-white transition active:bg-indigo-700 disabled:opacity-50'
export const btnSecondary =
  'block w-full rounded-2xl bg-indigo-50 px-4 py-3.5 text-center text-base font-bold text-indigo-600 transition active:bg-indigo-100 disabled:opacity-50'
export const inputBase =
  'block w-full rounded-2xl border border-gray-300 bg-white px-4 py-3 text-base text-gray-900 placeholder-gray-400 outline-none transition focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100'

export const fmt = (n: number) => new Intl.NumberFormat('es-AR').format(n)
