# Dream Hub — Handoff Notes

## 2026-02-15: Fix Google OAuth Sign-Up Across All Apps

### Problem
Google sign-up was completely broken across all 4 Dream Hub apps (Planner, Store, Brain, Place). Users clicking "Continue with Google" were either silently redirected to a fake demo session or saw a "Configuration" error page.

### Root Causes Found (4 issues)

#### 1. PrismaAdapter causing silent "Configuration" errors (primary cause)
- `@auth/prisma-adapter` v2.11.1 with `next-auth` v5.0.0-beta.30 was failing silently during Google OAuth callback
- The adapter's internal `createUser`/`linkAccount` operations threw unhandled errors that NextAuth caught and returned as a generic `Configuration` error
- Missing `image` field in User model was one contributing factor (PrismaAdapter expects `User.image`)
- **Fix (final)**: Removed PrismaAdapter entirely. Replaced with manual user/account creation in the `signIn` callback (`packages/auth/src/config.ts`). This gives full control over DB operations and proper error logging.
- Database schema was also updated: added `image String?` to User model via `prisma db push`

#### 2. Missing SessionProvider in app layouts
- Dream Store had `SessionProvider` wrapping the app ✅
- Dream Brain: **NO SessionProvider** at all ❌
- Dream Planner: Used `StoreProvider` (Zustand) but no `SessionProvider` ❌
- Dream Place: `SessionProvider` was **conditional** on `DATABASE_URL` ⚠️
- **Fix**: Added `AuthProvider` (wrapping `SessionProvider`) to Dream Brain and Dream Planner layouts. Made Dream Place's `SessionProvider` unconditional.

#### 3. Missing OAuth callbacks in NextAuth config
- No `signIn` callback to validate OAuth sign-in or create users
- JWT callback didn't store Google profile data (name, email, avatar)
- **Fix**: Added comprehensive `signIn` callback that manually finds/creates user and links Google account. Enhanced `jwt` and `session` callbacks to store Google profile data.

#### 4. All sign-in pages silently swallowed errors and fell back to demo auth
- Dream Planner, Store, Brain: `catch { useDemoAuth("demo@google.com", ...) }` — any Google error was hidden and user got a fake session
- Dream Place: Never called NextAuth at all — completely mocked with `localStorage` + cookie
- **Fix**: Updated all 4 sign-in pages to use real `signIn("google")` and show actual error messages

### Commits (in order)
1. `98ca4fe` — fix: enable real Google OAuth sign-up across all apps
2. `b002d21` — fix: add image field to User model for PrismaAdapter compatibility
3. `5c25a4a` — docs: add handoff notes for Google OAuth fix
4. `f0ca2ad` — fix: replace PrismaAdapter with manual DB ops for Google OAuth
5. `d890311` — chore: trigger Vercel deployment

### Files Changed
| File | Change |
|------|--------|
| `packages/auth/src/config.ts` | Removed PrismaAdapter; manual user/account creation in signIn callback; enhanced jwt/session callbacks |
| `packages/database/prisma/schema.prisma` | Added `image String?` to User model |
| `apps/dream-planner/.../SignInPageClient.tsx` | Removed demo-auth fallback on Google error |
| `apps/dream-store/.../SignInPageClient.tsx` | Removed demo-auth fallback on Google error |
| `apps/dream-brain/.../sign-in/page.tsx` | Removed demo-auth fallback on Google error |
| `apps/dream-place/.../sign-in/page.tsx` | Replaced mock auth with real NextAuth `signIn()` calls |
| `apps/dream-brain/src/app/layout.tsx` | Added AuthProvider (SessionProvider) |
| `apps/dream-brain/src/components/providers/AuthProvider.tsx` | New file — SessionProvider wrapper |
| `apps/dream-planner/src/app/layout.tsx` | Added AuthProvider (SessionProvider) |
| `apps/dream-planner/src/components/providers/AuthProvider.tsx` | New file — SessionProvider wrapper |
| `apps/dream-place/src/app/layout.tsx` | Made SessionProvider unconditional (removed DATABASE_URL check) |

### Deployment Status
- Code pushed to GitHub (commit `f0ca2ad`)
- **PENDING DEPLOYMENT**: Vercel free plan daily deployment limit (100) was hit. Deployments will be available ~48 min after 2026-02-15 17:15 UTC. Manual Redeploy required from Vercel dashboard.
- Database schema already updated via `prisma db push` (Supabase PostgreSQL) — `image` column exists

### How the Google OAuth Flow Now Works
1. User clicks "Continue with Google" → `signIn("google")` from next-auth/react
2. NextAuth redirects to Google consent screen
3. Google redirects back to `/api/auth/callback/google`
4. `signIn` callback runs:
   - `prisma.user.findUnique({ where: { email } })` — find existing user
   - If not found: `prisma.user.create(...)` — create new user with Google profile data
   - `prisma.account.findUnique(...)` — check if Google account is linked
   - If not linked: `prisma.account.create(...)` — link Google account to user
   - Errors are logged via `console.error` (visible in Vercel Function Logs)
5. `jwt` callback stores user ID, name, email, picture in JWT token
6. User is redirected to callbackUrl with session cookie set

### Google Cloud Console Requirements
Authorized redirect URIs must include:
- `https://dreamhub-store.vercel.app/api/auth/callback/google`
- `https://dreamhub-planner.vercel.app/api/auth/callback/google`
- `https://dreamhub-brain.vercel.app/api/auth/callback/google`
- `https://dreamhub-place.vercel.app/api/auth/callback/google`

### Known Remaining Items
- Apple and Kakao OAuth providers are shown in Dream Place UI but not configured in NextAuth (only Google is registered)
- NextAuth is on v5 beta (`5.0.0-beta.30`) — consider upgrading to stable when available
- `User.avatar` field still exists alongside new `User.image` — may want to consolidate in future
- Email sign-in pages (Planner, Store, Brain) still fall back to demo auth on `Configuration` error from credentials provider
- Dream Place has no logout button — users cannot sign out to re-test
