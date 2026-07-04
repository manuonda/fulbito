import { useEffect, useMemo, useState } from 'react'
import {
  collectionGroup,
  doc,
  onSnapshot,
  query,
  serverTimestamp,
  setDoc,
  where,
} from 'firebase/firestore'
import { db } from '../lib/firebase'
import type { Prediction } from '../types/models'

/**
 * Todas las predicciones del torneo (todas las de todos los usuarios).
 * Usa una consulta collection group: requiere habilitar el índice de grupo
 * sobre `tournamentId` (ver README, Firestore da el link en el error).
 */
export function useTournamentPredictions(tid: string | undefined) {
  const [predictions, setPredictions] = useState<Prediction[] | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!tid) return
    const q = query(collectionGroup(db, 'predictions'), where('tournamentId', '==', tid))
    return onSnapshot(
      q,
      (snap) => {
        setError(null)
        setPredictions(snap.docs.map((d) => d.data() as Prediction))
      },
      (err) => {
        console.error('Error leyendo predicciones (¿falta el índice de collection group?)', err)
        setError(
          'No se pudieron leer los pronósticos guardados. Probablemente falta crear un índice en Firestore: abrí la consola del navegador (F12), buscá el error de Firestore con un link para "crear índice", hacé clic y esperá un minuto.',
        )
        setPredictions([])
      },
    )
  }, [tid])

  return { predictions, error }
}

/** Índice matchId -> (uid -> predicción) */
export function usePredictionsByMatch(predictions: Prediction[] | null) {
  return useMemo(() => {
    const byMatch = new Map<string, Map<string, Prediction>>()
    for (const p of predictions ?? []) {
      let inner = byMatch.get(p.matchId)
      if (!inner) {
        inner = new Map()
        byMatch.set(p.matchId, inner)
      }
      inner.set(p.uid, p)
    }
    return byMatch
  }, [predictions])
}

export function savePrediction(
  tid: string,
  matchId: string,
  uid: string,
  scoreA: number,
  scoreB: number,
) {
  return setDoc(doc(db, 'tournaments', tid, 'matches', matchId, 'predictions', uid), {
    uid,
    tournamentId: tid,
    matchId,
    scoreA,
    scoreB,
    updatedAt: serverTimestamp(),
  })
}
