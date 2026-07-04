import { useEffect, useState } from 'react'
import { collection, onSnapshot, orderBy, query } from 'firebase/firestore'
import { db } from '../lib/firebase'
import type { Match } from '../types/models'

export function useMatches(tid: string | undefined) {
  const [matches, setMatches] = useState<Match[] | null>(null)

  useEffect(() => {
    if (!tid) return
    const q = query(collection(db, 'tournaments', tid, 'matches'), orderBy('kickoff', 'asc'))
    return onSnapshot(q, (snap) => {
      setMatches(snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Match))
    })
  }, [tid])

  return matches
}
