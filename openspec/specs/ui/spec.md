# UI & Navigation — Main Spec

## Overview

Fulbito is mobile-first, screen-based UI with React Router for navigation. All screens are built with React + Tailwind CSS with responsive, touch-friendly layouts.

## Requirements

### R1: Navigation Structure
- MUST use React Router for client-side routing
- All screens MUST be mobile-first (viewport first, then tablet/desktop)
- MUST have persistent top bar with:
  - App logo/title
  - User menu (sign out, profile)
  - Back button (mobile)
- SHOULD support deep linking (bookmarkable URLs)

### R2: Authentication Screens
- **Login screen**: Email + Password OR Google OAuth button
- **Signup screen**: Email + Password + Username (unique constraint)
- **Forgot Password screen**: Email input + reset link sender
- **Password Reset screen**: New password form (from email link)
- All fields MUST show validation errors inline
- SHOULD show loading state during auth operations

### R3: Home Screen (Authenticated)
- MUST show:
  - Welcome message + user email
  - List of joined tournaments (with match progress)
  - "Create tournament" button (admin only)
  - "Manage allowlist" modal/screen (admin only)
- SHOULD show tournament status badges (active, completed, results pending)
- SHOULD show quick stats (total points, rank in each tournament)

### R4: Tournament Detail Screen
- MUST show:
  - Tournament name, type, status
  - List of matches (grouped by phase)
  - Ranking table (all players, sorted by points)
  - Match count + completed matches progress bar
- Admin view MUST include:
  - "Manage matches" button (add/edit/delete)
  - "Input results" button (set official scores)
- Player view MUST include:
  - "Join tournament" button (if not joined)
  - "Make predictions" link for incomplete matches

### R5: Match Detail Screen
- MUST show:
  - Team A vs Team B (with flag icons)
  - Kickoff datetime + countdown
  - Current prediction (if submitted) OR prediction form
  - Phase name
  - Official result (if set, visible to all)
- Prediction form MUST have:
  - Two input fields (goals Team A, goals Team B)
  - "Save" button
  - "Edit/Clear" option after submission
- SHOULD disable form when match is locked (after kickoff)
- SHOULD show other players' predictions after kickoff (spoiler-safe)

### R6: Ranking Screen
- MUST display:
  - Dense ranking table (rank, player name, total points)
  - Exclude disabled/removed players
  - Filter/sort options (by points, by name)
- SHOULD show mini-results (recent match outcomes)
- SHOULD be auto-refreshing on new results

### R7: Match Management Screen (Admin Only)
- MUST allow:
  - Add match (team names, flags, phase, kickoff)
  - Edit match (edit fields except kickoff if locked)
  - Delete match (if no predictions submitted)
  - Input official result (goals + save)
- Form validation MUST show errors inline
- SHOULD show count of predictions submitted for each match

### R8: Allowlist Management (Admin Only)
- MUST allow:
  - Enter new email
  - Add to allowlist
  - View current allowlist
  - Remove email from allowlist
  - Refresh to show newly-enabled players
- SHOULD show status (enabled/pending) for each email

### R9: Responsiveness
- All screens MUST work on:
  - Mobile (320px–480px width)
  - Tablet (768px–1024px)
  - Desktop (1024px+)
- Touch targets MUST be ≥44px
- Forms MUST auto-zoom on focus (no user-scalable=no)
- SHOULD show appropriate layouts (stack vs. side-by-side)

## Scenarios

### S1: User Logs In and Views Home
**Given** user is not authenticated
**When** user navigates to `/`
**Then** user is redirected to `/login`
**And** after login, user sees Home with joined tournaments
**And** if admin, "Create tournament" + "Manage allowlist" buttons appear

### S2: Player Joins Tournament and Submits Prediction
**Given** player is authenticated
**When** player clicks on tournament from Home
**And** clicks "Join tournament"
**And** then clicks on upcoming match
**And** enters prediction (2-1)
**And** clicks "Save"
**Then** prediction is saved
**And** confirmation message shows

### S3: Admin Creates Match and Sets Result
**Given** admin is in tournament detail
**When** admin clicks "Manage matches"
**And** adds match (Argentina vs Brazil, 2026-06-21, Round of 16)
**And** clicks "Save"
**Then** match appears in tournament
**And** countdown to kickoff is visible
**When** match time passes and admin clicks "Input results"
**And** enters "3" for Argentina, "1" for Brazil
**And** clicks "Publish"
**Then** result is locked
**And** predictions are revealed
**And** ranking is updated

### S4: View Dense Ranking
**Given** multiple matches have results
**When** player opens ranking
**Then** show players sorted by total points
**And** dense ranking: 1°, 2°, 2°, 3°, ... (ties same rank)
**And** inactive players excluded

## Component Hierarchy

```
App
├── Router
│   ├── Login (/)
│   ├── Signup (/signup)
│   ├── ForgotPassword (/forgot-password)
│   ├── PasswordReset (/reset)
│   ├── Home (/home)
│   ├── TournamentDetail (/tournament/:id)
│   ├── MatchDetail (/tournament/:id/match/:matchId)
│   ├── Ranking (/tournament/:id/ranking)
│   ├── MatchManagement (/tournament/:id/manage) [Admin]
│   ├── AllowlistManagement (/allowlist) [Admin]
│   └── 404 (*)
├── TopBar (persistent)
├── UserMenu (persistent)
└── [ProtectedRoute guard]
```

## Styling

- Framework: Tailwind CSS 4.3.2 (Vite integration)
- Color scheme: TBD (see design spec for palettes)
- Typography: System fonts + TBD
- Icons: TBD (Font Awesome, Heroicons, custom SVG)
- Flag icons: flagcdn.com (CDN) with emoji fallback
