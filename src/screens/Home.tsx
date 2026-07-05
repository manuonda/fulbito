import { Link } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import { useTournaments } from '../hooks/useTournaments'
import { signOutUser } from '../lib/auth'
import { EmptyState, FullLoader, fmt } from '../components/ui'
import trophy from '../assets/trophy.svg'

export default function Home() {
  const isAdmin = useAuthStore((s) => s.isAdmin)
  const user = useAuthStore((s) => s.user)
  const profile = useAuthStore((s) => s.profile)
  const tournaments = useTournaments()

  const firstName =
    profile?.firstName || profile?.displayName?.split(' ')[0] || user?.displayName?.split(' ')[0] || ''

  return (
    <div className="min-h-dvh bg-white pb-10">
      <header className="flex items-center justify-between px-5 pt-6">
        <div>
          <p className="text-sm text-gray-500">Hola{firstName ? `, ${firstName}` : ''} 👋</p>
          <h1 className="text-2xl font-black">Tus torneos</h1>
        </div>
        <button
          type="button"
          onClick={() => signOutUser()}
          className="rounded-2xl bg-gray-100 px-4 py-2 text-sm font-semibold text-gray-600 active:bg-gray-200"
        >
          Salir
        </button>
      </header>

      {isAdmin && (
        <div className="px-5 pt-4">
          <Link
            to="/admin/crear-torneo"
            className="block rounded-2xl bg-indigo-600 px-4 py-3 text-center text-sm font-bold text-white active:bg-indigo-700"
          >
            Crear nuevo torneo
          </Link>
        </div>
      )}

      <div className="flex flex-col gap-3 px-5 pt-5">
        {tournaments === null ? (
          <FullLoader />
        ) : tournaments.length === 0 ? (
          <EmptyState
            icon="🏆"
            title="Todavía no hay torneos"
            subtitle={
              isAdmin
                ? 'Creá el primero con el botón de arriba.'
                : 'Cuando el organizador cree un torneo lo vas a ver acá.'
            }
          />
        ) : (
          tournaments.map((t) => (
            <Link
              key={t.id}
              to={`/torneo/${t.id}`}
              className="flex items-center gap-4 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm transition active:bg-gray-50"
            >
              <img src={trophy} alt="" className="h-14 w-14" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-base font-bold">{t.name}</p>
                <p className="text-sm text-gray-500">
                  {t.type === 'porotos'
                    ? `${fmt(t.porotosPerMember)} porotos por integrante`
                    : 'Amistoso · por el honor'}
                </p>
                <p className="text-xs text-gray-400">
                  {t.members.length} {t.members.length === 1 ? 'integrante' : 'integrantes'}
                </p>
              </div>
              <span className="text-gray-300">
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
                  <path d="m7.5 4 5.5 6-5.5 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </span>
            </Link>
          ))
        )}
      </div>
    </div>
  )
}
