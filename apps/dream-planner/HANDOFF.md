# Dream Planner — Handoff Document

> Last updated: 2026-02-13
> Status: **FULL DESIGN DOC IMPLEMENTATION — 20 Activities + AI Panels + Gamification + PDF Export + Cross-Part Refs**

## Quick Start

```bash
cd ~/Desktop/dreamhub/apps/dream-planner
pnpm dev          # http://localhost:3001
pnpm build        # production build (verified passing)
```

---

## 1. Project Overview

Simon Squibb's physical Dream Planner workbook → interactive web app.
4 PARTs, 20 Activities + 4 Reflections, AI coaching, AI insight panels on every activity, gamification, PDF export, cross-part data references.

### Core Rules (CLAUDE.md)
- **All UI text in English** (i18n ready)
- Tech: Next.js 15 + React 19 + TypeScript + Tailwind + shadcn
- Design: brand-500(#8b5cf6) purple, card radius 12px, Inter font
- Shared UI: `@dreamhub/ui` (Button, Input, Label, cn)

---

## 2. Implemented Features

### Route Structure
| Route | File | Role |
|-------|------|------|
| `/` | `app/page.tsx` | Landing page |
| `/onboarding` | `app/onboarding/page.tsx` | 4-step onboarding |
| `/planner` | `app/planner/page.tsx` | Dashboard (progress, AI tips, badges, Before/After, export) |
| `/planner/part1` | `app/planner/part1/page.tsx` | PART 1: Face My Reality (5 activities) |
| `/planner/part2` | `app/planner/part2/page.tsx` | PART 2: Discover My Dream (5 activities) |
| `/planner/part3` | `app/planner/part3/page.tsx` | PART 3: Validate & Build (4 activities) |
| `/planner/part4` | `app/planner/part4/page.tsx` | PART 4: Connect & Expand (6 activities) |
| `/api/coach` | `app/api/coach/route.ts` | AI Coach API (OpenAI + mock fallback) |

### File Structure
```
src/
├── app/
│   ├── layout.tsx, page.tsx, globals.css
│   ├── onboarding/page.tsx
│   ├── api/coach/route.ts
│   └── planner/
│       ├── layout.tsx (header + nav + dark mode toggle + notification bell + AiCoach)
│       ├── page.tsx (dashboard)
│       ├── part1/page.tsx → PlannerShell
│       ├── part2/page.tsx → Part2Shell
│       ├── part3/page.tsx → Part3Shell
│       └── part4/page.tsx → Part4Shell
├── components/
│   ├── activities/
│   │   ├── SkillsInventory.tsx (Act 1 + AI skill suggestions + combination engine)
│   │   ├── ResourceMap.tsx (Act 2, radar chart + AI resource insights)
│   │   ├── TimeLog.tsx (Act 3, donut + pattern insights)
│   │   ├── MoneyFlow.tsx (Act 4, pie/bar/line/heatmap + AI spending insights)
│   │   ├── CurrentState.tsx (Act 5, SWOT auto-gen)
│   │   ├── Reflection.tsx (PART 1 reflection + AiSummary)
│   │   ├── part2/
│   │   │   ├── ExperienceMindMap.tsx (Act 6 + AI pattern analysis)
│   │   │   ├── FailureResume.tsx (Act 7 + AI failure→strength conversion)
│   │   │   ├── StrengthsRedefine.tsx (Act 8 + AI reframing hints)
│   │   │   ├── MarketScan.tsx (Act 9 + AI market analysis report)
│   │   │   ├── WhyWhatBridge.tsx (Act 10 + AI idea evaluation insights)
│   │   │   └── Part2Reflection.tsx (enhanced completion: data summary cards + stats grid)
│   │   ├── part3/
│   │   │   ├── OneLineProposal.tsx (Act 11 + AI proposal polish checklist + CrossPartRef)
│   │   │   ├── HypothesisBoard.tsx (Act 12 + AI validation analysis + CrossPartRef)
│   │   │   ├── ZeroCostMvp.tsx (Act 13 + AI template library + readiness check + CrossPartRef)
│   │   │   ├── ValueLadder.tsx (Act 14 + AI pricing gaps + revenue sim + CrossPartRef)
│   │   │   └── Part3Reflection.tsx (enhanced completion: data summary cards + stats grid)
│   │   └── part4/
│   │       ├── FirstTenFans.tsx (Act 15 + AI fan persona analysis + CrossPartRef)
│   │       ├── Dream5Network.tsx (Act 16 + AI network coaching + CrossPartRef)
│   │       ├── RejectionCollection.tsx (Act 17 + AI rejection growth report)
│   │       ├── SustainableSystem.tsx (Act 18 + AI system health check)
│   │       ├── TrafficLightAnalysis.tsx (Act 19 + AI pattern analysis)
│   │       ├── SustainabilityChecklist.tsx (Act 20 + AI comprehensive score)
│   │       └── Part4Reflection.tsx (Journey Report + Completion Certificate)
│   ├── planner/
│   │   ├── PlannerShell.tsx, Part2Shell.tsx, Part3Shell.tsx, Part4Shell.tsx
│   │   ├── ActivitySidebar.tsx
│   │   ├── AiCoach.tsx (auto-trigger: stuck detection, completion, PART entry)
│   │   ├── AiSummary.tsx (Reflection completion AI analysis)
│   │   ├── CrossPartRef.tsx (PART 3/4 collapsible previous data panels)
│   │   ├── ExportButton.tsx (PDF download trigger)
│   │   └── PlannerPdf.tsx (@react-pdf/renderer document)
│   ├── providers/StoreProvider.tsx
│   └── ui/StarRating.tsx
├── lib/
│   ├── store.ts (PlannerStore + usePlannerStore hook + CoachInsight + maxStreak)
│   ├── ai-coach.ts (OpenAI GPT-4o-mini + mock, stuck/completion/entry/typing-pause messages)
│   └── gamification.ts (badges, titles, milestone logic)
└── types/
    ├── planner.ts (PART 1 types + activities)
    ├── part2.ts, part3.ts, part4.ts
```

### Key Features

#### AI Insight Panels (all 20 activities)
Every activity has a client-side AI insight panel that analyzes user input data in real-time:
- **SkillsInventory**: Skill suggestions by keyword + cross-category combination engine
- **ResourceMap**: Strongest/weakest resource identification + utilization tips
- **TimeLog**: Golden hour, pattern insights, day coverage analysis
- **MoneyFlow**: Spending patterns, satisfaction heatmap, saving opportunities
- **CurrentState**: Auto-generated SWOT analysis
- **ExperienceMindMap**: Recurring theme detection, richest branch identification
- **FailureResume**: Failure→strength conversion, emotion pattern analysis
- **StrengthsRedefine**: AI reframing hints with auto-fill + Failure Resume lesson reference panel
- **MarketScan**: Market opportunity analysis report
- **WhyWhatBridge**: Idea evaluation insights, score gap alerts, twist tips
- **OneLineProposal**: 4-point polish checklist (length, brackets, words, target)
- **HypothesisBoard**: Validation survival rate, coaching for failed hypotheses
- **ZeroCostMvp**: Template library (4 MVP types × 10 steps) + readiness score
- **ValueLadder**: Pricing gap alerts + monthly/yearly revenue simulation
- **FirstTenFans**: Fan persona analysis, pipeline conversion rate, top source
- **Dream5Network**: Network coaching, missing role tips, journal encouragement
- **RejectionCollection**: Growth report with visual bars, emotional journey
- **SustainableSystem**: System health score (weighted scoring)
- **TrafficLightAnalysis**: Pattern analysis, efficiency score, action alerts
- **SustainabilityChecklist**: Comprehensive sustainability score, domain breakdown

#### AI Coach System
- **Floating chat bubble** on all activity pages (bottom-right)
- **Auto-trigger: Stuck detection** — 60s idle → nudge notification with contextual tip
- **Auto-trigger: Typing pause** — 8s typing pause → deeper follow-up question (20 unique messages)
- **Auto-trigger: Activity completion** — completion celebration message
- **Auto-trigger: PART entry** — welcome message with tips when entering new PART
- **Nudge tooltip** — preview message appears above coach button
- **Suggestion chips** — clickable follow-up questions
- **OpenAI integration** — GPT-4o-mini with mock fallback (set OPENAI_API_KEY)
- **Insight persistence** — recentInsights stored in localStorage for dashboard

#### Dashboard
- Greeting with current title (e.g., "Reality Facer")
- Overall + per-PART progress bars
- Dream Statement display
- **AI Recommendations** — smart tips based on user data patterns
- **Recent Coach Insights** — last 3 AI interactions
- **Continue Where You Left Off** — resume button with current activity name
- **Mountain Journey Map** — SVG mountain trail with 20 activity markers, summit flag, PART labels
- **Milestone Celebrations** — popup at 5/10/15/20 activities (localStorage dedup)
- **Streak Break Encouragement** — welcome-back message when streak breaks (maxStreak tracked)
- **Achievements** — 9 badges (streak + PART + completion), current title card
- **Before & After** — Day 1 dream vs current reality comparison (15+ activities)
- **Dark mode toggle** — sun/moon icon in header, localStorage persisted
- **Notification bell** — insight count badge
- **Export PDF** button
- 4 PART cards with lock/unlock

#### Cross-Part Data References
- **CrossPartRef component** — collapsible panel showing relevant data from previous PARTs
- PART 3 activities reference: PART 1 skills/resources/time + PART 2 Why/ideas/market scan
- PART 4 activities reference: PART 2 strengths/weaknesses + PART 3 proposal + PART 1 skills
- Context-aware: each activity gets only relevant references

#### Journey Completion
- **Part4Reflection completion screen** with:
  - AI Journey Report (5 sections: Core Assets, Your Why, Validated Idea, Your Network, Next Steps)
  - Completion Certificate (digital, with name, date, and Dream Hub branding)
  - Per-PART summary cards with key data points
  - Journey stats (skills, lessons, tests, fans)
  - Simon Squibb quote
  - PDF export

#### PDF Export
- **@react-pdf/renderer** — 5-page branded PDF report
- Cover page (dream statement, name, date)
- Per-PART data summaries (skills, resources, proposals, fans, etc.)
- Available on dashboard + PART 4 completion screen

#### Gamification
- **9 badges**: First Step, Reality Facer, Dream Discoverer, Idea Builder, Dream Connector, Dream Launcher, 7/30/90-day streaks
- **Titles**: Earned by completing PARTs, shown on dashboard greeting
- **Streak tracking**: Daily visit counter with badge milestones

### Dependencies
- `recharts` ^3.7 (radar, pie, bar, line charts)
- `@xyflow/react` (React Flow for mind map)
- `@dnd-kit/core` + `@dnd-kit/sortable` (drag and drop)
- `openai` (AI Coach API)
- `@react-pdf/renderer` (PDF export)

---

## 3. Remaining / Next Steps

### High Priority (MVP completion)
- [ ] **Prisma + DB**: Connect `@dreamhub/database`, migrate from localStorage
- [ ] **Auth**: Connect `@dreamhub/auth` (NextAuth), Dream ID login
- [ ] **API Routes**: CRUD endpoints for activity data persistence

### Medium Priority (feature enhancements)
- [ ] **Time comparison**: 3-month overlay for resource map radar chart
- [ ] **CSV import**: Money Flow expense import from bank statements
- [ ] **Drag-and-drop enhancements**: Skills card reordering, TimeLog calendar drag-create
- [ ] **PWA/Offline**: Service worker, manifest.json
- [ ] **History/version management**: Activity data versioning with time travel

### Low Priority (ecosystem)
- [ ] Dream Hub ecosystem integration (Brain→Planner, Planner→Place/Store)
- [ ] Community sharing features (share activities, get feedback)
- [ ] OCR for physical planner sync
- [ ] Gamification animations (confetti on PART completion)

### Known Issues
- `recharts` v3 Tooltip `formatter` type: use `(value) => Number()` cast
- Onboarding → dashboard hydration may briefly flash
- PDF font loading requires network access (Google Fonts CDN)

---

## 4. Architecture Decisions

| Decision | Reason |
|----------|--------|
| localStorage first | No DB needed for demo. Swap store layer for API later |
| `useSyncExternalStore` | React 19 pattern, no Context needed |
| 2s debounced save | Per CLAUDE.md spec |
| Dynamic PDF import | Avoids SSR issues with @react-pdf/renderer |
| AI Coach mock fallback | Works without API key for demo/development |
| Per-activity stuck messages | 20 unique messages matching each activity's context |
| Insight persistence | Stored in localStorage for dashboard display |
| Client-side AI panels | No API calls needed — pure pattern analysis on store data |
| CrossPartRef component | Centralized cross-part logic, context-aware filtering |

---

## 5. Design Doc Coverage

### Fully Implemented from Design Doc
- All 20 activities with interactive UI (section 1-1 through 1-4)
- All "웹앱 추가 가치" AI insight panels for every activity
- AI coaching system with auto-triggers (section 3)
- AI typing pause detection (5-10s → deeper follow-up question)
- Progress dashboard with recommendations (section 5-1)
- Before & After comparison (section 6)
- Gamification: badges, titles, streak (section 6)
- Milestone celebrations (5/10/15/20 activities popup)
- Streak break encouragement on dashboard
- Mountain journey map visualization (section 6)
- Completion certificate (section 6)
- PART 2/3 enhanced completion screens with data summaries
- Cross-part data references (section 1-5, 3-4)
- Failure Resume → Strengths Redefine reference panel
- Dark mode toggle (section 1-5)
- PDF export (section 4-2)

### Not Yet Implemented
- OCR physical planner import (section 4-1)
- QR code linking (section 4-3)
- Sync dashboard for physical + digital (section 4-4)
- Dream Hub ecosystem API integration (section 10)
- Community sharing (section 6)
- PWA/Offline support (section 1-5)
- History/version management (section 1-5)
- Reminder notifications (section 1-5, requires backend)

---

## 6. Useful Commands

```bash
# Read design doc
textutil -convert txt -stdout ~/Desktop/dreamhub/docs/드림\ 플래너\ 상세설계서.docx

# Build
cd ~/Desktop/dreamhub/apps/dream-planner && pnpm build

# Dev server
pnpm dev  # :3001

# Reset localStorage (browser console)
localStorage.removeItem('dream-planner-data')

# Enable AI Coach (set in .env.local)
OPENAI_API_KEY=sk-...
NEXT_PUBLIC_OPENAI_ENABLED=true
```
