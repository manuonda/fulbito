import { Navigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import { signOutUser } from '../lib/auth'
import { consumeReturnTo } from '../lib/returnTo'
import { btnSecondary } from '../components/ui'
import trophy from '../assets/trophy.svg'

export default function WaitingInvite() {
  const status = useAuthStore((s) => s.status)
  const user = useAuthStore((s) => s.user)

  if (status === 'ready') return <Navigate to={consumeReturnTo('/home')} replace />

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-4 bg-white px-8 text-center">
      <img src={trophy} alt="" className="h-28 w-28 opacity-60 grayscale" />
      <h1 className="text-2xl font-black">Esperando invitación</h1>
      <p className="text-sm text-gray-500">
        Tu cuenta <span className="font-semibold text-gray-700">{user?.email}</span> todavía no está
        habilitada para jugar.
      </p>
      <p className="text-sm text-gray-500">
        Avisale al organizador que te sume a la lista. Cuando te habilite, esta pantalla se
        actualiza sola. 🎫
      </p>
      <button type="button" onClick={() => signOutUser()} className={`${btnSecondary} mt-6 max-w-60`}>
        Cerrar sesión
      </button>
    </div>
  )
}
