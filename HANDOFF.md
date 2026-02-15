# Dream Hub — Handoff Notes

## 2026-02-15: Fix Google OAuth Sign-Up Across All Apps

### Problem
Google sign-up was completely broken across all 4 Dream Hub apps (Planner, Store, Brain, Place). Users clicking "Continue with Google" were either silently redirected to a fake demo session or saw a "Configuration" error page.

### Root Causes Found (3 issues)

#### 1. Missing `image` field in Prisma User model (primary cause)
- `@auth/prisma-adapter` expects `User.image` to store OAuth profile pictures
- The schema only had `avatar`, not `image`
- When Google OAuth tried to create a user, Prisma threw `Unknown field 'image'` → NextAuth returned generic `Configuration` error
- **Fix**: Added `image String?` to User model in `prisma/schema.prisma` and ran `prisma db push`

#### 2. Missing OAuth callbacks and `allowDangerousEmailAccountLinking` in NextAuth config
- No `signIn` callback to validate OAuth sign-in
- No `allowDangerousEmailAccountLinking` on Google provider — if a user already existed with same email (from credentials sign-up), Google OAuth would fail with `OAuthAccountNotLinked`
- JWT callback didn't store Google profile data (name, email, avatar)
- **Fix**: Updated `packages/auth/src/config.ts`:
  - Added `allowDangerousEmailAccountLinking: true` to Google provider
  - Added `signIn` callback to validate email presence
  - Enhanced `jwt` callback to store Google profile data in token
  - Enhanced `session` callback to pass profile image to session

#### 3. All sign-in pages silently swallowed errors and fell back to demo auth
- Dream Planner, Store, Brain: `catch { useDemoAuth("demo@google.com", ...) }` — any Google error was hidden and user got a fake session
- Dream Place: Never called NextAuth at all — completely mocked with `localStorage` + cookie
- **Fix**: Updated all 4 sign-in pages:
  - `apps/dream-planner/src/app/auth/sign-in/SignInPageClient.tsx`
  - `apps/dream-store/src/app/auth/sign-in/SignInPageClient.tsx`
  - `apps/dream-brain/src/app/auth/sign-in/page.tsx`
  - `apps/dream-place/src/app/auth/sign-in/page.tsx`
  - Removed demo-auth fallback, now shows actual error messages to user
  - Dream Place now uses real `signIn("google")` and `signIn("credentials")` from NextAuth

### Commits
- `98ca4fe` — fix: enable real Google OAuth sign-up across all apps
- `b002d21` — fix: add image field to User model for PrismaAdapter compatibility

### Files Changed
| File | Change |
|------|--------|
| `packages/auth/src/config.ts` | Added `allowDangerousEmailAccountLinking`, `signIn` callback, enhanced `jwt`/`session` callbacks |
| `packages/database/prisma/schema.prisma` | Added `image String?` to User model |
| `apps/dream-planner/.../SignInPageClient.tsx` | Removed demo-auth fallback on Google error |
| `apps/dream-store/.../SignInPageClient.tsx` | Removed demo-auth fallback on Google error |
| `apps/dream-brain/.../sign-in/page.tsx` | Removed demo-auth fallback on Google error |
| `apps/dream-place/.../sign-in/page.tsx` | Replaced mock auth with real NextAuth `signIn()` calls |

### Deployment
- All 4 apps deployed to Vercel (production) and verified:
  - https://dreamhub-planner.vercel.app
  - https://dreamhub-store.vercel.app
  - https://dreamhub-brain.vercel.app
  - https://dreamhub-place.vercel.app
- Database schema updated via `prisma db push` (Supabase PostgreSQL)
- Google OAuth redirect confirmed working: `POST /api/auth/signin/google` → `302 → accounts.google.com`

### Prerequisites (user must verify)
- Google Cloud Console: Authorized redirect URIs must include:
  - `https://dreamhub-store.vercel.app/api/auth/callback/google`
  - `https://dreamhub-planner.vercel.app/api/auth/callback/google`
  - `https://dreamhub-brain.vercel.app/api/auth/callback/google`
  - `https://dreamhub-place.vercel.app/api/auth/callback/google`

### Known Remaining Items
- Apple and Kakao OAuth providers are shown in Dream Place UI but not configured in NextAuth (only Google is registered)
- NextAuth is on v5 beta (`5.0.0-beta.30`) — consider upgrading to stable when available
- `User.avatar` field still exists alongside new `User.image` — may want to consolidate in future
- Email sign-in pages (Planner, Store, Brain) still fall back to demo auth on `Configuration` error from credentials provider
