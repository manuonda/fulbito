import { useEffect, useState } from 'react'
import {
  collection,
  doc,
  onSnapshot,
  orderBy,
  query,
} from 'firebase/firestore'
import { db } from '../lib/firebase'
import type { Tournament } from '../types/models'

export function useTournaments() {
  const [tournaments, setTournaments] = useState<Tournament[] | null>(null)

  useEffect(() => {
    const q = query(collection(db, 'tournaments'), orderBy('createdAt', 'desc'))
    return onSnapshot(q, (snap) => {
      setTournaments(snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Tournament))
    })
  }, [])

  return tournaments
}

export function useTournament(tid: string | undefined) {
  const [tournament, setTournament] = useState<Tournament | null | undefined>(undefined)

  useEffect(() => {
    if (!tid) return
    return onSnapshot(doc(db, 'tournaments', tid), (snap) => {
      setTournament(snap.exists() ? ({ id: snap.id, ...snap.data() } as Tournament) : null)
    })
  }, [tid])

  return tournament
}
