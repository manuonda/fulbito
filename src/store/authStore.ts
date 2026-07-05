import { create } from 'zustand'
import { onAuthStateChanged, type User } from 'firebase/auth'
import { doc, onSnapshot } from 'firebase/firestore'
import { auth, db, isFirebaseConfigured } from '../lib/firebase'
import { isAdminEmail } from '../config/roles'
import type { UserDoc } from '../types/models'

export type AuthStatus = 'loading' | 'signedOut' | 'ready'

interface AuthState {
  status: AuthStatus
  user: User | null
  profile: UserDoc | null
  isAdmin: boolean
}

export const useAuthStore = create<AuthState>(() => ({
  status: isFirebaseConfigured ? 'loading' : 'signedOut',
  user: null,
  profile: null,
  isAdmin: false,
}))

let unsubProfile: (() => void) | null = null
let initialized = false

export function initAuth() {
  if (!isFirebaseConfigured || initialized) return
  initialized = true

  onAuthStateChanged(auth, (user) => {
    unsubProfile?.()
    unsubProfile = null

    if (!user) {
      useAuthStore.setState({ status: 'signedOut', user: null, profile: null, isAdmin: false })
      return
    }

    // Acceso abierto: cualquier cuenta logueada puede usar la app. El
    // organizador modera después por torneo (habilitar/deshabilitar/eliminar).
    useAuthStore.setState({
      status: 'ready',
      user,
      profile: null,
      isAdmin: isAdminEmail(user.email),
    })

    unsubProfile = onSnapshot(doc(db, 'users', user.uid), (snap) => {
      useAuthStore.setState({ profile: snap.exists() ? (snap.data() as UserDoc) : null })
    })
  })
}
