import { useEffect, useState } from 'react'
import { doc, onSnapshot } from 'firebase/firestore'
import { db } from '../lib/firebase'

/**
 * La allowlist ya no gatilla el acceso a la app (ver authStore: acceso
 * abierto, moderación por torneo). Este hook solo sirve a la pantalla
 * /admin/invitaciones, que queda como herramienta opcional del admin.
 */
export function useAllowlist() {
  const [emails, setEmails] = useState<string[]>([])

  useEffect(() => {
    return onSnapshot(doc(db, 'config', 'allowlist'), (snap) => {
      setEmails(snap.exists() ? ((snap.data().emails as string[]) ?? []) : [])
    })
  }, [])

  return emails
}
