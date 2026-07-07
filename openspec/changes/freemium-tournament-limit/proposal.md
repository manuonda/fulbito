# Proposal: freemium-tournament-limit

## Summary

Introduce a freemium model to fulbito. Every user gets a `plan` (`'free' | 'pro'`) on their `users/{uid}` document. Free-plan users may be the organizer (`createdBy`) of at most **3 active (non-deleted) tournaments concurrently**; Pro-plan users are unlimited. A small self-promotional in-app banner promoting the Pro plan is shown once per session on `Home.tsx` to free-plan users only. The limit is enforced both in client UX and server-side via Firestore security rules backed by a maintained counter field.

## Motivation / Why

fulbito currently lets any signed-in user create unlimited tournaments with no monetization lever. To sustain the product and open a paid tier, we need a minimal, enforceable freemium boundary now, before wiring real payments. Starting with the plan flag, the active-tournament limit, and the upsell surface gives us the product scaffolding to later attach a subscription payment flow, without prematurely building billing infrastructure.

## Scope (in)

- Add `plan: 'free' | 'pro'` to `UserDoc`; new users default to `plan: 'free'` on signup.
- Enforce a **concurrent** cap of 3 active tournaments where `createdBy == uid` for free-plan users. This is a live count of currently-active (non-deleted) tournaments, NOT a lifetime cumulative counter. Deleting a tournament frees a slot.
- Maintain a counter field (e.g. `users/{uid}.activeTournamentsCount`) via Firestore transactions: incremented on tournament create, decremented on tournament delete, so security rules can enforce the cap with a cheap `get()`.
- Pro-plan users: no active-tournament limit; upsell banner hidden.
- Add a self-promotional upsell banner (in-app, NOT a third-party ad network) shown once per session on `Home.tsx` for free-plan users only.
- Introduce a `deleteTournament` path in `src/lib/db.ts` if one does not already exist (required so "active tournaments" can decrease and slots can free up).

## Behavior (concrete)

1. Every user has `plan: 'free' | 'pro'` on `users/{uid}`.
2. Free-plan users can be organizer of at most 3 ACTIVE (non-deleted) tournaments at a time — a concurrent/live count, recalculated on delete, not a monotonic increment-only counter.
3. Pro-plan users have no active-tournament limit and never see the upsell banner.
4. A small self-promotional upsell banner promoting the Pro plan shows once per session on `Home.tsx` for free-plan users only.
5. The 3-tournament limit is enforced both client-side (UX guard on the create flow) and server-side (Firestore rules + maintained counter) so it cannot be bypassed by direct SDK writes.

## Key files to be touched

- `src/types/models.ts` — add `plan` to `UserDoc`; add counter field (e.g. `activeTournamentsCount`).
- `src/lib/auth.ts` — default `plan: 'free'` on new `UserDoc` creation (`signInWithGoogle` / `registerWithEmail`).
- `src/lib/db.ts` — wrap `createTournament` in a transaction that checks plan + counter and increments; add/adjust a `deleteTournament` path that decrements the counter in a transaction (no tournament-level delete exists today, only match/prediction deletes).
- `firestore.rules` — extend the tournament `create` rule to check plan and the counter via a `get()` on the user doc.
- `src/screens/AdminCreateTournament.tsx` — client-side UX guard and messaging when the free-plan limit is reached.
- `src/screens/Home.tsx` — render the once-per-session upsell banner for free-plan users.

## Architectural risk

Firestore security rules cannot run `COUNT()` aggregate queries over a collection. Enforcing "max 3 active tournaments" server-side therefore requires a **maintained counter field** (`users/{uid}.activeTournamentsCount`), kept in sync via Firestore transactions on create and delete. This introduces two patterns with **no precedent in this codebase today**: counter fields and transactional writes (current `createTournament` and deletes are plain, non-transactional). Design must handle counter drift, delete-without-decrement, and initial backfill for existing users. This change does **NOT** require standing up Cloud Functions — the counter transactions run from the client Firestore SDK. No `functions/` dir or `firebase.json` Functions config exists, and none is needed for this feature.

## Out of Scope (deferred to future SDD changes)

- **Mercado Pago subscription integration** — the payment/webhook flow that flips `plan` to `'pro'`. For this change, plan changes are done manually (admin script or a temporary admin-only screen, TBD in design phase). The real backend/webhook is a separate future change.
- **Flat-fee "cash prize" feature** — discussed separately; its own future SDD change.
