import {
  addDoc,
  arrayRemove,
  arrayUnion,
  collection,
  deleteDoc,
  doc,
  serverTimestamp,
  setDoc,
  Timestamp,
  updateDoc,
} from 'firebase/firestore'
import { db } from './firebase'
import type { Phase, Team, TournamentType } from '../types/models'

export async function createTournament(input: {
  name: string
  type: TournamentType
  porotosPerMember: number
  createdBy: string
}) {
  const ref = await addDoc(collection(db, 'tournaments'), {
    name: input.name.trim(),
    type: input.type,
    porotosPerMember: input.type === 'porotos' ? input.porotosPerMember : 0,
    createdBy: input.createdBy,
    members: [input.createdBy],
    createdAt: serverTimestamp(),
  })
  return ref.id
}

export function joinTournament(tid: string, uid: string) {
  return updateDoc(doc(db, 'tournaments', tid), { members: arrayUnion(uid) })
}

export function removeMember(tid: string, uid: string) {
  return updateDoc(doc(db, 'tournaments', tid), { members: arrayRemove(uid) })
}

export function deletePrediction(tid: string, matchId: string, uid: string) {
  return deleteDoc(doc(db, 'tournaments', tid, 'matches', matchId, 'predictions', uid))
}

export interface MatchInput {
  phase: Phase
  teamA: Team
  teamB: Team
  kickoff: Date
}

export function createMatch(tid: string, input: MatchInput) {
  return addDoc(collection(db, 'tournaments', tid, 'matches'), {
    phase: input.phase,
    teamA: input.teamA,
    teamB: input.teamB,
    kickoff: Timestamp.fromDate(input.kickoff),
    status: 'upcoming',
    official: null,
  })
}

export function updateMatch(tid: string, mid: string, input: MatchInput) {
  return updateDoc(doc(db, 'tournaments', tid, 'matches', mid), {
    phase: input.phase,
    teamA: input.teamA,
    teamB: input.teamB,
    kickoff: Timestamp.fromDate(input.kickoff),
  })
}

export function setOfficialResult(tid: string, mid: string, a: number, b: number) {
  return updateDoc(doc(db, 'tournaments', tid, 'matches', mid), {
    status: 'finished',
    official: { a, b },
  })
}

export function clearOfficialResult(tid: string, mid: string) {
  return updateDoc(doc(db, 'tournaments', tid, 'matches', mid), {
    status: 'upcoming',
    official: null,
  })
}

export function deleteMatch(tid: string, mid: string) {
  return deleteDoc(doc(db, 'tournaments', tid, 'matches', mid))
}

const allowlistRef = () => doc(db, 'config', 'allowlist')

export function addAllowedEmail(email: string) {
  return setDoc(allowlistRef(), { emails: arrayUnion(email.trim().toLowerCase()) }, { merge: true })
}

export function removeAllowedEmail(email: string) {
  return setDoc(allowlistRef(), { emails: arrayRemove(email) }, { merge: true })
}
