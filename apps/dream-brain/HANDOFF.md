# Dream Brain — Handoff Document

> Last updated: 2026-02-13
> Read CLAUDE.md first for product spec, then this file for implementation status.

---

## 1. What's Been Built (MVP + Phase 2 Complete)

### Frontend — 7 Pages, 11 Components

```
src/
├── app/
│   ├── layout.tsx              # Root layout, Inter font, dark mode (class="dark")
│   ├── globals.css             # Dark theme base, scrollbar-none utility
│   ├── page.tsx                # Home — Server Component, fetches thoughts via queries.ts
│   ├── brain/page.tsx          # Brain — Server Component, fetches graph data
│   ├── timeline/page.tsx       # Timeline — Server Component, fetches thoughts
│   ├── thoughts/[id]/page.tsx  # Detail — Dynamic, fetches thought + related
│   ├── auth/sign-in/page.tsx   # [Phase 2] Sign-in page (Google OAuth + email/password)
│   ├── api/auth/[...nextauth]/route.ts  # [Phase 2] NextAuth API handler
│   └── api/transcribe/route.ts # [Phase 2] Whisper transcription API (POST FormData)
├── components/
│   ├── Header.tsx              # [Phase 2] Async Server Component: avatar / "Sign in" link
│   ├── BottomNav.tsx           # 4-tab nav (Home/Brain/Timeline/Hub) with Next.js Link + usePathname
│   ├── FabButton.tsx           # [Phase 2] "Write a thought" + "Voice recording" (both active)
│   ├── CaptureModal.tsx        # [Phase 2] Two-mode: Text / Voice (tab switching, record → transcribe → capture)
│   ├── HomeFeed.tsx            # Client: search + category filter + thought card list
│   ├── ThoughtCard.tsx         # Card: category icon, title, summary, tags, relative time → links to detail
│   ├── ThoughtDetailView.tsx   # [Phase 2] Dropdown menu (Edit/Delete), inline edit mode, voice badge
│   ├── TimelineView.tsx        # Chronological feed grouped by day, vertical timeline UI
│   ├── BrainGraph.tsx          # React Flow 2D graph — circle layout, category-colored nodes, click → detail
│   ├── SearchBar.tsx           # Reusable search input
│   └── CategoryFilter.tsx      # Horizontal scrollable category chips (9 categories)
└── lib/
    ├── auth.ts                 # [Phase 2] getCurrentUserId() — session user or "demo-user" fallback
    ├── categories.ts           # 9 categories with icons, colors, fromDbCategory/toDbCategory mappers
    ├── data.ts                 # [Phase 2] ThoughtData (+ inputMethod, voiceDurationSeconds), ConnectionData, RelatedThoughtData
    ├── mock-data.ts            # 12 mock thoughts + 12 connections + helper functions
    ├── queries.ts              # [Phase 2] Data layer: auth-aware, voice fields in dbThoughtToData
    ├── hooks/
    │   └── useVoiceRecorder.ts # [Phase 2] MediaRecorder hook (record/pause/resume/stop, max 5min)
    └── actions/
        └── thoughts.ts         # [Phase 2] Auth, embeddings, vector connections, createVoiceThought
```

### Backend — Prisma + AI Pipeline

**Prisma Schema** (`packages/database/prisma/schema.prisma` lines 194-255):
- `Thought` model: id, userId, title, body, summary, category(enum 9), tags[], keywords[], importance(1-5), inputMethod(TEXT/VOICE), voiceFileUrl, voiceDurationSeconds, isFavorite, isArchived, isPinned, embedding[], timestamps
- `ThoughtConnection` model: sourceThoughtId, targetThoughtId, score(0-1), reason, unique constraint on pair
- Indexes: `[userId, createdAt DESC]`, `[userId, category]`
- Exported types from `@dreamhub/database`: `Thought`, `ThoughtConnection`, `ThoughtCategory`, `InputMethod`

**AI Package** (`packages/ai/src/`):
- `analyzeThought(body, title?)` → `{ title, summary, category, tags, keywords, importance }` (GPT-4o-mini + mock fallback)
- `generateEmbedding(text)` → `number[]` (1536-dim, text-embedding-3-small + deterministic mock fallback)
- `cosineSimilarity(a, b)` → `number` (pure math, no deps)
- `transcribeAudio(blob, filename)` → `string` (Whisper API + mock fallback)
- **Auto-fallback**: all 3 AI functions work without `OPENAI_API_KEY`

**Server Actions** (`src/lib/actions/thoughts.ts`):
- `createThought` → Zod validation → AI analysis → embedding generation → DB insert → vector-aware connections → revalidate
- `createVoiceThought` → same pipeline but inputMethod=VOICE + voiceDurationSeconds
- `updateThought` → ownership check → regenerate embedding if body changed → recalculate connections
- `deleteThought` → ownership check → cascade delete
- `getThoughts`, `getThoughtById`, `toggleFavorite`, `getGraphData`
- **Auth**: Uses `getCurrentUserId()` — real session user or "demo-user" fallback
- **Connection scoring (vector mode)**: `vectorSimilarity * 0.6 + tagKeyword * 0.25 + categoryBonus * 0.15`, threshold ≥ 0.25
- **Connection scoring (fallback)**: `tagScore * 0.4 + keywordScore * 0.35 + categoryBonus(0.15) + random(0.1)`, threshold ≥ 0.3

---

## 2. Phase 2 Features (Completed 2026-02-13)

### Edit/Delete UI
- MoreHorizontal button → dropdown menu (Edit with Pencil icon, Delete with Trash2 icon in red)
- **Edit mode**: inline `<input>` + `<textarea>`, Save/Cancel buttons, `useTransition` for async save
- **Delete**: `window.confirm()` → deleteThought → router.push("/")
- Backdrop overlay closes dropdown on outside click

### Auth Integration
- `@dreamhub/auth` wired: NextAuth route handler, sign-in page at `/auth/sign-in`
- `getCurrentUserId()`: tries session first, falls back to "demo-user"
- All actions use auth-based userId + ownership checks on update/delete
- Header shows user avatar initial (logged in) or "Sign in" link (demo mode)
- **Zero-config**: everything works without any auth env vars

### Embedding + Vector Search
- `generateEmbedding()` in `packages/ai/src/embed.ts` — OpenAI text-embedding-3-small
- Mock fallback: deterministic pseudo-embedding from text hash (xorshift32 + normalization)
- Embeddings stored in `embedding Float[]` field on every new/updated thought
- `findAndCreateConnections` uses 60/25/15 weighted scoring when embeddings available
- Application-level cosine similarity (sufficient for <1000 thoughts per user)

### Voice Recording + Whisper
- `useVoiceRecorder` hook: MediaRecorder API, WebM/Opus, max 5 min, chunks/1s
- `transcribeAudio()` in `packages/ai/src/transcribe.ts` — Whisper API + mock
- POST `/api/transcribe` route for file upload → transcription
- CaptureModal: Text/Voice mode tabs, recording controls (start/pause/resume/stop)
- Auto-transcription on recording stop, editable transcript, "Re-record" option
- Voice thoughts show purple Mic badge with duration on detail page

---

## 3. What's NOT Done Yet

### Phase 2 Remaining
| Feature | Notes |
|---|---|
| **Sentiment analysis** | Not in schema yet. Design doc specifies 10-emotion LLM classification |
| **Weekly/Monthly AI insights** | Design doc: InsightReport model with `periodType`, `content(JSONB)`. No schema or UI |

### Phase 3 — Future
| Feature | Notes |
|---|---|
| 3D Brain visualization | Design doc: Three.js + 3d-force-graph on GLB brain model |
| Dream Hub ecosystem | Cross-service data flow (Planner, Place, Store, Cafe) |
| External integrations | Siri, Google Calendar, Notion, Obsidian (P0/P1 in design doc) |
| Plugin marketplace | Open API + JS/TS plugins |

---

## 4. Known Issues & Tech Debt

1. **`ring-current/30` in CategoryFilter.tsx** — Tailwind may not support opacity on `ring-current`. Works visually but might produce a build warning in some configs.
2. **Timeline dot styling** — The timeline dot uses inline style fallback; could be cleaner with dynamic Tailwind classes.
3. **BrainGraph node type cast** — `ThoughtNode as NodeTypes[string]` is a type assertion workaround for @xyflow/react's strict typing.
4. **Static generation** — Home, Brain, Timeline are statically generated at build time. In production, consider `revalidate` settings.
5. **No error boundaries** — No error.tsx or loading.tsx in any route segment.
6. **No tests** — Zero test coverage.
7. **Mock data types** — `mock-data.ts` `Thought` interface lacks `inputMethod`/`voiceDurationSeconds` (optional in `ThoughtData`, so no TS error, but not fully aligned).

---

## 5. How to Run

```bash
# Quick start (mock data, no DB, no API keys needed)
cd apps/dream-brain
pnpm dev
# → http://localhost:3003

# With PostgreSQL
cp .env.example .env
# Edit .env: set DATABASE_URL, optionally OPENAI_API_KEY
cd packages/database
pnpm db:push        # Create tables
pnpm db:seed        # Seed 12 thoughts + 8 connections
cd ../../apps/dream-brain
pnpm dev

# With Auth (optional)
# Add to .env: NEXTAUTH_URL, NEXTAUTH_SECRET, GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET

# Build check
pnpm build          # Should pass with 0 errors, 8 routes
```

---

## 6. File Quick Reference

| Need to... | Go to... |
|---|---|
| Add a new page/route | `src/app/[route]/page.tsx` |
| Add a new component | `src/components/ComponentName.tsx` |
| Change AI analysis prompt | `packages/ai/src/analyze-thought.ts` (SYSTEM_PROMPT) |
| Change embedding model | `packages/ai/src/embed.ts` |
| Change transcription | `packages/ai/src/transcribe.ts` |
| Modify DB schema | `packages/database/prisma/schema.prisma` → `pnpm db:generate` |
| Add shared UI component | `packages/ui/src/components/` → export from `index.ts` |
| Change category definitions | `src/lib/categories.ts` (icons, colors, labels) |
| Modify data fetching logic | `src/lib/queries.ts` (DB vs mock) |
| Add/edit server actions | `src/lib/actions/thoughts.ts` |
| Change mock data | `src/lib/mock-data.ts` |
| Auth configuration | `src/lib/auth.ts` + `packages/auth/src/config.ts` |
| Tailwind theme (brand colors) | `packages/config/tailwind.config.ts` |

---

## 7. Dependencies Added

| Package | Location | Purpose |
|---|---|---|
| `lucide-react` | dream-brain | Icons |
| `@xyflow/react` | dream-brain | 2D brain graph (React Flow) |
| `@dreamhub/ai` | dream-brain | AI analysis + embedding + transcription (workspace) |
| `@dreamhub/auth` | dream-brain | NextAuth integration (workspace) |
| `next-auth` | dream-brain | NextAuth client (`signIn` from `next-auth/react`) |
| `openai` | packages/ai | OpenAI SDK |
| `tsx` | packages/database (dev) | Running seed script |
