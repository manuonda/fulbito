import { useEffect, useState } from 'react'
import { doc, getDoc } from 'firebase/firestore'
import { db } from '../lib/firebase'
import type { UserDoc } from '../types/models'

/** Perfiles de una lista de uids (una lectura por uid, cacheada por render). */
export function useUsersMap(uids: string[] | undefined) {
  const [users, setUsers] = useState<Record<string, UserDoc>>({})
  const key = (uids ?? []).slice().sort().join(',')

  useEffect(() => {
    if (!key) return
    let cancelled = false
    const ids = key.split(',')
    Promise.all(ids.map((uid) => getDoc(doc(db, 'users', uid)))).then((snaps) => {
      if (cancelled) return
      const map: Record<string, UserDoc> = {}
      snaps.forEach((snap, i) => {
        if (snap.exists()) map[ids[i]] = snap.data() as UserDoc
      })
      setUsers(map)
    })
    return () => {
      cancelled = true
    }
  }, [key])

  return users
}

export function userLabel(uid: string, users: Record<string, UserDoc>): string {
  const u = users[uid]
  if (!u) return 'Jugador'
  return u.displayName || u.username || u.email
}
