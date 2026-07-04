import { create } from 'zustand'
import { onAuthStateChanged, type User } from 'firebase/auth'
import { doc, onSnapshot } from 'firebase/firestore'
import { auth, db, isFirebaseConfigured } from '../lib/firebase'
import { isAdminEmail } from '../config/roles'
import type { UserDoc } from '../types/models'

export type AuthStatus = 'loading' | 'signedOut' | 'waiting' | 'ready'

interface AuthState {
  status: AuthStatus
  user: User | null
  profile: UserDoc | null
  allowlist: string[]
  allowlistLoaded: boolean
  isAdmin: boolean
}

export const useAuthStore = create<AuthState>(() => ({
  status: isFirebaseConfigured ? 'loading' : 'signedOut',
  user: null,
  profile: null,
  allowlist: [],
  allowlistLoaded: false,
  isAdmin: false,
}))

function recompute(partial: Partial<AuthState>) {
  const s = { ...useAuthStore.getState(), ...partial }
  const email = s.user?.email?.toLowerCase() ?? null
  const isAdmin = isAdminEmail(email)
  const allowed = isAdmin || (!!email && s.allowlist.includes(email))
  let status: AuthStatus
  if (!s.user) status = 'signedOut'
  else if (!s.allowlistLoaded && !isAdmin) status = 'loading'
  else status = allowed ? 'ready' : 'waiting'
  useAuthStore.setState({ ...partial, isAdmin, status })
}

let unsubProfile: (() => void) | null = null
let unsubAllowlist: (() => void) | null = null
let initialized = false

export function initAuth() {
  if (!isFirebaseConfigured || initialized) return
  initialized = true

  onAuthStateChanged(auth, (user) => {
    unsubProfile?.()
    unsubProfile = null
    unsubAllowlist?.()
    unsubAllowlist = null

    if (!user) {
      useAuthStore.setState({
        status: 'signedOut',
        user: null,
        profile: null,
        allowlist: [],
        allowlistLoaded: false,
        isAdmin: false,
      })
      return
    }

    recompute({ user, allowlist: [], allowlistLoaded: false, profile: null })

    unsubProfile = onSnapshot(doc(db, 'users', user.uid), (snap) => {
      recompute({ profile: snap.exists() ? (snap.data() as UserDoc) : null })
    })

    unsubAllowlist = onSnapshot(
      doc(db, 'config', 'allowlist'),
      (snap) => {
        const emails = snap.exists() ? ((snap.data().emails as string[]) ?? []) : []
        recompute({ allowlist: emails.map((e) => e.toLowerCase()), allowlistLoaded: true })
      },
      () => {
        recompute({ allowlist: [], allowlistLoaded: true })
      },
    )
  })
}
