# Authentication & Authorization — Main Spec

## Overview

Fulbito uses Firebase Authentication (Google OAuth + Email/Password) with role-based access control via Firestore security rules and allowlist checks.

## Requirements

### R1: Google OAuth Sign-In
- MUST support Firebase Google OAuth sign-in
- MUST store user profile (UID, email, displayName)
- SHOULD use Google as default sign-in method for non-technical users

### R2: Email/Password Registration & Login
- MUST support user registration with email + password
- MUST validate email format and password strength
- MUST support password reset (email link)
- SHOULD show clear error messages for invalid credentials

### R3: Admin Role
- MUST identify admin by email address (hardcoded in `src/config/roles.ts`)
- Admin email: `manuonda@gmail.com` (configurable)
- Admin MUST be able to:
  - Create tournaments
  - Manage players (allowlist)
  - Input official match results
  - Publish predictions

### R4: Allowlist (Invitation System)
- MUST maintain allowlist of invited user emails in Firestore
- Non-admin users MUST appear as "Esperando invitación" (awaiting invite) until added to allowlist
- Admin MUST be able to add/remove emails from allowlist
- SHOULD auto-enable users when their email is allowlisted

### R5: Session Persistence
- MUST persist auth state in Zustand store
- MUST survive page refresh
- SHOULD auto-logout on invalid token or permission denied

### R6: Security Rules
- Firestore rules MUST enforce:
  - Admin-only writes to tournaments, matches, and results
  - Users MUST be authenticated to read predictions
  - Predictions locked (read-only) after match kickoff
  - Allowlist checks on signup

## Scenarios

### S1: User Signs in with Google
**Given** user is on login screen
**When** user clicks "Sign in with Google"
**Then** Firebase OAuth popup appears
**And** on success, auth state updates and user is redirected to Home
**And** if user email is not in allowlist, show "Esperando invitación"

### S2: User Registers with Email/Password
**Given** user is on signup screen
**When** user enters email and password
**And** clicks "Register"
**Then** Firebase creates user account
**And** Zustand auth store updates with UID + email
**And** user is redirected to Home

### S3: Admin Adds User to Allowlist
**Given** admin is on Home screen
**When** admin enters a new email in "Habilitar jugadores"
**And** clicks "Add"
**Then** user email is added to Firestore allowlist collection
**And** if user is already signed up, they can now access tournaments

## Domains & Collections

- **Users**: Stored in Firebase Auth (no custom Firestore collection)
- **Allowlist**: Firestore collection `allowlist` with document per email
- **Roles**: Hardcoded (admin email in `src/config/roles.ts`)
