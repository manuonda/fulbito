# Predictions & Scoring — Main Spec

## Overview

Players submit predictions (predictions) for match outcomes before kickoff. After official result is set, points are awarded and ranking updated using a 6-3-0 scoring system.

## Requirements

### R1: Prediction Submission
- Player MUST be able to submit a prediction for each match:
  - Predicted goals for Team A (non-negative integer)
  - Predicted goals for Team B (non-negative integer)
  - Timestamp of submission
- MUST prevent submission after kickoff time (read-only after)
- MUST allow editing prediction until kickoff
- SHOULD show countdown to kickoff

### R2: Prediction Visibility
- Players MUST NOT see other players' predictions until match kickoff
  - After kickoff, all predictions revealed (spoiler-free)
- Own predictions MUST always be visible
- SHOULD show submission timestamp

### R3: Scoring System (6-3-0)
**After official result is set:**
- **Exact score match**: 6 points (e.g., predict 2-1, result 2-1)
- **Correct outcome, wrong score**: 3 points (e.g., predict 2-0, result 1-0; or predict 1-2, result 2-1 tie)
  - Same outcome: both teams won/lost/tied same way as predicted
- **Wrong outcome**: 0 points (e.g., predict 1-2 Team B wins, result 2-1 Team A wins)

### R4: Automatic Scoring
- MUST recalculate all predictions for a match when official result is set
- MUST update player's total points in tournament ranking
- MUST be atomic (all-or-nothing)
- SHOULD log scoring calculation for audit

### R5: Dense Ranking
- MUST aggregate points across all matches in tournament
- MUST sort players by total points (descending)
- MUST use dense ranking: ties preserve same rank (1°, 2°, 2°, 3°, ...)
- MUST exclude inactive players:
  - Players with disabled status
  - Players removed from tournament
- SHOULD recalculate after every result update

### R6: Firestore Structure
- Collection: `predictions` (collection group query by tournamentId)
  - Fields: tournamentId, matchId, playerId (UID), prediction (null until submitted), submitted_at, points (null until result set)
- Ranking computed from aggregated points per player + status

## Scenarios

### S1: Player Submits Prediction
**Given** match kickoff is in the future
**When** player opens match detail
**And** enters predicted score (e.g., 2-1)
**And** clicks "Guardar predicción"
**Then** prediction is saved to Firestore
**And** submission timestamp is recorded
**And** countdown continues to show

### S2: Player Edits Prediction
**Given** player has submitted a prediction before kickoff
**When** player clicks "Edit"
**And** changes predicted score to 1-1
**And** clicks "Save"
**Then** prediction is updated in Firestore
**And** previous prediction is replaced
**And** submission_at is updated

### S3: Exact Score — 6 Points
**Given** player predicted 2-1
**When** admin sets official result to 2-1
**Then** player receives 6 points
**And** total points update in ranking

### S4: Correct Outcome, Wrong Score — 3 Points
**Given** player predicted Team A wins 2-0
**When** admin sets official result to Team A wins 1-0
**Then** player receives 3 points (correct outcome, wrong margin)

### S5: Wrong Outcome — 0 Points
**Given** player predicted Team A wins 2-1
**When** admin sets official result to Team A loses 1-2
**Then** player receives 0 points

### S6: View Ranking with Dense Ordering
**Given** multiple matches have results
**When** player opens ranking screen
**Then** show:
  - Player 1: 50 points (1°)
  - Player 2: 50 points (2°)  ← same rank as Player 1
  - Player 3: 48 points (3°)  ← rank jumps to 3 (dense)
  - Player 4: 45 points (4°)
**And** exclude any players marked as disabled/removed

## Domains & Collections

- **predictions**: Firestore collection, indexed by tournamentId + matchId
- **Scoring logic**: Computed in `src/lib/scoring.ts` (6-3-0 rules)
- **Ranking**: Aggregated from predictions per player, stored or computed on-read

## Notes

- Collection group queries require a Firestore index on `predictions` (auto-created on first query)
- Predictions locked at kickoff time (enforced in Firestore rules + UI read-only state)
- Atomic result → scoring updates MUST be transaction-based or cloud function triggered
