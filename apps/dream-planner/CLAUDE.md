# Dream Planner — CLAUDE.md

## 🌍 CRITICAL: ALL UI TEXT MUST BE IN ENGLISH
This is a global product. Every label, button, placeholder, heading, tooltip, and error message must be in English. No Korean text in the UI. Use next-intl for i18n support.

## What is Dream Planner?
An interactive web app version of Simon Squibb's physical Dream Planner workbook. It guides users through 4 PARTs to discover, plan, validate, and launch their dreams. Think of it as a "digital workbook with AI coaching."

## Core Structure
The planner has 4 PARTs, each with multiple Activities:

### PART 1: Face My Reality (5 activities)
1. Skills & Experience Inventory — tag cloud + AI skill suggestions
2. Resource Map — radar chart (6 axes: money/time/skills/experience/people/physical)
3. Time Log — week calendar with drag-to-create time blocks, auto color-coded
4. Money Flow — expense tracker with satisfaction rating, AI pattern analysis
5. Define My Current State — 5-card layout with AI "constraint → opportunity" reframe

### PART 2: Discover My Dream (6 activities)  
1. Experience Mind Map — interactive node graph (React Flow)
2. Failure Resume — timeline of failures → lessons learned
3. Why-What Bridge — brainstorm → twist matrix → final idea selection
4. Passion Thermometer — 10 criteria scoring for each idea
5. Dream Statement — guided writing with AI feedback
6. Vision Board — image upload + collage builder

### PART 3: Validate & Build (6 activities)
1. One-Line Proposal — target + problem + solution + differentiator combinator
2. Hypothesis-Validation Board — Kanban (hypothesis → method → criteria → result → lesson)
3. Zero-Cost MVP Builder — step-by-step wizard (6 steps)
4. Value Ladder — visual 4-step ladder (freebie → low → mid → high price)
5. Traffic Light Analysis — categorize activities as green/yellow/red
6. First Revenue Calculator — simple revenue simulation

### PART 4: Connect & Expand (6 activities)
1. First 10 Fans — fan candidate CRM with relationship temperature gauge
2. Dream 5 Network — mentor(1) + peers(2) + prospects(2) role slots
3. First Rejection Collection — 3 rejection challenge cards
4. Support System Map — visual network of supporters
5. 90-Day Sprint Plan — Gantt-style timeline with milestones
6. Growth Dashboard — metrics tracking (fans, revenue, validations)

### Each PART has a Reflection section with AI-generated summary.

## Key UI Patterns
- **Step-by-step wizard** for complex activities (not all fields at once)
- **Progress bar** showing completion across all 4 PARTs
- **AI Coach chat bubble** that appears contextually (not always visible)
- **Auto-save** every change (debounced 2 seconds)
- **Card-based inputs** — never plain forms
- **Interactive charts** that update in real-time as user inputs data

## Tech Specifics
- Charts: Recharts (radar, donut, line, bar)
- Node graph: React Flow (for mind map)
- Drag & drop: @dnd-kit/core
- Rich text: Tiptap editor (for reflection writing)
- PDF export: react-pdf (for completed planner export)

## AI Coach Behavior
- Appears as a small chat bubble in bottom-right
- Triggers: when user is stuck (no input for 3+ minutes), after completing an activity, between PARTs
- Tone: encouraging, practical, Simon Squibb-style ("What if you could...?")
- Examples:
  - "Your strongest resource is Experience (5/5). Have you considered mentoring as a starting point?"
  - "This hypothesis is too broad. Try narrowing to: 'Can I get 3 people to pay $10 for X in 1 week?'"
  - "Your time log shows 6 hours of 'consumption time' on Tuesday evenings. What if you converted just 2 hours?"

## Data Model (Key Entities)
```
User → has many → PlannerSessions
PlannerSession → has many → PartProgresses (PART 1-4)
PartProgress → has many → ActivityResponses
ActivityResponse → { activityId, data (JSONB), completedAt, aiCoachingLog[] }
```

## API Endpoints Pattern
```
GET    /api/planner/sessions          — list user's sessions
POST   /api/planner/sessions          — create new session
GET    /api/planner/sessions/:id      — get session with all progress
PATCH  /api/planner/activities/:id    — update activity response (auto-save)
POST   /api/planner/ai-coach         — get AI coaching response
POST   /api/planner/export/pdf       — export completed planner as PDF
```

## MVP Scope (Build This First)
1. ✅ PART 1 only (5 activities) — fully interactive
2. ✅ Basic AI Coach (GPT-4o-mini) — 3 trigger points
3. ✅ Auto-save to database
4. ✅ Progress tracking UI
5. ❌ PDF export (later)
6. ❌ PART 2-4 (later iterations)
7. ❌ Dream Hub ecosystem integration (later)

## Design Reference
- Clean, minimal white background
- Card shadows: shadow-sm on hover → shadow-md
- Progress indicators: purple gradient fill
- AI Coach: friendly avatar, speech bubble with subtle animation
