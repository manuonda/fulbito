import type { Match, Prediction } from '../types/models'

export type Outcome = 'A' | 'B' | 'draw'

export function outcome(a: number, b: number): Outcome {
  if (a === b) return 'draw'
  return a > b ? 'A' : 'B'
}

/**
 * 6 porotos: marcador exacto.
 * 3 porotos: mismo resultado (mismo ganador o empate) con otro marcador.
 * 0 porotos: resultado distinto.
 */
export function matchPoints(
  prediction: { scoreA: number; scoreB: number },
  official: { a: number; b: number },
): 0 | 3 | 6 {
  if (prediction.scoreA === official.a && prediction.scoreB === official.b) return 6
  if (outcome(prediction.scoreA, prediction.scoreB) === outcome(official.a, official.b)) return 3
  return 0
}

/** Suma de puntos por usuario cruzando predicciones con partidos finalizados. */
export function computeTotals(matches: Match[], predictions: Prediction[]): Map<string, number> {
  const finished = new Map(
    matches.filter((m) => m.status === 'finished' && m.official).map((m) => [m.id, m.official!]),
  )
  const totals = new Map<string, number>()
  for (const p of predictions) {
    const official = finished.get(p.matchId)
    if (!official) continue
    totals.set(p.uid, (totals.get(p.uid) ?? 0) + matchPoints(p, official))
  }
  return totals
}

export interface RankingEntry {
  uid: string
  points: number
  position: number
}

/**
 * Ranking denso como en la app: 1°, 2°, 2°, 3°...
 * Incluye a todos los miembros aunque tengan 0 puntos.
 */
export function buildRanking(members: string[], totals: Map<string, number>): RankingEntry[] {
  const sorted = members
    .map((uid) => ({ uid, points: totals.get(uid) ?? 0 }))
    .sort((a, b) => b.points - a.points)

  const entries: RankingEntry[] = []
  let position = 0
  let lastPoints: number | null = null
  for (const row of sorted) {
    if (lastPoints === null || row.points < lastPoints) {
      position += 1
      lastPoints = row.points
    }
    entries.push({ ...row, position })
  }
  return entries
}
