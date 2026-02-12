# Dream Brain — CLAUDE.md

## 🌍 CRITICAL: ALL UI TEXT MUST BE IN ENGLISH
This is a global product. Every label, button, placeholder, heading, tooltip, and error message must be in English. No Korean text in the UI. Use next-intl for i18n support.

## What is Dream Brain?
An AI-powered thought journaling app. Users record thoughts via voice or text, and AI automatically transcribes, categorizes, tags, summarizes, and connects them. Think "Notion's organization + Obsidian's linking + AI automation." It's the foundation layer of Dream Hub — your "second brain" for dreams.

## Core Flow
1. User taps mic → speaks a thought (30 sec to 5 min)
2. AI transcribes (Whisper API) → converts to text
3. AI auto-categorizes (Ideas / Work / Emotions / Daily / Learning / Dreams)
4. AI generates tags, keywords, and 1-line summary
5. Thought appears in the "Brain" — a visual network of connected ideas
6. Over time, AI discovers patterns: "You've mentioned 'coffee shop' 12 times this month"

## Key Pages & Features

### 1. Home / Quick Capture
- Large floating mic button (FAB) — center screen
- Recent thoughts feed below
- Quick text input alternative (for quiet environments)
- Daily prompt suggestion: "What's on your mind right now?"

### 2. Brain View (Graph Visualization)
- 2D interactive node graph (React Flow or D3.js for MVP)
- Nodes = individual thoughts, sized by importance
- Edges = AI-detected connections between thoughts
- Color-coded by category
- Click node → expand to see full thought + related thoughts
- Filter by category, date range, tags
- 3D Brain Map is a FUTURE feature — start with 2D graph

### 3. Timeline View
- Chronological feed of all thoughts
- Grouped by day
- Filter & search by keyword, category, tag
- Each entry shows: timestamp, category badge, summary, tags

### 4. Insights Dashboard
- Weekly/Monthly AI-generated insights
- "Top themes this week" word cloud
- "Emotional trends" (if sentiment analysis is on)
- "Recurring interests" — things you keep thinking about
- "Suggested connections" — thoughts that might relate

### 5. Thought Detail Page
- Full transcription text
- AI-generated summary, tags, category
- "Related Thoughts" sidebar (vector similarity search)
- Edit capability (fix transcription errors)
- Manual tag/category override

## Tech Specifics
- Speech-to-Text: OpenAI Whisper API (multilingual, good accuracy)
- AI Processing: GPT-4o-mini for categorization, tagging, summarization
- Vector storage: pgvector extension on PostgreSQL (for "related thoughts" search)
- Graph visualization: React Flow (2D) for MVP
- Audio recording: Web Audio API + MediaRecorder
- Real-time transcription preview: Whisper streaming (or post-recording for MVP)

## AI Pipeline (Per Thought)
```
Audio → Whisper API (transcribe) → GPT-4o-mini (structured output):
{
  "summary": "One-line summary",
  "category": "Ideas",
  "tags": ["coffee-shop", "business", "side-project"],
  "keywords": ["coffee", "business idea", "local community"],
  "sentiment": "excited",
  "relatedTopics": ["entrepreneurship", "food-service"]
}
→ Generate embedding (text-embedding-3-small)
→ Store in PostgreSQL with pgvector
→ Find related thoughts via cosine similarity
```

## Data Model (Key Entities)
```
User → has many → Thoughts
Thought → {
  audioUrl (S3/Cloudinary),
  transcription (text),
  summary (AI),
  category (enum),
  tags[] (AI + user),
  keywords[] (AI),
  sentiment (AI),
  embedding (vector, 1536 dimensions),
  createdAt,
  updatedAt,
  isEdited (boolean)
}
Thought → has many → Connections (to other Thoughts, AI-detected)
Connection → { thoughtA_id, thoughtB_id, similarityScore, connectionReason }
InsightReport → { userId, periodType (weekly/monthly), content (JSONB), generatedAt }
```

## API Endpoints Pattern
```
# Thoughts
POST   /api/thoughts/audio           — upload audio → transcribe → process
POST   /api/thoughts/text            — create text thought → process
GET    /api/thoughts                  — list thoughts (paginated, filterable)
GET    /api/thoughts/:id              — get thought detail + related
PATCH  /api/thoughts/:id              — edit thought (text, tags, category)
DELETE /api/thoughts/:id              — delete thought

# Brain View
GET    /api/brain/graph               — get nodes + edges for visualization
GET    /api/brain/search?q=           — semantic search across thoughts

# Insights
GET    /api/insights/weekly           — get weekly insight report
GET    /api/insights/themes           — get top recurring themes
```

## MVP Scope (Build This First)
1. ✅ Text-based thought capture (skip voice for MVP — simpler)
2. ✅ AI categorization + tagging + summary (GPT-4o-mini)
3. ✅ Timeline view with search & filter
4. ✅ Basic "Related Thoughts" (pgvector similarity)
5. ✅ Simple 2D graph view (React Flow)
6. ❌ Voice recording + Whisper (Phase 2)
7. ❌ Weekly/Monthly AI insights (Phase 2)
8. ❌ Sentiment analysis (Phase 2)
9. ❌ 3D Brain visualization (Phase 3)
10. ❌ Dream Hub ecosystem connections (Phase 3)

## Design Reference
- Dark mode by default (brain/space theme)
- Nodes glow with category colors
- Minimal, distraction-free capture screen
- Smooth animations for node connections
- Clean typography for reading transcriptions
