# Tournaments & Matches — Main Spec

## Overview

A tournament is a World Cup 2026 event where friends predict match outcomes and accumulate points based on accuracy. Admin creates tournaments and manages matches; players join and submit predictions.

## Requirements

### R1: Tournament Creation
- Admin MUST be able to create tournaments with:
  - Name (e.g., "2026 World Cup")
  - Type: "Amistoso" (Friendly) or "Por los porotos" (For Points)
  - Initial point allocation per player (e.g., 100 points)
- MUST store in Firestore `tournaments` collection
- MUST generate unique tournament ID
- SHOULD validate name is not empty and type is one of allowed values

### R2: Tournament Visibility
- Admin MUST see all tournaments (created and joined)
- Players MUST see only tournaments they have joined
- Players MUST be able to browse available tournaments and join (if invited via allowlist)
- SHOULD show tournament status (active, completed, archived)

### R3: Match Management (Admin Only)
- Admin MUST be able to add matches to tournament with:
  - Team A name + flag code (2-letter, e.g., `ar`, `br`)
  - Team B name + flag code
  - Phase (Round of 16, Quarterfinals, Semifinals, Final, etc.)
  - Kickoff datetime (ISO 8601)
- MUST store in Firestore `matches` sub-collection under tournament
- SHOULD validate flag codes exist (or use emoji fallback)
- SHOULD prevent editing matches after kickoff time (read-only)

### R4: Official Result Input
- Admin MUST be able to input official result after match completes:
  - Goals for Team A
  - Goals for Team B
- MUST lock match predictions immediately (read-only)
- MUST trigger automatic scoring (see Predictions spec)
- SHOULD validate scores are non-negative integers

### R5: Dense Ranking
- After each match result, MUST recalculate ranking:
  - Sum all points earned by each player
  - Sort descending by points
  - Ties MUST preserve order (e.g., 1°, 2°, 2°, 3°, 4°, etc.)
- SHOULD exclude disabled/removed players from ranking
- MUST show ranking screen with:
  - Player name + email
  - Total points
  - Rank (dense)

### R6: Firestore Structure
- Collection: `tournaments` → {tournamentId}
  - Fields: name, type, created_by (admin UID), created_at, status
- Sub-collection: `tournaments/{id}/matches` → {matchId}
  - Fields: teamA, teamB, flagA, flagB, phase, kickoff, result (null until set)
- Sub-collection: `tournaments/{id}/rankings` → auto-updated after results

## Scenarios

### S1: Admin Creates Tournament
**Given** admin is on Home screen
**When** admin clicks "Crear nuevo torneo"
**And** enters name "2026 World Cup" and selects type "Por los porotos"
**And** sets initial points to 100
**And** clicks "Create"
**Then** Firestore creates tournament document
**And** tournament appears in admin's tournament list
**And** ranking is empty (no matches yet)

### S2: Admin Adds Match
**Given** admin is in tournament "Manage matches" screen
**When** admin enters Team A: "Argentina" (flag: `ar`), Team B: "Brasil" (flag: `br`)
**And** selects phase "Round of 16"
**And** sets kickoff to "2026-06-21T16:00:00Z"
**And** clicks "Add match"
**Then** match appears in the tournament's match list
**And** countdown timer shows time to kickoff
**And** predictions can be submitted (by players)

### S3: Admin Sets Official Result
**Given** match kickoff has passed
**When** admin clicks "Ingresar resultado oficial"
**And** enters "3" for Argentina, "1" for Brasil
**And** clicks "Save"
**Then** result is saved to Firestore
**And** all predictions for that match are locked (read-only)
**And** ranking is recalculated automatically
**And** players see updated points

### S4: View Dense Ranking
**Given** at least one match has a result
**When** player opens ranking screen
**Then** show all players sorted by total points (descending)
**And** display rank with dense ordering (1°, 2°, 2°, 3°, ...)
**And** show only players who are active (not disabled/removed)

## Domains & Collections

- **tournaments**: Firestore collection, one doc per tournament
- **matches**: Firestore sub-collection under `tournaments/{id}/matches`
- **rankings**: Auto-generated view or sub-collection (see Predictions spec for scoring logic)
