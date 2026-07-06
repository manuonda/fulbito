import { Navigate, Route, Routes } from 'react-router-dom'
import { RequireAdmin, RequireAuth, RequireOrganizer } from './components/guards'
import Landing from './screens/Landing'
import Login from './screens/Login'
import Register from './screens/Register'
import ForgotPassword from './screens/ForgotPassword'
import Home from './screens/Home'
import TournamentRanking from './screens/TournamentRanking'
import CompleteResults from './screens/CompleteResults'
import ParticipantDetail from './screens/ParticipantDetail'
import AdminCreateTournament from './screens/AdminCreateTournament'
import AdminMatches from './screens/AdminMatches'
import AdminPlayers from './screens/AdminPlayers'
import AdminAllowlist from './screens/AdminAllowlist'


// Ruta protegida para el torneo
export default function App() {
  return (
    <div className="mx-auto min-h-dvh w-full max-w-md bg-white shadow-xl">
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/registro" element={<Register />} />
        <Route path="/recuperar" element={<ForgotPassword />} />
        <Route
          path="/home"
          element={
            <RequireAuth>
              <Home />
            </RequireAuth>
          }
        />
        <Route
          path="/torneo/:tid"
          element={
            <RequireAuth>
              <TournamentRanking />
            </RequireAuth>
          }
        />
        <Route
          path="/torneo/:tid/resultados"
          element={
            <RequireAuth>
              <CompleteResults />
            </RequireAuth>
          }
        />
        <Route
          path="/torneo/:tid/participante/:puid"
          element={
            <RequireAuth>
              <ParticipantDetail />
            </RequireAuth>
          }
        />
        <Route
          path="/torneo/:tid/partidos"
          element={
            <RequireOrganizer>
              <AdminMatches />
            </RequireOrganizer>
          }
        />
        <Route
          path="/torneo/:tid/jugadores"
          element={
            <RequireOrganizer>
              <AdminPlayers />
            </RequireOrganizer>
          }
        />
        <Route
          path="/torneo/:tid/editar"
          element={
            <RequireOrganizer>
              <AdminCreateTournament />
            </RequireOrganizer>
          }
        />
        <Route
          path="/admin/crear-torneo"
          element={
            <RequireAuth>
              <AdminCreateTournament />
            </RequireAuth>
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
