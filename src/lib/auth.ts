import {
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  updateProfile,
} from 'firebase/auth'
import { doc, getDoc, runTransaction, serverTimestamp, setDoc } from 'firebase/firestore'
import { auth, db, googleProvider } from './firebase'
import type { UserDoc } from '../types/models'

export const USERNAME_RE = /^[a-z0-9_.]{3,20}$/i

export async function signInWithGoogle() {
  const cred = await signInWithPopup(auth, googleProvider)
  const user = cred.user
  const ref = doc(db, 'users', user.uid)
  const snap = await getDoc(ref)
  if (!snap.exists()) {
    const profile: UserDoc = {
      email: user.email ?? '',
      displayName: user.displayName ?? user.email ?? 'Jugador',
      photoURL: user.photoURL,
      provider: 'google',
    }
    await setDoc(ref, { ...profile, createdAt: serverTimestamp() })
  }
  return user
}

export interface RegisterInput {
  username: string
  firstName: string
  lastName: string
  email: string
  password: string
}

export async function registerWithEmail(input: RegisterInput) {
  const username = input.username.trim()
  const usernameLower = username.toLowerCase()
  if (!USERNAME_RE.test(username)) {
    throw new Error('El usuario debe tener entre 3 y 20 caracteres (letras, números, punto o guión bajo, sin espacios).')
  }

  // Chequeo previo de disponibilidad (la transacción de abajo garantiza unicidad real)
  const taken = await getDoc(doc(db, 'usernames', usernameLower))
  if (taken.exists()) throw new Error('Ese usuario ya está en uso.')

  const cred = await createUserWithEmailAndPassword(auth, input.email.trim(), input.password)
  const user = cred.user
  const displayName = `${input.firstName.trim()} ${input.lastName.trim()}`.trim()
  await updateProfile(user, { displayName })

  await runTransaction(db, async (tx) => {
    const unameRef = doc(db, 'usernames', usernameLower)
    const unameSnap = await tx.get(unameRef)
    if (unameSnap.exists()) throw new Error('Ese usuario ya está en uso.')
    tx.set(unameRef, { uid: user.uid })
    const profile: UserDoc = {
      email: user.email ?? input.email.trim(),
      username,
      firstName: input.firstName.trim(),
      lastName: input.lastName.trim(),
      displayName,
      photoURL: null,
      provider: 'password',
    }
    tx.set(doc(db, 'users', user.uid), { ...profile, createdAt: serverTimestamp() })
  })

  return user
}

export function signInWithEmail(email: string, password: string) {
  return signInWithEmailAndPassword(auth, email.trim(), password)
}

export function resetPassword(email: string) {
  return sendPasswordResetEmail(auth, email.trim())
}

export function signOutUser() {
  return signOut(auth)
}

const AUTH_ERRORS: Record<string, string> = {
  'auth/email-already-in-use': 'Ya existe una cuenta con ese email.',
  'auth/invalid-email': 'El email no es válido.',
  'auth/weak-password': 'La contraseña es muy corta (mínimo 6 caracteres).',
  'auth/invalid-credential': 'Email o contraseña incorrectos.',
  'auth/wrong-password': 'Email o contraseña incorrectos.',
  'auth/user-not-found': 'No existe una cuenta con ese email.',
  'auth/too-many-requests': 'Demasiados intentos. Probá de nuevo en unos minutos.',
  'auth/popup-closed-by-user': 'Cerraste la ventana de Google antes de terminar.',
  'auth/network-request-failed': 'Sin conexión. Revisá tu internet.',
}

export function authErrorMessage(err: unknown): string {
  if (err && typeof err === 'object' && 'code' in err) {
    const msg = AUTH_ERRORS[(err as { code: string }).code]
    if (msg) return msg
  }
  if (err instanceof Error && !err.message.startsWith('Firebase:')) return err.message
  return 'Algo salió mal. Probá de nuevo.'
}
