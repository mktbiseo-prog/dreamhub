# Dream Brain — Handoff Document

> Last updated: 2026-02-13
> Read CLAUDE.md first for product spec, then this file for implementation status.

---

## 1. What's Been Built (MVP + Phase 2 + Phase 3 + Phase 3.5 Complete)

### Frontend — 8 Pages, 17 Components

```
src/
├── app/
│   ├── layout.tsx              # Root layout, Inter font, dark mode (class="dark")
│   ├── globals.css             # Dark theme base, scrollbar-none utility
│   ├── page.tsx                # Home — Server Component, fetches thoughts + todayInsight
│   ├── brain/page.tsx          # Brain — Server Component, fetches graph data → BrainViewToggle
│   ├── timeline/page.tsx       # Timeline — Server Component, fetches thoughts
│   ├── insights/page.tsx       # [Phase 3] Insights — Server Component, fetches weekly insight
│   ├── thoughts/[id]/page.tsx  # Detail — Dynamic, fetches thought + related
│   ├── auth/sign-in/page.tsx   # [Phase 2] Sign-in page (Google OAuth + email/password)
│   ├── api/auth/[...nextauth]/route.ts  # [Phase 2] NextAuth API handler
│   ├── api/transcribe/route.ts # [Phase 2] Whisper transcription API (POST FormData)
│   └── api/insights/route.ts   # [Phase 3.5] GET ?period=weekly|monthly → JSON
├── components/
│   ├── Header.tsx              # [Phase 2] Async Server Component: avatar / "Sign in" link
│   ├── BottomNav.tsx           # [Phase 3] 4-tab nav (Home/Brain/Insights/Hub) — Timeline replaced by Insights
│   ├── FabButton.tsx           # [Phase 2] "Write a thought" + "Voice recording" (both active)
│   ├── CaptureModal.tsx        # [Phase 2] Two-mode: Text / Voice (tab switching, record → transcribe → capture)
│   ├── HomeFeed.tsx            # [Phase 3] Client: daily prompt + today's insight card + search + category filter + thought cards
│   ├── ThoughtCard.tsx         # [Phase 3] Card: category icon, title, summary, EmotionBadge, tags, relative time
│   ├── ThoughtDetailView.tsx   # [Phase 3] Emotion section + ActionItemsList + EntityPills + edit/delete
│   ├── EmotionBadge.tsx        # [Phase 3] Emotion pill: emoji + label + optional confidence %, sm/md sizes
│   ├── ActionItemsList.tsx     # [Phase 3] Client: interactive checklist with toggleActionItem server action
│   ├── EntityPills.tsx         # [Phase 3] People (violet, User icon) + Places (teal, MapPin icon) pills
│   ├── InsightsView.tsx        # [Phase 3.5] Client: weekly/monthly toggle, monthly fetch on demand, loading skeleton
│   ├── TimelineView.tsx        # Chronological feed grouped by day, vertical timeline UI
│   ├── BrainGraph.tsx          # React Flow 2D graph — circle layout, category-colored nodes, click → detail
│   ├── BrainGraph3D.tsx        # [Phase 3.5] 3d-force-graph: colored nodes, animated particles, HTML tooltip
│   ├── BrainViewToggle.tsx     # [Phase 3.5] 2D/3D toggle (dynamic import for BrainGraph3D, ssr:false)
│   ├── SearchBar.tsx           # Reusable search input
│   └── CategoryFilter.tsx      # Horizontal scrollable category chips (9 categories)
└── lib/
    ├── auth.ts                 # [Phase 2] getCurrentUserId() — session user or "demo-user" fallback
    ├── categories.ts           # 9 categories with icons, colors, fromDbCategory/toDbCategory mappers
    ├── data.ts                 # [Phase 3] ThoughtData (+ emotion, valence, actionItems, peopleMentioned, placesMentioned)
    ├── mock-data.ts            # [Phase 3] 12 mock thoughts with emotion/actionItems/entities + 12 connections
    ├── queries.ts              # [Phase 3.5] fetchInsight() with TTL (weekly: 24h, monthly: 72h)
    ├── hooks/
    │   └── useVoiceRecorder.ts # [Phase 2] MediaRecorder hook (record/pause/resume/stop, max 5min)
    └── actions/
        └── thoughts.ts         # [Phase 3.5] + invalidateInsightCache() called on create/update/delete
```

### Backend — Prisma + AI Pipeline

**Prisma Schema** (`packages/database/prisma/schema.prisma`):
- `Thought` model: id, userId, title, body, summary, category(enum 9), tags[], keywords[], importance(1-5), inputMethod(TEXT/VOICE), voiceFileUrl, voiceDurationSeconds, isFavorite, isArchived, isPinned, **emotion, emotionSecondary, valence, emotionConfidence, actionItems(Json), peopleMentioned[], placesMentioned[]**, embedding[], timestamps
- `ThoughtConnection` model: sourceThoughtId, targetThoughtId, score(0-1), reason, unique constraint on pair
- `InsightReport` model: id, userId, periodType("weekly"/"monthly"), periodStart, periodEnd, content(Json), createdAt; @@unique([userId, periodType, periodStart])
- Indexes: `[userId, createdAt DESC]`, `[userId, category]`
- Exported types from `@dreamhub/database`: `Thought`, `ThoughtConnection`, `ThoughtCategory`, `InputMethod`, `InsightReport`

**AI Package** (`packages/ai/src/`):
- `analyzeThought(body, title?)` → `{ title, summary, category, tags, keywords, importance, emotion, emotionSecondary, valence, confidence, actionItems, peopleMentioned, placesMentioned }` (GPT-4o-mini + mock fallback)
- `generateInsight(thoughts[], periodType)` → `InsightData { summary, categoryDistribution, topKeywords, emotionBreakdown, emotionTrend, patterns, actionRecommendations, todayInsight }` (GPT-4o-mini + mock fallback)
- `generateEmbedding(text)` → `number[]` (1536-dim, text-embedding-3-small + deterministic mock fallback)
- `cosineSimilarity(a, b)` → `number` (pure math, no deps)
- `transcribeAudio(blob, filename)` → `string` (Whisper API + mock fallback)
- **Types**: `EmotionType` (10 emotions), `ActionItem { text, dueDate?, completed }`, `ThoughtAnalysis`, `InsightData`
- **Auto-fallback**: all AI functions work without `OPENAI_API_KEY`

**Server Actions** (`src/lib/actions/thoughts.ts`):
- `createThought` → Zod validation → AI analysis → embedding generation → DB insert (including emotion/actionItems/entities) → vector-aware connections → **invalidate insight cache** → revalidate
- `createVoiceThought` → same pipeline but inputMethod=VOICE + voiceDurationSeconds + **invalidate insight cache**
- `updateThought` → ownership check → regenerate embedding if body changed → recalculate connections → **invalidate insight cache**
- `deleteThought` → ownership check → cascade delete → **invalidate insight cache** → revalidate
- `toggleActionItem(thoughtId, itemIndex)` → ownership check → toggle completed boolean → revalidate
- `getThoughts`, `getThoughtById`, `toggleFavorite`, `getGraphData`
- **Auth**: Uses `getCurrentUserId()` — real session user or "demo-user" fallback

---

## 2. Phase 2 Features (Completed 2026-02-13)

### Edit/Delete UI
- MoreHorizontal button → dropdown menu (Edit with Pencil icon, Delete with Trash2 icon in red)
- **Edit mode**: inline `<input>` + `<textarea>`, Save/Cancel buttons, `useTransition` for async save
- **Delete**: `window.confirm()` → deleteThought → router.push("/")

### Auth Integration
- `@dreamhub/auth` wired: NextAuth route handler, sign-in page at `/auth/sign-in`
- `getCurrentUserId()`: tries session first, falls back to "demo-user"
- All actions use auth-based userId + ownership checks on update/delete
- Header shows user avatar initial (logged in) or "Sign in" link (demo mode)

### Embedding + Vector Search
- `generateEmbedding()` in `packages/ai/src/embed.ts` — OpenAI text-embedding-3-small
- Mock fallback: deterministic pseudo-embedding from text hash
- `findAndCreateConnections` uses 60/25/15 weighted scoring when embeddings available

### Voice Recording + Whisper
- `useVoiceRecorder` hook: MediaRecorder API, WebM/Opus, max 5 min
- CaptureModal: Text/Voice mode tabs, recording controls, auto-transcription

---

## 3. Phase 3 Features (Completed 2026-02-13)

### Sentiment / Emotion Analysis
- **10 emotions**: excited, grateful, anxious, frustrated, curious, calm, determined, confused, hopeful, melancholic
- Single GPT-4o-mini call extracts emotion (primary + secondary), valence (-1 to 1), confidence (0 to 1)
- Mock fallback: keyword heuristics (e.g., "excited|amazing" → excited)
- `EmotionBadge` component: emoji + label + optional confidence %, sm/md sizes
- ThoughtCard shows small EmotionBadge after summary
- ThoughtDetailView shows full emotion section with valence bar (gradient slider)

### Action Items Extraction
- GPT extracts actionable tasks from thought text (e.g., "Need to update the roadmap")
- Mock fallback: regex for "need to"/"should"/"want to"/"have to" patterns
- Stored as `Json` field (`actionItems`) in Thought model
- `ActionItemsList` client component with checkbox toggle via `toggleActionItem` server action
- Line-through styling for completed items, optional due date display

### People / Places NER
- GPT extracts named entities (people + places) from text
- Mock fallback: regex patterns after "with"/"met"/"at"/"in" + capitalized words
- `EntityPills` component: violet pills for people (User icon), teal pills for places (MapPin icon)
- Displayed in ThoughtDetailView after Keywords section

### Insights Page (`/insights`)
- Server Component fetches weekly insight via `fetchInsight("weekly")`
- `InsightsView` client component with weekly/monthly toggle
- Sections: AI Summary (brand gradient), Category Distribution (horizontal bars), Emotion Trends (emoji pills + trend text), Top Keywords, Patterns Discovered, Recommendations (emerald theme)
- `generateInsight()` in `packages/ai/src/generate-insight.ts` — GPT-4o-mini + mock aggregation
- DB-cached via `InsightReport` model (unique per user+period+start)

### Today's Insight on Home
- `fetchTodayInsight()` extracts `todayInsight` string from weekly insight
- Rendered as emerald gradient card between Daily Prompt and Search Bar
- Links to `/insights` page

### BottomNav Update
- Timeline tab replaced with Insights (BarChart3 icon)
- Timeline page remains accessible at `/timeline` via direct URL

---

## 4. Phase 3.5 Features (Completed 2026-02-13)

### Insight Cache TTL
- `fetchInsight()` in `queries.ts` checks `createdAt` age against TTL
- **Weekly**: 24-hour TTL, **Monthly**: 72-hour TTL
- Stale entries are deleted and regenerated on next request
- `invalidateInsightCache(userId)` helper in `thoughts.ts` — deletes all cached InsightReports
- Called in `createThought()`, `createVoiceThought()`, `updateThought()`, `deleteThought()` (best-effort, no error propagation)

### Monthly Insight Toggle (Fixed)
- New API route: `GET /api/insights?period=weekly|monthly` → returns InsightData JSON
- `InsightsView` now fetches monthly data client-side on first toggle
- Weekly data uses SSR prop (instant), monthly data fetched once and cached in React state
- Animated pulse skeleton shown during loading
- 400 response for invalid period param

### 3D Brain Visualization
- **BrainGraph3D**: 3d-force-graph + Three.js, dynamic import inside useEffect (no SSR)
- Node colors match 2D: work=#60a5fa, ideas=#facc15, emotions=#f472b6, etc.
- Node size: `1 + importance * 2` (via `val` property)
- Link width: `score * 2`, animated particles for score > 0.85
- Click node → `router.push(/thoughts/${id})`
- Hover → styled HTML tooltip (title + category)
- Background: `#030712` (gray-950), charge strength -120, link distance 50
- Camera: `{ x: 0, y: 0, z: 300 }`
- Cleanup: `pauseAnimation()` + clear innerHTML on unmount
- Responsive via window resize handler
- Empty state: centered "No thoughts yet" message
- **BrainViewToggle**: 2D/3D toggle button (top-right, z-20)
  - Grid2x2 icon for switching to 2D, Box icon for switching to 3D
  - BrainGraph3D loaded via `next/dynamic` with `ssr: false` + loading spinner
- `brain/page.tsx` now renders `BrainViewToggle` instead of `BrainGraph` directly
- `next.config.ts`: added `3d-force-graph` and `three` to `transpilePackages`

---

## 5. What's NOT Done Yet

### Phase 4 — Future
| Feature | Notes |
|---|---|
| Dream Hub ecosystem | Cross-service data flow (Planner, Place, Store, Cafe) |
| External integrations | Siri, Google Calendar, Notion, Obsidian (P0/P1 in design doc) |
| Plugin marketplace | Open API + JS/TS plugins |

---

## 6. Known Issues & Tech Debt

1. **`ring-current/30` in CategoryFilter.tsx** — Tailwind may not support opacity on `ring-current`. Works visually but might produce a build warning.
2. **Timeline dot styling** — Uses inline style fallback; could be cleaner with dynamic Tailwind classes.
3. **BrainGraph node type cast** — `ThoughtNode as NodeTypes[string]` type assertion workaround for @xyflow/react.
4. **Static generation** — Home, Brain, Timeline are statically generated at build time. Consider `revalidate` settings in production.
5. **No error boundaries** — No error.tsx or loading.tsx in any route segment.
6. **No tests** — Zero test coverage.
7. **Valence bar rendering** — Uses nested divs with relative positioning for the slider indicator; works but could be cleaner.

---

## 7. How to Run

```bash
# Quick start (mock data, no DB, no API keys needed)
cd apps/dream-brain
pnpm dev
# → http://localhost:3003

# With PostgreSQL
cp .env.example .env
# Edit .env: set DATABASE_URL, optionally OPENAI_API_KEY
cd packages/database
pnpm db:push        # Create tables (includes new Phase 3 fields + InsightReport)
pnpm db:seed        # Seed 12 thoughts + 8 connections
cd ../../apps/dream-brain
pnpm dev

# With Auth (optional)
# Add to .env: NEXTAUTH_URL, NEXTAUTH_SECRET, GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET

# Build check
pnpm build          # Should pass with 0 errors, 10 routes
```

---

## 8. File Quick Reference

| Need to... | Go to... |
|---|---|
| Add a new page/route | `src/app/[route]/page.tsx` |
| Add a new component | `src/components/ComponentName.tsx` |
| Change AI analysis prompt | `packages/ai/src/analyze-thought.ts` (SYSTEM_PROMPT) |
| Change insight generation | `packages/ai/src/generate-insight.ts` |
| Change emotion definitions | `packages/ai/src/types.ts` (EmotionType) + `src/components/EmotionBadge.tsx` (EMOTION_CONFIG) |
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

## 9. Dependencies Added

| Package | Location | Purpose |
|---|---|---|
| `lucide-react` | dream-brain | Icons |
| `@xyflow/react` | dream-brain | 2D brain graph (React Flow) |
| `3d-force-graph` | dream-brain | [Phase 3.5] 3D graph renderer |
| `three` | dream-brain | [Phase 3.5] Three.js (peer dep of 3d-force-graph) |
| `@types/three` | dream-brain (dev) | [Phase 3.5] TypeScript types for Three.js |
| `@dreamhub/ai` | dream-brain | AI analysis + embedding + transcription + insights (workspace) |
| `@dreamhub/auth` | dream-brain | NextAuth integration (workspace) |
| `next-auth` | dream-brain | NextAuth client (`signIn` from `next-auth/react`) |
| `openai` | packages/ai | OpenAI SDK |
| `tsx` | packages/database (dev) | Running seed script |
