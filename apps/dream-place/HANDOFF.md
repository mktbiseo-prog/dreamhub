# Dream Place — Handoff Document

> Last updated: 2026-02-13
> Build status: **PASS** (35 routes, 0 errors)

## Quick Context

Dream Place is a global dreamer matching platform ("LinkedIn meets Tinder for Dreams"). Users share dreams, get matched by complementary skills + shared vision, form teams, and collaborate. Part of the DreamHub monorepo.

**Key docs:**
- `CLAUDE.md` — product spec, MVP scope, API patterns, data model
- `docs/드림 플레이스 상세설계서.pdf` — 12-page design research (matching algorithm, competitor analysis, UI patterns)
- `../../CLAUDE.md` — monorepo-wide tech rules (all UI in English, Tailwind only, TypeScript strict, etc.)

---

## What's Done

### MVP Phase 1 — Complete (10 pages, 5-step onboarding)

**Original MVP**: Landing, Onboarding (5 steps), Discover, Matches, Match Detail, Messages, Chat, Profile, Onboarding Complete

### Phase 2 — Backend Integration (Complete)

**Auth, Database, 6 API endpoints, Zustand store with optimistic updates**

### Phase 3 — MVP Complete

#### 3-1. Onboarding Enhanced (8-step wizard → now 9-step)

| Step | Component | What's New |
|---|---|---|
| 1. Dream Statement | `DreamStatementStep` | AI Enrich button → `/api/ai/enrich-dream` |
| 2. Intent | `IntentStep` | 4 cards: Lead/Join/Partner/Explore |
| 3. Skills Offered | `SkillsOfferedStep` | 350+ skill taxonomy |
| 4. Skills Needed | `SkillsNeededStep` | 350+ skill taxonomy |
| 5. Work Style | `WorkStyleStep` | 10-question Belbin-inspired assessment |
| 6. Preferences | `PreferenceStep` | Location + Remote + Timezone + Industry |
| 7. **First Matches** | `FirstMatchesStep` | **NEW (Phase 4)** — Live match preview using current profile data |
| 8. Profile | `ProfileStep` | Avatar + Bio |
| 9. Review | `CompleteSummary` | Full summary before submission |

#### 3-2. Skill Taxonomy Expanded (100 → 350+, 4-level)

`src/data/skills.ts`: 5 Domains → 20+ Categories → 350+ Skills → Tools

#### 3-3. Matching Algorithm Enhanced (3 → 7 factors + Bidirectional Geometric Mean)

`src/lib/matching.ts`:
```
Final = √(Score_A_to_B × Score_B_to_A)  — Bidirectional Geometric Mean

Score(A→B) = WeightedSum(
  0.25 × DreamAlignment,
  0.25 × ComplementarySkills,
  0.15 × WorkStyleFit,
  0.10 × LocationScore,
  0.10 × ExperienceBalance,
  0.10 × AvailabilityOverlap,
  0.05 × ValueAlignment
)
```

New: `computeBidirectionalMatch()`, `computeProjectMatch()` (user skills vs project needs)

#### 3-4. Dashboard + Visualization

| Route | File | Status |
|---|---|---|
| `/dashboard` | `app/dashboard/page.tsx` | Stats, profile completion, active matches, pending requests |
| `/globe` | `app/globe/page.tsx` | 3D globe (react-globe.gl) with dreamer pins |
| `/profile` | `app/profile/page.tsx` | **ENHANCED** — Linked Accounts, Verification Badge, My Teams, Past Projects |
| `/matches/[id]` | `app/matches/[matchId]/page.tsx` | AI explanation, Skill Radar, Dreamer DNA, "Form a Team" |

#### 3-5. Dream Teams & Projects

| Route | File | Status |
|---|---|---|
| `/teams` | `app/teams/page.tsx` | Team list + Create Team modal |
| `/teams/[id]` | `app/teams/[teamId]/page.tsx` | **ENHANCED** — Formation stage, Team Check-ins, Trial countdown |
| `/teams/[id]/create-project` | `app/teams/[teamId]/create-project/page.tsx` | **ENHANCED** — Trial project toggle, duration, evaluation criteria |
| `/projects` | `app/projects/page.tsx` | **ENHANCED** — Grid/List toggle, Featured carousel, Sidebar filter, Match %, Upvote |
| `/projects/[id]` | `app/projects/[projectId]/page.tsx` | **ENHANCED** — Priority badges, Due dates, Starter task filter |

### Phase 4 — Design Spec Features (NEW — All below)

#### 4-1. Discover Enhancements

- **3 Sub-score Display**: Dream Match, Skill Complement, Compatibility (mini gauge bars)
- **Save for Later**: Bookmark icon on MatchCard
- **Resonate Sheet**: Hinge-style "What resonated?" after expressing interest (5 options: dream vision, skills, work style, interests, location)
- **Saved Filters**: Save/load filter presets from localStorage, filter chips above search

#### 4-2. First Value Moment (Onboarding Step 7)

- `FirstMatchesStep` component builds temp profile from form data
- Runs `computeMatchScores()` against MOCK_PROFILES live
- Shows top 5 matches with score ring, name, headline, complementary skills
- "Your dream profile attracted X matches" Ikea Effect

#### 4-3. Project Marketplace Redesign

- **Grid/List View Toggle** (desktop)
- **Featured Section**: "Featured This Week" horizontal scroll carousel
- **Desktop Sidebar Filter**: `ProjectFilter` (mode="sidebar") — Stage, Skills, Remote, Trial-only
- **Mobile Sheet Filter**: `ProjectFilter` (mode="sheet")
- **ProjectListItem**: Horizontal card for list view
- **ProjectCard Enhanced**: Featured badge, Trial badge, Match %, Upvote button, Starter task count

#### 4-4. Kanban Board Enhanced

- **Priority badges**: P0 (red), P1 (amber), P2 (blue) color dots
- **Due date display**: Red when ≤3 days remaining
- **"Starter" badge**: Good First Contribution tasks
- **Skill requirement pills** on task cards
- **Filter bar**: "Starter tasks only" checkbox + Priority filter (P0/P1/P2/All)

#### 4-5. Trial Projects + Team Formation

- **Trial Project Creation**: Toggle + duration (2/3/4 weeks) + evaluation criteria (up to 3)
- **Team Formation Stage**: Forming → Storming → Norming → Performing progress bar
- **Trial Countdown**: Days remaining display (red when ≤3 days)
- **Dream Guide Role**: Purple badge for DREAM_GUIDE members

#### 4-6. Team Check-in System

- `TeamCheckIn` component: mood (5 emojis), progress, blockers
- Check-in history (sorted by date, max 8)
- API: `GET/POST /api/teams/[teamId]/check-ins`

#### 4-7. Profile + Verification

- **Linked Accounts**: GitHub / LinkedIn / Portfolio with icons + edit mode
- **Verification Level**: Unverified → Basic → Verified badge
- **My Teams Section**: Team cards with member count
- **Past Projects Section**: Completed project list

---

### API Routes (19 total, all dual-mode)

| Endpoint | Mock Mode | DB Mode |
|---|---|---|
| `POST/GET /api/dream-profile` | Static response / null | Prisma upsert/findUnique |
| `GET /api/matches/discover` | MOCK_MATCHES + filter | All profiles + computeMatchScores |
| `GET /api/matches` | Sliced mock data | prisma.match.findMany |
| `POST /api/matches/[id]/interest` | Success response | prisma.match.create |
| `POST /api/matches/[id]/accept` | Success response | prisma.match.update |
| `GET/POST /api/messages/[id]` | MOCK_MESSAGES / echo | prisma.message.findMany/create |
| `GET/POST /api/teams` | MOCK_TEAMS / success | prisma.dreamTeam |
| `GET/PATCH /api/teams/[id]` | MOCK_TEAMS find / success | prisma.dreamTeam |
| `POST /api/teams/[id]/members` | Success response | prisma.teamMember.create |
| `GET/POST /api/teams/[id]/check-ins` | **NEW** — MOCK_CHECK_INS / success | prisma.teamCheckIn |
| `GET/POST /api/projects` | MOCK_PROJECTS / success | prisma.dreamProject |
| `GET/PATCH /api/projects/[id]` | MOCK_PROJECTS find | prisma.dreamProject |
| `GET/POST/PATCH /api/projects/[id]/tasks` | MOCK tasks (priority, dueDate, etc.) | prisma.projectTask |
| `POST /api/projects/[id]/upvote` | **NEW** — Success response | prisma upvote toggle |
| `POST /api/ai/enrich-dream` | Keyword extraction | GPT-4o-mini |
| `POST /api/ai/match-explanation` | Template-based | GPT-4o-mini |
| `POST /api/ai/icebreaker` | Template-based | GPT-4o-mini |

### Components (32 total)

| Component | Purpose |
|---|---|
| `BottomNav` | 5-tab navigation |
| `SessionProvider` | NextAuth wrapper |
| `OnboardingWizard` | **9-step** state machine |
| `TagSelector` | Tag picker with category accordion |
| `DreamStatementStep` | Dream + AI Enrich |
| `IntentStep` | 4-card intent selector |
| `SkillsOfferedStep` | Tag selector wrapper |
| `SkillsNeededStep` | Tag selector wrapper |
| `WorkStyleStep` | 10-question Likert assessment |
| `PreferenceStep` | Location + remote + timezone + industry |
| `FirstMatchesStep` | **NEW** — Live match preview |
| `ProfileStep` | Avatar + bio |
| `CompleteSummary` | Review all selections |
| `MatchCard` | **ENHANCED** — 3 sub-scores, save button |
| `MatchScoreRing` | SVG circular progress |
| `FilterPanel` | **ENHANCED** — Saved filters, load/delete |
| `ResonateSheet` | **NEW** — Hinge-style "What resonated?" |
| `DreamerDNA` | Recharts radar (5-axis work style) |
| `SkillRadar` | Recharts radar (5-domain skills) |
| `DreamGlobe` | react-globe.gl 3D globe |
| `ProjectCard` | **ENHANCED** — Featured, Trial, Upvote, Match %, Starter count |
| `ProjectFilter` | **NEW** — Dual-mode sidebar/sheet filter |
| `ProjectListItem` | **NEW** — Horizontal list view card |
| `KanbanBoard` | **ENHANCED** — Priority, due dates, starter filter |
| `TeamCard` | Team card with member avatars |
| `MemberList` | **ENHANCED** — DREAM_GUIDE role badge |
| `CreateTeamModal` | Team creation modal |
| `TeamCheckIn` | **NEW** — Weekly mood/progress/blockers form + history |

### State & Data Layer

| File | Purpose |
|---|---|
| `store/useDreamStore.ts` | Zustand — all state + savedProfiles + savedFilters + teamCheckIns + localStorage persist |
| `lib/matching.ts` | **Bidirectional geometric mean** + 7-factor + `computeProjectMatch()` |
| `lib/validations.ts` | Zod schemas: dreamProfile, filters (+ savedFilterId) |
| `data/skills.ts` | 350+ skills, 5 domains, 20+ categories, tools |
| `data/workStyleQuestions.ts` | 10 questions, 5 dimensions, score computation |
| `data/mockData.ts` | 8 profiles with linkedAccounts, verificationLevel |
| `data/mockTeams.ts` | 2 teams, 3 projects (1 trial, 1 featured), tasks with priority/dueDate, check-ins |
| `types/index.ts` | All types: DiscoverFilterState, SavedFilter, TeamCheckIn, expanded ProjectTask/DreamProject/DreamerProfile |
| `types/onboarding.ts` | DreamProfileFormData, TOTAL_STEPS = 9 |

### Prisma Schema Extensions

```
DreamProfile: +githubUrl, +linkedinUrl, +portfolioUrl, +verificationLevel
TeamRole enum: +DREAM_GUIDE
DreamProject: +isTrial, +trialDurationWeeks, +evaluationCriteria, +upvotes, +isFeatured
ProjectTask: +priority, +dueDate, +goodFirstContribution, +skillsRequired
NEW model: TeamCheckIn (id, teamId, userId, date, mood, blockers, progress)
DreamTeam: +checkIns relation
```

---

## What's NOT Done (Next Steps)

### Priority

1. **OpenAI embeddings** — Replace keyword overlap in `computeDreamAlignment()` with cosine similarity on `text-embedding-3-small` vectors
2. **Real-time messaging** — WebSocket/Socket.io instead of polling
3. **Image upload** — Avatar currently base64, need S3/Cloudinary
4. **SSR data fetching** — Convert pages to Server Components with Prisma queries
5. **next-intl i18n** — English hardcoded, Korean secondary

### Features

6. **Video chat** — WebRTC or Daily.co integration
7. **Dream Hub ecosystem** — Cross-service events (Dream Brain insights → Dream Place matching)
8. **Notifications** — Push + in-app notifications for matches, messages, team invites
9. **Advanced matching** — Collaborative filtering, Gale-Shapley stable matching, Elo-based dynamic reranking
10. **Real profile verification** — LinkedIn API, GitHub API for automated verification
11. **Team chat** — Group messaging within Dream Teams
12. **3D Dream Map** — Interactive globe with match arcs and dreamer clusters

---

## Architecture

```
apps/dream-place/src/
├── app/
│   ├── api/
│   │   ├── ai/                          # AI endpoints (enrich, explain, icebreaker)
│   │   ├── auth/[...nextauth]/          # NextAuth handler
│   │   ├── dream-profile/               # Profile CRUD (dual-mode)
│   │   ├── matches/                     # Match list + discover + actions
│   │   ├── messages/[matchId]/          # Chat CRUD
│   │   ├── projects/                    # Project CRUD + tasks + upvote
│   │   └── teams/                       # Team CRUD + members + check-ins
│   ├── dashboard/                       # Dashboard page
│   ├── discover/                        # Match feed + ResonateSheet + saved filters
│   ├── globe/                           # 3D globe visualization
│   ├── matches/                         # Match list + [matchId] detail
│   ├── messages/                        # Conversations + [matchId] chat
│   ├── onboarding/                      # 9-step wizard + /complete
│   ├── profile/                         # User profile + Linked Accounts + Verification
│   ├── projects/                        # Project marketplace (grid/list) + [id] detail
│   └── teams/                           # Team list + [id] dashboard (check-ins, formation) + create-project
├── components/
│   ├── charts/                          # DreamerDNA, SkillRadar (recharts)
│   ├── discover/                        # MatchCard, MatchScoreRing, FilterPanel, ResonateSheet
│   ├── globe/                           # DreamGlobe (react-globe.gl)
│   ├── layout/                          # BottomNav (5 tabs)
│   ├── onboarding/                      # Wizard + TagSelector + 8 steps (incl. FirstMatches)
│   ├── projects/                        # ProjectCard, ProjectFilter, ProjectListItem, KanbanBoard
│   ├── providers/                       # SessionProvider
│   └── teams/                           # TeamCard, MemberList, CreateTeamModal, TeamCheckIn
├── data/                                # skills (350+), mockData, mockTeams, workStyleQuestions
├── lib/                                 # matching (bidirectional), validations, auth, db
├── store/                               # Zustand (with localStorage persist)
├── types/                               # TypeScript interfaces (expanded)
└── middleware.ts                         # Auth middleware
```

**How to run:**
```bash
cd ~/Desktop/dreamhub
pnpm dev  # Dream Place on http://localhost:3004
```
