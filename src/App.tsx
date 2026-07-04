import { Navigate, Route, Routes } from 'react-router-dom'
import { RequireAdmin, RequireAllowed, RequireAuth } from './components/guards'
import Landing from './screens/Landing'
import Login from './screens/Login'
import Register from './screens/Register'
import ForgotPassword from './screens/ForgotPassword'
import WaitingInvite from './screens/WaitingInvite'
import Home from './screens/Home'
import TournamentRanking from './screens/TournamentRanking'
import CompleteResults from './screens/CompleteResults'
import ParticipantDetail from './screens/ParticipantDetail'
import AdminCreateTournament from './screens/AdminCreateTournament'
import AdminMatches from './screens/AdminMatches'
import AdminAllowlist from './screens/AdminAllowlist'

export default function App() {
  return (
    <div className="mx-auto min-h-dvh w-full max-w-md bg-white shadow-xl">
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/registro" element={<Register />} />
        <Route path="/recuperar" element={<ForgotPassword />} />
        <Route
          path="/esperando"
          element={
            <RequireAuth>
              <WaitingInvite />
            </RequireAuth>
          }
        />
        <Route
          path="/home"
          element={
            <RequireAllowed>
              <Home />
            </RequireAllowed>
          }
        />
        <Route
          path="/torneo/:tid"
          element={
            <RequireAllowed>
              <TournamentRanking />
            </RequireAllowed>
          }
        />
        <Route
          path="/torneo/:tid/resultados"
          element={
            <RequireAllowed>
              <CompleteResults />
            </RequireAllowed>
          }
        />
        <Route
          path="/torneo/:tid/participante/:puid"
          element={
            <RequireAllowed>
              <ParticipantDetail />
            </RequireAllowed>
          }
        />
        <Route
          path="/torneo/:tid/partidos"
          element={
            <RequireAdmin>
              <AdminMatches />
            </RequireAdmin>
          }
        />
        <Route
          path="/admin/crear-torneo"
          element={
            <RequireAdmin>
              <AdminCreateTournament />
            </RequireAdmin>
          }
        />
        <Route
          path="/admin/invitaciones"
          element={
            <RequireAdmin>
              <AdminAllowlist />
            </RequireAdmin>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  )
}
