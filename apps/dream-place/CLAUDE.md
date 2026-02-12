# Dream Place — CLAUDE.md

## 🌍 CRITICAL: ALL UI TEXT MUST BE IN ENGLISH
This is a global product. Every label, button, placeholder, heading, tooltip, and error message must be in English. No Korean text in the UI. Use next-intl for i18n support.

## What is Dream Place?
A global dreamer matching platform. Think "LinkedIn meets Tinder for Dreams." People share their dreams and get matched with complementary teammates — not by job title, but by shared dreams + different skills. No existing platform does this.

## Core Concept
- User A dreams of "building an AI-powered language learning app" and has marketing skills
- User B dreams of "creating educational technology" and has full-stack dev skills
- Dream Place matches them: "85% Dream Match — Complementary skills, aligned vision"
- They can form a Dream Team and collaborate

## Key Pages & Features

### 1. Onboarding (Dream Profile Creation)
- Step 1: "What's your dream?" — free text dream statement
- Step 2: "What skills do you bring?" — tag selector (design, marketing, coding, finance, etc.)
- Step 3: "What skills do you need?" — tag selector
- Step 4: "Where are you?" — location (for local meetups via Dream Cafe)
- Step 5: Profile photo + short bio
- AI enrichment: analyzes dream statement to extract additional skill tags and dream categories

### 2. Discover / Match Feed
- Card-based feed showing potential matches
- Each card: Avatar, Name, Dream Statement, Match Score (%), Skill overlap diagram
- Swipe or button: "Interested" / "Skip" / "Save for Later"
- Filter by: dream category, skills needed, location, match score

### 3. Match Detail Page
- Full dream story comparison (side by side)
- Skill Venn diagram: "Your skills" ∩ "Their skills" ∩ "Skills needed"
- Match breakdown: Dream Alignment (40%) + Skill Complementarity (35%) + Values (25%)
- "Send Dream Request" button (like a connection request)

### 4. Dream Teams
- Once matched and accepted, users form a "Dream Team"
- Team dashboard: shared goals, tasks, chat
- Team profile visible on Dream Store (for team products)

### 5. Messages
- Chat between matched dreamers
- Ice-breaker suggestions from AI: "You both mentioned 'sustainability' — start there!"

### 6. Global Dream Map (Future Feature)
- 3D globe showing dreamers worldwide
- Click a region to see dreams in that area
- Purely visual/inspirational for MVP — show pins on a 2D map instead

## Matching Algorithm (Simplified for MVP)
```
matchScore = (dreamSimilarity * 0.40) + (skillComplementarity * 0.35) + (valueAlignment * 0.25)

dreamSimilarity: cosine similarity of dream statement embeddings (text-embedding-3-small)
skillComplementarity: overlap between userA.skillsOffered and userB.skillsNeeded (and vice versa)
valueAlignment: shared interest tags / total unique tags
```

## Tech Specifics
- Embeddings: OpenAI text-embedding-3-small for dream statements
- Vector search: pgvector (PostgreSQL) for finding similar dreams
- Real-time chat: WebSocket (Socket.io) or Pusher for MVP simplicity
- Map: Leaflet.js or Mapbox GL for 2D world map
- Skill tags: predefined list of ~100 skills across 10 categories

## Data Model (Key Entities)
```
User → has one → DreamProfile
DreamProfile → {
  dreamStatement (text),
  dreamEmbedding (vector, 1536d),
  skillsOffered: string[],
  skillsNeeded: string[],
  interests: string[],
  location: { city, country, lat, lng },
  dreamCategory (enum),
  bio (text),
  avatarUrl
}
Match → { userA_id, userB_id, matchScore, dreamScore, skillScore, valueScore, status (pending/accepted/declined) }
DreamTeam → { name, members[], dreamStatement, createdAt }
Message → { senderId, receiverId, content, createdAt }
```

## API Endpoints Pattern
```
# Profile
POST   /api/dream-profile             — create/update dream profile
GET    /api/dream-profile/:id          — get someone's profile

# Matching
GET    /api/matches/discover           — get match feed (paginated)
POST   /api/matches/:userId/interest   — express interest
POST   /api/matches/:matchId/accept    — accept match request
GET    /api/matches                     — list my matches

# Teams
POST   /api/teams                      — create dream team
GET    /api/teams/:id                  — get team details
PATCH  /api/teams/:id                  — update team

# Messages
GET    /api/messages/:matchId          — get chat history
POST   /api/messages/:matchId          — send message
```

## MVP Scope (Build This First)
1. ✅ Dream Profile creation (5-step onboarding)
2. ✅ Basic matching algorithm (embedding similarity + skill overlap)
3. ✅ Discover feed with match cards
4. ✅ Match request flow (interested → accepted → connected)
5. ✅ Simple messaging (text only)
6. ❌ Dream Teams (Phase 2)
7. ❌ Global Map visualization (Phase 2)
8. ❌ AI ice-breaker suggestions (Phase 2)
9. ❌ Video chat (Phase 3)
10. ❌ Dream Hub ecosystem integration (Phase 3)

## Design Reference
- Bright, optimistic color scheme — NOT dating-app vibes
- Match score displayed as circular progress ring
- Skill tags as colorful pills/badges
- Card-based discovery (think ProductHunt meets LinkedIn)
- Generous whitespace, inspiring photography as backgrounds
