# Dream Hub Platform: Complete UIUX and Brand Identity Specification

## Bottom line up front

This document provides Claude Code-ready specifications for all 4 Dream Hub services—Dream Brain, Dream Planner, Dream Place, and Dream Store—based on competitive UX research across 30+ comparable apps. Each specification includes exact hex codes, typography scales, component definitions, interaction patterns, and UX decisions grounded in real user pain points discovered through analysis of Notion, Obsidian, Otter.ai, Duolingo, Headspace, LinkedIn, Bumble, YC Co-founder Matching, Etsy, Kickstarter, and dozens more. The shared design system uses design tokens architecture so all 4 services feel like family while maintaining distinct identities rooted in Simon Squibb's existing brand palette.

---

## PART 0: SHARED DESIGN SYSTEM (All 4 Services)

### 0.1 Design tokens architecture

```
/* GLOBAL TOKENS — identical across all 4 services */
--dream-font-primary: 'Pretendard', 'Inter', -apple-system, sans-serif;
--dream-font-display: 'Plus Jakarta Sans', 'Pretendard', sans-serif;

--dream-radius-sm: 8px;
--dream-radius-md: 12px;
--dream-radius-lg: 16px;
--dream-radius-xl: 24px;
--dream-radius-full: 9999px;

--dream-shadow-sm: 0 1px 3px rgba(0,0,0,0.08);
--dream-shadow-md: 0 4px 12px rgba(0,0,0,0.10);
--dream-shadow-lg: 0 8px 24px rgba(0,0,0,0.12);
--dream-shadow-xl: 0 16px 48px rgba(0,0,0,0.16);

--dream-spacing-xxs: 4px;
--dream-spacing-xs: 8px;
--dream-spacing-sm: 12px;
--dream-spacing-md: 16px;
--dream-spacing-lg: 24px;
--dream-spacing-xl: 32px;
--dream-spacing-2xl: 48px;
--dream-spacing-3xl: 64px;

--dream-transition-fast: 150ms ease;
--dream-transition-normal: 250ms ease;
--dream-transition-slow: 400ms cubic-bezier(0.4, 0, 0.2, 1);

/* SHARED NEUTRALS */
--dream-neutral-50: #FAFAFA;
--dream-neutral-100: #F5F5F5;
--dream-neutral-200: #E5E5E5;
--dream-neutral-300: #D4D4D4;
--dream-neutral-400: #A3A3A3;
--dream-neutral-500: #737373;
--dream-neutral-600: #525252;
--dream-neutral-700: #404040;
--dream-neutral-800: #262626;
--dream-neutral-900: #171717;

/* SHARED SEMANTIC COLORS */
--dream-success: #22C55E;
--dream-success-light: #DCFCE7;
--dream-warning: #F59E0B;
--dream-warning-light: #FEF3C7;
--dream-error: #EF4444;
--dream-error-light: #FEE2E2;
--dream-info: #3B82F6;
--dream-info-light: #DBEAFE;

/* DREAM HUB MASTER BRAND */
--dream-hub-yellow: #FFC300;
--dream-hub-dark: #1A1A2E;
```

### 0.2 Typography system

**Font stack**: Pretendard (Korean-optimized, open source, supports Latin + Hangul with unified design) as primary, falling back to Inter for Latin-only contexts. Plus Jakarta Sans for display/hero headings.

**Why Pretendard**: It was designed specifically for Korean digital interfaces, has 9 weights, covers Latin and Korean with visually harmonized proportions, and is free/open source. Inter is the fallback for global users without Korean needs.

```
/* TYPE SCALE */
--dream-text-display: 700 36px/1.2 var(--dream-font-display);  /* Hero text */
--dream-text-h1: 700 28px/1.3 var(--dream-font-primary);
--dream-text-h2: 600 24px/1.35 var(--dream-font-primary);
--dream-text-h3: 600 20px/1.4 var(--dream-font-primary);
--dream-text-h4: 600 18px/1.4 var(--dream-font-primary);
--dream-text-h5: 500 16px/1.5 var(--dream-font-primary);
--dream-text-h6: 500 14px/1.5 var(--dream-font-primary);
--dream-text-body: 400 16px/1.6 var(--dream-font-primary);
--dream-text-body-sm: 400 14px/1.6 var(--dream-font-primary);
--dream-text-caption: 400 12px/1.5 var(--dream-font-primary);
--dream-text-overline: 600 11px/1.5 var(--dream-font-primary);  /* letter-spacing: 0.08em; text-transform: uppercase */

/* KOREAN-SPECIFIC ADJUSTMENTS */
[lang="ko"] {
  --dream-text-body: 400 16px/1.75 var(--dream-font-primary);
  --dream-text-body-sm: 400 14px/1.7 var(--dream-font-primary);
  letter-spacing: -0.01em;  /* Korean reads better slightly tighter */
}
```

### 0.3 Shared component specifications

**Buttons**:
```css
/* PRIMARY BUTTON — color changes per service */
.btn-primary {
  height: 48px;                        /* touch-friendly */
  padding: 0 24px;
  border-radius: var(--dream-radius-md); /* 12px */
  font: 600 16px/1 var(--dream-font-primary);
  background: var(--dream-color-primary);
  color: var(--dream-color-on-primary);
  border: none;
  transition: all var(--dream-transition-fast);
  /* Hover: brightness(1.08) */
  /* Active: scale(0.97) + brightness(0.95) */
  /* Disabled: opacity 0.4, pointer-events none */
}

/* SECONDARY BUTTON */
.btn-secondary {
  height: 48px;
  padding: 0 24px;
  border-radius: var(--dream-radius-md);
  font: 600 16px/1 var(--dream-font-primary);
  background: transparent;
  color: var(--dream-color-primary);
  border: 1.5px solid var(--dream-color-primary);
}

/* GHOST BUTTON */
.btn-ghost {
  height: 40px;
  padding: 0 16px;
  border-radius: var(--dream-radius-md);
  font: 500 14px/1 var(--dream-font-primary);
  background: transparent;
  color: var(--dream-color-primary);
  border: none;
}

/* ICON BUTTON (FAB) */
.btn-icon {
  width: 56px;
  height: 56px;
  border-radius: var(--dream-radius-full);
  display: flex;
  align-items: center;
  justify-content: center;
}
```

**Cards**:
```css
.card {
  background: var(--dream-color-surface);
  border-radius: var(--dream-radius-lg);  /* 16px */
  padding: var(--dream-spacing-md);       /* 16px */
  box-shadow: var(--dream-shadow-sm);
  border: 1px solid var(--dream-neutral-200);
  transition: box-shadow var(--dream-transition-normal);
  /* Hover: shadow-md */
}
.card-elevated {
  box-shadow: var(--dream-shadow-md);
  border: none;
}
```

**Input fields**:
```css
.input {
  height: 48px;
  padding: 0 16px;
  border-radius: var(--dream-radius-md);
  border: 1.5px solid var(--dream-neutral-300);
  font: 400 16px/1 var(--dream-font-primary);
  background: var(--dream-color-surface);
  color: var(--dream-neutral-900);
  transition: border-color var(--dream-transition-fast);
  /* Focus: border-color: var(--dream-color-primary); box-shadow: 0 0 0 3px var(--dream-color-primary-light) */
  /* Error: border-color: var(--dream-error); */
  /* Placeholder: var(--dream-neutral-400) */
}
```

**Navigation (mobile)**: Bottom tab bar, 5 items max, icon + label, active state uses service primary color. Height: 56px + safe area. Background: white with 1px top border `var(--dream-neutral-200)`.

**Navigation (desktop)**: Left sidebar, 240px width, collapsible to 64px icon-only mode. Same items as mobile bottom bar plus expanded sections.

**Icons**: Lucide Icons (open source, consistent 24px grid, 1.5px stroke). Filled variants for active nav states, outlined for inactive.

**Avatar component**:
```css
.avatar { border-radius: var(--dream-radius-full); object-fit: cover; }
.avatar-sm { width: 32px; height: 32px; }
.avatar-md { width: 40px; height: 40px; }
.avatar-lg { width: 56px; height: 56px; }
.avatar-xl { width: 80px; height: 80px; }
```

### 0.4 Dream ID login (shared across all services)

One unified authentication flow. Screen: centered card with Dream Hub logo (yellow on dark), "Sign in to Dream Hub" heading, then options: Continue with Google (button), Continue with Apple (button), Continue with KakaoTalk (button, critical for Korean market), divider "or", email + password fields. Below: "New to Dream Hub? Create your Dream ID". After login, users land in whichever service they're accessing. The Dream ID profile includes: name, avatar, dream statement, location, language preference.

### 0.5 Shared micro-interactions

- **Button press**: `scale(0.97)` on press, `scale(1)` on release, **150ms** ease
- **Card hover (desktop)**: lift with `shadow-md` + `translateY(-2px)`, **250ms** ease
- **Tab switch**: crossfade content with **200ms** ease, underline indicator slides with **300ms** spring
- **Pull to refresh**: custom Dream Hub animation — small brain/star icon that rotates
- **Success state**: green checkmark with circular draw animation, **400ms**
- **Skeleton loading**: shimmer gradient animation `linear-gradient(90deg, neutral-100 25%, neutral-200 50%, neutral-100 75%)` moving left to right, **1.5s** loop
- **Toast notifications**: slide in from top, **300ms** spring, auto-dismiss after **4s** with fade out

---

## PART 1: DREAM BRAIN — AI Voice Note + Second Brain

### 1.1 Brand identity

**Brand personality**: Calm intelligence. Fast. Invisible. Like a brilliant assistant who captures your thoughts before you even finish thinking them.

**Primary color**: Deep Violet `#7C3AED` — derived from mixing HelpBnk blue and planner pink. Violet signals wisdom, creativity, and deep thought. Differentiated from the warmer tones of sibling services.

```
/* DREAM BRAIN COLOR TOKENS */
--dream-color-primary: #7C3AED;           /* Deep Violet */
--dream-color-primary-light: #EDE9FE;     /* Violet 100 */
--dream-color-primary-lighter: #F5F3FF;   /* Violet 50 */
--dream-color-primary-dark: #6D28D9;      /* Violet 700 */
--dream-color-primary-darker: #5B21B6;    /* Violet 800 */
--dream-color-on-primary: #FFFFFF;

--dream-color-secondary: #06B6D4;         /* Cyan 500 — for AI/tech elements */
--dream-color-secondary-light: #CFFAFE;   /* Cyan 100 */

--dream-color-accent: #F59E0B;            /* Amber — for highlights, starred notes */
--dream-color-accent-light: #FEF3C7;

--dream-color-surface: #FFFFFF;
--dream-color-surface-alt: #F5F3FF;       /* Very light violet tint */
--dream-color-background: #FAFAFA;

--dream-color-text-primary: #171717;
--dream-color-text-secondary: #525252;
--dream-color-text-tertiary: #A3A3A3;

/* RECORDING STATE COLORS */
--dream-recording-active: #EF4444;        /* Red pulse during recording */
--dream-recording-bg: #7C3AED;            /* Violet ambient glow */

/* KNOWLEDGE GRAPH COLORS */
--dream-node-idea: #7C3AED;
--dream-node-task: #22C55E;
--dream-node-person: #3B82F6;
--dream-node-project: #F59E0B;
--dream-edge-strong: rgba(124, 58, 237, 0.6);
--dream-edge-weak: rgba(124, 58, 237, 0.15);
```

### 1.2 Tone of voice

- **Ultra-concise**: UI copy never exceeds 8 words for labels. "Record" not "Start a new recording."
- **Quiet confidence**: "Your thought is saved" not "Great job! Your thought was captured successfully!"
- **First-person assistant**: "I found 3 related notes" not "3 related notes found"
- **No exclamation marks** in system UI. Calm, not excited.
- **Empty states**: Warm, inviting. "Your brain starts here. Record your first thought." Not "No notes yet."
- **Error states**: Helpful, not alarming. "Couldn't connect. Your recording is saved locally." Not "Error: Network failure."

### 1.3 Key screens

**Screen 1: Home / Quick Capture (the most critical screen)**

Research insight: Apple Voice Memos achieves one-tap recording. Google Keep is the fastest for text capture. Bear loads instantly because it's native. Mem.ai's "several seconds to load" killed its promise. **Speed is the entire product.**

Layout (mobile):
- **Top bar** (56px): Left: small Dream Brain logo (violet). Center: search icon. Right: profile avatar (32px).
- **Main area**: Full screen is dominated by a single massive circular record button (120px diameter, violet `#7C3AED`) centered in the lower third of the screen. The button has a subtle breathing animation (scale 1.0 → 1.03 → 1.0, **3s** loop, ease-in-out) to invite touch.
- **Above the button**: Recent notes shown as a reverse-chronological feed of compact cards. Each card: left side shows AI-generated title (bold, 16px) + first line of transcript (14px, neutral-500) + timestamp (12px, neutral-400). Right side shows auto-generated category tag pill (e.g., "💡 Idea", "✅ Task", "👤 Person"). Card height: ~72px. Tapping a card opens the note detail.
- **Below the button**: Text: "Tap to record" (12px, neutral-400). Below that: small keyboard icon + "Type instead" link.
- **No onboarding wall**: First launch goes directly to this screen. The app defers account creation until the user has recorded 3 notes (Duolingo-inspired delayed registration). A small tooltip appears on first launch: "Tap the button. Say anything." — dismisses on tap or after 3 seconds.

Interaction:
- Tap record button → button instantly changes to red (`#EF4444`) with pulsing ring animation → recording begins within **0 milliseconds of UI response** (audio buffer pre-initialized on app launch)
- During recording: waveform visualization appears above button (real-time amplitude bars, violet-to-cyan gradient). Timer shows elapsed time. Button becomes "Tap to stop" (red).
- Tap stop → recording ends → 0.5s shimmer → AI transcript appears as a new card at top of feed with a "sparkle" entrance animation. Auto-categorized tag appears after ~2s.
- **Total time from app open to recording: target 0.8 seconds**. Achieved via: native app (not web), pre-warmed audio session, no splash screen, no auth gate, instant render of cached UI.

**Screen 2: Note detail**

Layout (mobile):
- **Top bar**: Back arrow. Right: overflow menu (share, delete, star, edit tags).
- **Metadata strip** (horizontal scroll): Date + time pill, Location pill (auto-captured), Auto-category tag pill (editable on tap), Custom tags (add with + button).
- **Audio player**: Compact waveform bar (full width, 48px height) with play/pause button and scrub capability. Playback speed toggle (1x, 1.5x, 2x).
- **Transcript section**: Full AI transcript in clean body text. AI-generated **summary** shown at top in a violet-tinted card (`surface-alt` background). Summary is 2-3 sentences max. Below summary: full transcript with timestamps on hover/tap.
- **Related notes section**: "Related thoughts" header. Horizontal scroll of related note cards (determined by AI semantic similarity). Each card shows title + category + match strength indicator (subtle violet opacity).
- **Action items**: If AI extracted tasks, shown in a checklist card with checkboxes. Can be sent to Dream Planner with one tap.

**Screen 3: Brain view (3D knowledge graph)**

Research insight: Obsidian's graph view is "overhyped and impractical" for daily use. Reddit users report it looks impressive but provides little practical value. The Dream Brain graph must be **interactive and useful**, not decorative.

Layout:
- Full-screen 3D visualization using WebGL/Three.js (or React Three Fiber for React Native).
- **Nodes**: Circles sized by number of connections. Color-coded by category (Idea=violet, Task=green, Person=blue, Project=amber). Tap a node to see a floating card preview.
- **Edges**: Lines connecting semantically related notes. Opacity indicates connection strength.
- **Clusters**: AI-identified topic clusters are spatially grouped. Cluster labels float above groups.
- **Controls**: Pinch to zoom. Pan to navigate. Tap node to focus (camera animates to center on node with **500ms** spring). Double-tap to open note detail.
- **Bottom sheet**: Draggable sheet from bottom shows a filtered list view of notes. Can toggle between graph and list. Filter by: category, date range, tag.
- **Practical additions** (addressing Obsidian's graph failures): "Insights" panel showing AI-detected patterns: "You've talked about [topic] 12 times this month" or "These 3 notes might be connected — want to merge them?"

**Screen 4: Search**

- Full-screen search with large input field at top.
- **Natural language search**: "What did I say about marketing last week?" works alongside keyword search.
- Results show highlighted matching text within note previews.
- Recent searches shown below input when empty.
- Filter chips: All, Ideas, Tasks, People, Projects, Starred.

### 1.4 Component specifications (Dream Brain-specific)

**Recording button (FAB)**:
```css
.record-btn {
  width: 120px; height: 120px;
  border-radius: 50%;
  background: var(--dream-color-primary);  /* #7C3AED */
  box-shadow: 0 8px 32px rgba(124, 58, 237, 0.35);
  /* Idle: breathing animation */
  animation: breathe 3s ease-in-out infinite;
}
.record-btn--active {
  background: var(--dream-recording-active);  /* #EF4444 */
  box-shadow: 0 0 0 12px rgba(239, 68, 68, 0.15);
  animation: pulse 1.2s ease-in-out infinite;
}
@keyframes breathe { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.03); } }
@keyframes pulse { 0%, 100% { box-shadow: 0 0 0 0 rgba(239,68,68,0.3); } 50% { box-shadow: 0 0 0 16px rgba(239,68,68,0); } }
```

**Waveform visualizer**: 40 vertical bars, 3px wide, 2px gap, height responsive to audio amplitude, gradient from `#7C3AED` (bottom) to `#06B6D4` (top). During playback: current position highlighted, past bars at full opacity, future bars at 0.3 opacity.

**Note card (feed item)**:
```css
.note-card {
  padding: 12px 16px;
  display: flex;
  align-items: center;
  gap: 12px;
  border-bottom: 1px solid var(--dream-neutral-100);
  /* No border-radius in feed — cards run edge to edge for density */
}
.note-card__tag {
  padding: 4px 10px;
  border-radius: var(--dream-radius-full);
  font: 500 11px/1 var(--dream-font-primary);
  background: var(--dream-color-primary-light);
  color: var(--dream-color-primary);
}
```

**AI summary card**:
```css
.ai-summary {
  background: var(--dream-color-surface-alt);  /* #F5F3FF */
  border-radius: var(--dream-radius-lg);
  padding: 16px;
  border-left: 3px solid var(--dream-color-primary);
}
.ai-summary::before {
  content: '✨';  /* or Lucide sparkle icon */
  margin-right: 8px;
}
```

### 1.5 Interaction patterns and micro-animations

- **App launch → record**: 0 splash screen. App opens to cached home screen. Audio session pre-warms in background. User taps record button. Total: **< 1 second**.
- **Recording → transcript**: After stop, shimmer skeleton appears at top of feed (500ms), then transcript fades in with slide-up (300ms). Category tag pops in after 1.5s delay with a small bounce.
- **Note deletion**: Swipe left on card reveals red delete zone. Card collapses with **250ms** ease-out. Undo toast appears at bottom for 5 seconds.
- **Graph node interaction**: Tap node → connected nodes glow brighter, unconnected nodes dim to 0.15 opacity → camera smoothly orbits to center on selected node (**500ms** spring). Preview card slides up from bottom.
- **Pull to refresh**: Custom violet brain icon animates (rotates + sparkle particles) during refresh.
- **Quick capture from widget/lock screen**: iOS 14+ widget shows record button. One tap starts recording in background. Notification banner confirms recording.

### 1.6 UX decisions grounded in competitor research

| Decision | Based on | Avoiding |
|----------|----------|----------|
| Record button as centerpiece of home screen | Apple Voice Memos' one-tap simplicity | Notion's "build a system first" paralysis |
| Zero-organization AI auto-categorization | Mem.ai's zero-filing philosophy (better executed) | Obsidian's "25 plugins before you start" complexity |
| Deferred registration (record first, sign up later) | Duolingo's "first lesson before account" pattern | Otter.ai's auth wall before any value delivery |
| Local-first audio + offline transcription | Bear's native speed; Obsidian's local-first praise | Mem.ai's "several seconds to load a single note" |
| Knowledge graph as optional power feature, not default | Obsidian's graph is "impractical" per users | Making graph view the landing page |
| Auto-metadata (time, location, weather) | Day One's universally praised metadata enrichment | Google Keep's metadata-free bare-bones approach |
| AI surfacing "On This Day" and related notes | Day One's engagement-driving nostalgia feature | Apple Voice Memos' "graveyard" problem |
| No folder system, tag + AI search only | Bear's elegant tag system; Google Keep's simplicity | Notion's infinite nested pages problem |

---

## PART 2: DREAM PLANNER — Interactive Digital Workbook

### 2.1 Brand identity

**Brand personality**: Encouraging coach. Warm. Structured but never rigid. Like a wise friend walking you through the hardest decisions of your entrepreneurial journey.

**Primary color**: Warm Rose `#E11D73` — directly derived from the physical planner's pink accents but given more saturation and energy for digital screens.

```
/* DREAM PLANNER COLOR TOKENS */
--dream-color-primary: #E11D73;           /* Warm Rose */
--dream-color-primary-light: #FCE7F3;     /* Rose 100 */
--dream-color-primary-lighter: #FDF2F8;   /* Rose 50 */
--dream-color-primary-dark: #BE185D;      /* Rose 700 */
--dream-color-primary-darker: #9D174D;    /* Rose 800 */
--dream-color-on-primary: #FFFFFF;

--dream-color-secondary: #8B5CF6;         /* Violet 500 — links to Dream Brain */
--dream-color-secondary-light: #EDE9FE;

--dream-color-accent: #FFC300;            /* Dream Hub yellow — celebration/reward moments */
--dream-color-accent-light: #FEF9E7;

--dream-color-surface: #FFFFFF;
--dream-color-surface-alt: #FDF2F8;       /* Very light rose tint */
--dream-color-background: #FAFAFA;

--dream-color-text-primary: #171717;
--dream-color-text-secondary: #525252;
--dream-color-text-tertiary: #A3A3A3;

/* PART COLORS (each of the 4 Parts gets a tint) */
--dream-part-1: #E11D73;   /* Rose — Discover */
--dream-part-2: #8B5CF6;   /* Violet — Plan */
--dream-part-3: #06B6D4;   /* Cyan — Build */
--dream-part-4: #FFC300;   /* Yellow — Launch */

/* GAMIFICATION COLORS */
--dream-streak-active: #F59E0B;
--dream-streak-fire: #EF4444;
--dream-xp-gold: #FFC300;
--dream-badge-bronze: #CD7F32;
--dream-badge-silver: #C0C0C0;
--dream-badge-gold: #FFD700;
```

### 2.2 Tone of voice

- **Warm encourager**: "You're doing great" not "Good job!" (subtle distinction — the former feels genuine, the latter feels patronizing)
- **Coach, not teacher**: "What do you think about…?" not "The correct answer is…"
- **Simon Squibb's voice**: Direct, authentic, action-oriented. "Don't overthink this. Write down the first thing that comes to mind." Draws from his "anyone can do this" philosophy.
- **Progress celebration**: "Part 1 complete. You now know your dream better than 90% of people who never write it down." — specific, meaningful, not generic confetti.
- **Re-engagement**: "It's been 3 days. Your dream is still here. Ready for 10 minutes?" — gentle, not guilt-inducing. Never: "You're falling behind!"
- **AI coaching voice**: Named character "Dream Coach" — warm, Socratic, asks reflective questions. "That's an interesting answer. What made you choose that?" Not: "Here are 5 tips for…"

### 2.3 Key screens

**Screen 1: Journey map (home screen)**

Research insight: Duolingo's skill path is their most effective retention feature. Coursera's 3% completion rate happens because progress is invisible. The journey map must make progress **viscerally felt**.

Layout (mobile):
- **Top bar** (56px): Dream Planner logo (rose). Right: streak counter (🔥 7) + profile avatar.
- **Hero section**: Current Part title with completion ring (e.g., "Part 2: Plan Your Path" with circular progress at 60%). Estimated time remaining shown below ("~25 min left in this Part").
- **Journey path**: Vertical scrollable path showing all 4 Parts. Each Part is a horizontal section containing 5 activity nodes connected by a dotted line. Completed activities: filled circle (Part color) with checkmark. Current activity: larger circle with glow animation. Upcoming: outlined circles, slightly dimmed. Locked Parts show a lock icon (unlock after completing previous Part, but allow "peek" preview).
- **Current activity CTA**: Prominent card at top of journey path showing the next activity. "Continue: Activity 8 — Map Your Skills" with a progress bar and "Start" button. This card uses `shadow-lg` to pop off the background.
- **Weekly summary strip**: Below the path. "This week: 3 activities completed, 45 min invested." With a mini heatmap showing active days (Mon-Sun dots, filled = active).

**Screen 2: Activity screen (the core interactive experience)**

Activities are diverse — mind maps, card sorting, Kanban boards, wizard flows, reflective writing, AI coaching conversations. Each activity type has its own component but shares consistent wrapper:

Layout:
- **Activity header**: Part color bar at top (4px). Activity number + title ("Activity 5 of 20: Discover Your Strengths"). Progress dots showing position within current Part.
- **Instruction card**: Brief instruction from "Dream Coach" in a speech-bubble-style card with avatar. Max 2 sentences. Expandable to see full context.
- **Interactive area**: Takes remaining screen. This is where activity-specific components render:
  - **Mind map**: Canvas with central node (user's dream) + draggable child nodes. Tap to add, long-press to edit, pinch to zoom. Simple — not Miro's complexity.
  - **Card sorting**: Draggable cards (pre-populated by AI based on user's previous responses) that can be sorted into 2-4 category zones. Haptic feedback on drop.
  - **Kanban board**: 3 columns (e.g., "Now", "Next", "Later"). Cards can be created and dragged between columns.
  - **Wizard flow**: Step-by-step form with 3-5 questions per page. Progress bar at top. One question visible at a time. Large touch targets for options.
  - **Reflective writing**: Clean text area with AI-generated prompts. Minimum character indicator (e.g., "Write at least 100 characters" with live counter).
  - **AI coaching chat**: Chat interface. Dream Coach asks one question at a time. User responds with text or voice. Coach follows up with Socratic questions. Max 5 exchanges per coaching moment.
- **Bottom action bar**: "Save & Exit" (left), "Continue" or "Complete Activity" (right, primary button).

**Screen 3: Part completion celebration**

Research insight: Duolingo's celebratory animations increase session length. Asana's unicorn delights users. But Coursera's generic "Congratulations" feels empty. Celebrations must be **proportional and meaningful**.

Layout:
- Full-screen modal with Part-color gradient background.
- Large animated illustration (custom for each Part — e.g., Part 1: seed sprouting, Part 2: blueprint unfolding, Part 3: building rising, Part 4: rocket launching).
- Confetti particle animation (**500ms** burst, then gentle float for **3s**).
- "Part 2 Complete!" in display font.
- Personalized AI insight: "In this Part, you identified 12 skills and narrowed your focus to 3 core strengths. Most people never get this specific." (Specific to user's actual work, not generic.)
- Badge earned animation: badge icon zooms in with bounce (300ms spring).
- CTA: "Continue to Part 3" or "Share your progress".
- Shareable card auto-generated: shows Part completed, badge, user's dream statement. Optimized for Instagram Stories (9:16 ratio).

**Screen 4: AI coaching screen**

Research insight: Mark Manson's Purpose app succeeds because its AI has a distinct personality. Generic AI coaching feels like "a thin LLM wrapper." Dream Coach must have Simon Squibb's philosophy embedded.

Layout:
- Chat interface styled with Dream Planner rose theme.
- Dream Coach avatar: stylized illustration (warm, approachable, not robotic).
- Messages appear with typing indicator (3 dots animation) before each response.
- User input: text field at bottom + microphone icon for voice input.
- Quick-reply chips appear below coach messages when appropriate ("Yes, tell me more", "I'm not sure", "Skip this question").
- Coach messages can contain embedded interactive elements: slider ratings, multiple choice, even mini-activities within the chat flow.

### 2.4 Gamification system (evidence-based)

Based on Duolingo research and MemoryLab studies on abandonment:

**Streaks**: Flexible — "3 days this week" counts as maintaining streak (not daily-only). Streak freeze available (1 free per week, earn more through activity completion). Streak counter visible on home screen but not aggressive. **Never guilt-based notifications.**

**Progress rings**: 4 rings (one per Part), inspired by Apple Watch Activity Rings. Each ring fills as activities within that Part are completed. Visible on home screen. When all 4 rings are complete: special "Dream Achieved" animation.

**Badges**: 8 total — 4 for Part completions + 4 for behavioral milestones (First Recording from Dream Brain, 7-day streak, Helped Someone in Dream Place, First Purchase in Dream Store). Cross-service badges encourage ecosystem engagement.

**NO punitive mechanics**: No hearts, no lives, no penalties for missing days. No mandatory daily quotas. Research shows these drive anxiety and abandonment, especially in non-competitive personality types.

**Optional leaderboard**: Opt-in only. Small cohorts (8-12 people) rather than global leaderboards. Shows activity count, not quality — reduces judgment anxiety.

### 2.5 Anti-abandonment design (research-driven)

| Trigger | Response |
|---------|----------|
| 2 days inactive | Gentle push notification: "Your dream is patient, but it's waiting. 10 min?" |
| 5 days inactive | Email: weekly summary of progress + specific next activity preview |
| Error streak within activity | Difficulty adapts: simpler warm-up question + encouraging AI coach message |
| Completed Part (transition risk) | 24-hour "rest" before next Part unlocks. Teaser preview of what's ahead. |
| Mid-Part (activity 3 of 5) | Mid-Part check-in: "How are you feeling about [topic]?" + visible finish line |
| Return after long absence | Welcome-back screen celebrating what was done, not shaming what wasn't |

### 2.6 UX decisions grounded in competitor research

| Decision | Based on | Avoiding |
|----------|----------|----------|
| Visual journey path with 4 Parts × 5 activities | Duolingo's skill path drives 3x daily return rate | Coursera's invisible progress → 3% completion |
| Flexible weekly streaks (not daily) | Duolingo's streak works but daily creates anxiety | Duolingo's own guilt-based "don't let Duo down" |
| AI coaching with distinct personality | Mark Manson's Purpose app succeeds via voice/philosophy | Generic "thin LLM wrapper" coaching apps |
| Bite-sized activities (10-15 min each) | Duolingo: micro-lessons fit idle moments | Coursera: 2-hour video lectures feel like homework |
| Deferred registration + immediate first activity | Duolingo: users complete lesson 1 before signup | Headspace's 38% onboarding drop-off |
| Save everything automatically, always | Dreamfora's data loss bugs are the #1 complaint | Any app that lets user work disappear |
| Part-specific visual themes (color shifts) | Headspace's emotional design with distinct pack visuals | Monotone interfaces that blur all progress |
| Quick-reply chips in AI coaching | Reduces blank-screen anxiety in chat interfaces | Forcing users to always type (high cognitive load) |

---

## PART 3: DREAM PLACE — Global Co-Founder Matching

### 3.1 Brand identity

**Brand personality**: Trusted connector. Professional but human. The feeling of walking into a room where everyone shares your ambition and the introductions are already made.

**Primary color**: Ocean Blue `#2563EB` — extends HelpBnk's sky blue into a more confident, trustworthy direction. Blue is universally associated with trust in professional contexts.

```
/* DREAM PLACE COLOR TOKENS */
--dream-color-primary: #2563EB;           /* Blue 600 */
--dream-color-primary-light: #DBEAFE;     /* Blue 100 */
--dream-color-primary-lighter: #EFF6FF;   /* Blue 50 */
--dream-color-primary-dark: #1D4ED8;      /* Blue 700 */
--dream-color-primary-darker: #1E40AF;    /* Blue 800 */
--dream-color-on-primary: #FFFFFF;

--dream-color-secondary: #10B981;         /* Emerald 500 — for match/success indicators */
--dream-color-secondary-light: #D1FAE5;

--dream-color-accent: #F59E0B;            /* Amber — for premium/featured profiles */
--dream-color-accent-light: #FEF3C7;

--dream-color-surface: #FFFFFF;
--dream-color-surface-alt: #EFF6FF;       /* Very light blue tint */
--dream-color-background: #FAFAFA;

--dream-color-text-primary: #171717;
--dream-color-text-secondary: #525252;
--dream-color-text-tertiary: #A3A3A3;

/* MATCH SCORE GRADIENT */
--dream-match-high: #22C55E;    /* 80-100% */
--dream-match-medium: #F59E0B;  /* 50-79% */
--dream-match-low: #A3A3A3;     /* <50% — not shown by default */

/* VERIFICATION TIERS */
--dream-verified-1: #93C5FD;    /* Email verified — light blue */
--dream-verified-2: #3B82F6;    /* LinkedIn connected — medium blue */
--dream-verified-3: #1D4ED8;    /* Video verified — dark blue */
--dream-verified-4: #FFC300;    /* Community endorsed — gold */
```

### 3.2 Tone of voice

- **Confident but not corporate**: "Find your perfect co-founder" not "Leverage synergistic partnership opportunities"
- **Trust-first**: Every screen subtly reinforces safety. "Verified profile" badges prominent. "All conversations are private."
- **Action-oriented**: "Send an invite" not "Express interest." "Start a trial project" not "Explore collaboration potential."
- **Honest matching**: "87% match — here's why" with specific, transparent reasoning. Never mysterious "we found you a match."
- **Empty states**: "Your co-founder might be recording their first Dream Brain note right now. Set your preferences and we'll find them."

### 3.3 Key screens

**Screen 1: Match feed (home screen)**

Research insight: Shapr's "daily batch of 10-15 curated profiles" outperformed infinite scrolling for professional networking. Bumble's 24-hour expiry creates healthy urgency. YC Co-founder Matching's dating-app UX feels familiar. But CoFoundersLab's infinite low-quality matches destroy trust.

Layout (mobile):
- **Top bar**: Dream Place logo (blue). Center: "Your Matches" title. Right: filter icon + notification bell.
- **Daily match batch**: Not infinite scroll. **8-12 curated matches per day**, refreshed every 24 hours. Shown as a vertical feed of match cards.
- **Match card design** (the signature component):
  ```
  ┌──────────────────────────────────────────┐
  │  [Avatar 56px]  Name, Age, Location      │
  │                 "Building [dream]"        │
  │                 ⭐ Verified Level 3       │
  │                                          │
  │  ██████████████░░░  87% Match            │
  │                                          │
  │  Skills: [Design] [Marketing] [Korean]   │
  │  Looking for: [Technical Co-founder]     │
  │                                          │
  │  💬 "I want to build an EdTech platform  │
  │     that makes learning accessible..."   │
  │                                          │
  │  [Pass]              [Invite to Connect] │
  └──────────────────────────────────────────┘
  ```
- **Match percentage bar**: Horizontal bar with gradient fill (green for high scores). Tappable — reveals breakdown modal.
- **Bottom**: "See more matches tomorrow" when today's batch is exhausted. This creates anticipation, not frustration.

**Screen 2: Profile detail**

Layout:
- **Hero**: Full-width photo/video header (user can upload a 30-second intro video). Verification badge overlay.
- **Dream statement**: Large, prominent. "I'm building a sustainable fashion marketplace for Korean designers."
- **Match breakdown card**: Radar/spider chart showing 6 dimensions — Skills Complementarity, Vision Alignment, Work Style, Commitment Level, Industry Overlap, Location Compatibility. Overall score prominent.
- **About section**: Structured fields (not free-form):
  - "What I've built" (past accomplishments with specifics, YC-style)
  - "My superpower" (1 sentence)
  - "What I'm looking for in a co-founder" (structured tags + 2-sentence description)
  - "Biggest lesson learned" (builds credibility and humanity)
- **Portfolio/links**: GitHub, LinkedIn, portfolio URL, live projects. Rendered as preview cards (with meta image/title).
- **Activity indicators**: "Active 2 hours ago" · "Responds within 4 hours" · "3 trial projects completed"
- **Endorsements**: From past collaborators within Dream Hub (not self-declared). Each endorsement: avatar + name + relationship + short text.
- **CTA bar** (sticky bottom): "Pass" (outlined, left) · "Invite to Connect" (primary, right, blue).

**Screen 3: Match breakdown modal**

When users tap the match percentage:
- Full-screen bottom sheet.
- Overall score at top: "87% Compatible"
- 6 dimension scores, each with:
  - Dimension name + score bar + percentage
  - 1-sentence AI explanation: "Skills Complementarity: 92% — You bring design and branding. They bring full-stack engineering. Together you cover product + tech."
- "What you'd build together" section: AI-generated 2-sentence description of potential collaboration based on both profiles.
- This transparency directly addresses the Lunchclub complaint of opaque matching.

**Screen 4: Team formation dashboard**

Research insight: No current co-founder platform provides post-match team formation tools. This is the market gap.

Layout:
- Tabs: "My Connections" | "Active Projects" | "Team Builder"
- **Team Builder view**: Shows current team composition as a skills radar chart. Green areas = covered skills. Red areas = gaps. Below: "Suggested matches to fill [gap]" with mini match cards.
- **Trial Project card**: "Start a 2-week trial project" CTA. Creates a shared space with: task board (simple Kanban), shared notes, video call scheduling, daily check-in prompts. After 2 weeks: both parties rate the experience and decide to formalize or part ways.
- **Conversation view**: In-app messaging with built-in icebreaker prompts. First message MUST include a personalized reference (system requires minimum 20 characters and rejects obvious copy-paste like "Hey" or "Hi there"). AI suggests talking points based on shared interests.

### 3.4 Verification system (tiered)

```
Level 1 (Email): Auto on signup. Badge: outline circle.
Level 2 (LinkedIn): OAuth connect. Badge: half-filled circle.
Level 3 (Video): Record a 15-second selfie video saying your name. AI + human review. Badge: filled circle with checkmark.
Level 4 (Community): 3+ endorsements from Dream Hub users who've worked with you. Badge: gold star.
```

Each verification level is shown as a badge on the profile card. Higher verification = higher position in match feed. Users are nudged to verify progressively: "Complete Level 3 verification to appear in 2x more matches."

### 3.5 UX decisions grounded in competitor research

| Decision | Based on | Avoiding |
|----------|----------|----------|
| Daily curated batch (8-12) not infinite scroll | Shapr's daily batch drove intentional matching | LinkedIn's feed clutter and match fatigue |
| Double opt-in before messaging | YC CFM and Bumble: eliminates spam | LinkedIn's unsolicited recruiter messages |
| Transparent match score breakdown | Addresses Lunchclub's "no control over matching" | Black-box algorithms that erode trust |
| Mandatory personalized first message | YC CFM success stories cite personalized outreach | CoFoundersLab's bot-filled, low-effort messaging |
| Tiered verification with visible badges | Bumble's verification badges are a "currency of trust" | LinkedIn's weak identity verification |
| 2-week trial project feature | Addresses YC CFM's "9 months to find a match" problem | Immediate co-founder commitment without testing |
| On-platform collaboration tools | Prevents "migration off-platform" that killed Lunchclub | Lunchclub: all value happens after leaving app |
| One-click transparent cancellation | CoFoundersLab's cancellation scam = class action lawsuit | Any subscription opacity |
| LinkedIn profile import for onboarding | Shapr's proven approach: reduces friction dramatically | Long onboarding forms (Bumble's 17 pages) |

---

## PART 4: DREAM STORE — Story-Driven Marketplace

### 4.1 Brand identity

**Brand personality**: Magazine editor meets social impact. Curated, editorial, warm. Every product has a story worth telling, and the story matters more than the price tag.

**Primary color**: Sunflower Gold `#E5A100` — derived from the "What's Your Dream?" book's bright yellow but deepened for readability and warmth. Gold signals value, aspiration, and premium quality without being flashy.

```
/* DREAM STORE COLOR TOKENS */
--dream-color-primary: #E5A100;           /* Sunflower Gold */
--dream-color-primary-light: #FEF3C7;     /* Amber 100 */
--dream-color-primary-lighter: #FFFBEB;   /* Amber 50 */
--dream-color-primary-dark: #D97706;      /* Amber 600 */
--dream-color-primary-darker: #B45309;    /* Amber 700 */
--dream-color-on-primary: #171717;        /* Dark text on gold */

--dream-color-secondary: #1A1A2E;         /* Dark navy — editorial feel */
--dream-color-secondary-light: #374151;

--dream-color-accent: #E11D73;            /* Rose — for "support this dream" CTAs */
--dream-color-accent-light: #FCE7F3;

--dream-color-surface: #FFFFFF;
--dream-color-surface-alt: #FFFBEB;       /* Very light warm cream */
--dream-color-background: #FAFAF7;        /* Slightly warm white, like paper */

--dream-color-text-primary: #171717;
--dream-color-text-secondary: #525252;
--dream-color-text-tertiary: #A3A3A3;

/* EDITORIAL TYPOGRAPHY COLOR */
--dream-color-headline: #1A1A2E;          /* Dark navy for magazine-style headlines */

/* IMPACT COLORS */
--dream-impact-funded: #22C55E;           /* "Fully funded" green */
--dream-impact-progress: #E5A100;         /* Funding progress gold */
```

### 4.2 Tone of voice

- **Editorial/magazine**: Headlines are written like magazine features, not e-commerce labels. "Meet the woman turning Seoul's waste into wearable art" not "Upcycled earrings by seller #4521."
- **Story-first**: Every product description opens with the dreamer, not the product. "Jiyeon quit her corporate job to…" before "Handmade ceramic mug, 350ml."
- **Aspirational but grounded**: "Your purchase helps Jiyeon hire her first employee" not "Change the world with every purchase!"
- **Impact language**: "Supporting this dream" not "Add to cart." "Continue Jiyeon's story" not "Buy now."
- **Price transparency**: Prices visible early (avoiding Instagram Shopping's hidden-price complaint). "₩32,000 — ₩18,000 goes directly to the dreamer."
- **Empty cart**: "Your bag is empty, but it doesn't have to be. Every item here was born from a dream."

### 4.3 Key screens

**Screen 1: Discovery feed (home — magazine-style)**

Research insight: Instagram Shopping fails because it "feels like 5 different apps." Etsy's search-first approach makes discovery feel transactional. Kickstarter's story-first browsing creates emotional investment. The Dream Store homepage should feel like **opening a curated magazine**, not browsing a product catalog.

Layout (mobile):
- **Top bar**: Dream Store logo (gold). Right: search icon + cart icon (with badge count).
- **Hero story**: Full-width editorial card (aspect ratio 4:5). High-quality lifestyle photo fills the card. Overlay at bottom: dreamer's name, dream statement (max 2 lines), and "Read their story →" link. This is NOT a product ad — it's a story feature. Rotates daily.
- **Section: "Dreams in progress"**: Horizontal scroll of story cards (280px wide). Each card: portrait photo of the dreamer (top 60%), their dream in bold (max 2 lines), funding progress bar, "₩X raised of ₩Y goal." Tapping opens full story page.
- **Section: "Born from dreams"**: Product grid (2 columns). Each product card:
  ```
  ┌─────────────────────┐
  │                     │
  │   [Product Photo]   │  (Square, 1:1 ratio)
  │                     │
  │  Dreamer avatar + name (small, left-aligned)
  │  Product title (16px, bold, max 2 lines)
  │  ₩32,000            (14px, gold)
  │  "From Jiyeon's dream" (12px, tertiary)
  └─────────────────────┘
  ```
- **Section: "Collections"**: Curated editorial collections like "First-time dreamers", "Made in Seoul", "Digital products." Shown as wide cards with editorial photography and serif-style titles.
- **No infinite scroll on home**: Deliberately limited. 1 hero + 3-4 sections. "Explore all stories" button at bottom leads to full browse.

**Screen 2: Dreamer story page (the signature experience)**

Research insight: Kickstarter's story-first page structure works. GoFundMe's update-driven engagement keeps donors invested. Shopify's Narrative theme proves story-commerce converts **32% higher**. Story MUST come before product.

Layout:
- **Hero**: Full-width video or photo (16:9). Auto-play muted video if available. Parallax scroll effect.
- **Dreamer info bar**: Avatar (56px) + Name + Verification badge + Location + "Following" button. Dream statement in italic.
- **Story section** (editorial long-form):
  - Structured with subheadings, pull quotes, and inline photos.
  - Guided format: "The Dream" → "The Journey" → "Where They Are Now" → "How You Can Help"
  - Minimum: 300 words + 3 images. This is a curated editorial piece, not a product description.
  - Written by the dreamer with AI writing assistance (similar to GoFundMe's "Enhance" feature).
- **Products section** (appears AFTER story, never before):
  - Header: "Support [Name]'s dream"
  - Product cards in 2-column grid. Each shows: photo, title, price, "Support this dream" button.
  - Product cards use the `accent` color (rose) for CTA buttons — differentiating "buy" from navigation.
- **Impact metrics**: "₩2.4M raised · 156 supporters · 3 months since launch"
- **Updates feed**: Chronological updates from the dreamer (like Kickstarter updates). "New batch of ceramics fired today! 🔥" with photo/video.
- **Community section**: Supporter comments and encouragement messages.

**Screen 3: Product detail**

Layout:
- **Image gallery**: Horizontal swipeable gallery (full-width photos). Dot indicators. Zoom on tap.
- **Mini dreamer card**: Small card with avatar + name + "Read their story" link. Always visible — never orphan a product from its dreamer.
- **Product info**: Title (h2), Price (h3, gold), Description (body text), Specifications (collapsible), Shipping info (collapsible).
- **Impact callout card** (rose accent background): "₩18,000 of your ₩32,000 goes directly to Jiyeon. Here's how it helps: [specific impact statement]."
- **CTA bar** (sticky bottom): "Support this Dream — ₩32,000" (full-width primary button, rose accent color). Not "Add to Cart."
- **Social proof**: "156 people are supporting this dream" + recent supporter avatars.

**Screen 4: Checkout (emotion-preserving)**

Research insight: **70% cart abandonment rate** globally, **75-85% on mobile**. **48%** abandon due to surprise fees. **25%** abandon because of forced account creation. Checkout must be fast AND maintain emotional connection.

Layout:
- **Order summary**: Product thumbnail + title + "From [Dreamer Name]'s dream" subtitle. Not cold SKU listing.
- **Impact recap**: Small card: "Your purchase supports [Dreamer]'s dream of [dream statement]."
- **Shipping**: Pre-filled from Dream ID. Edit inline. Show estimated delivery date prominently.
- **Payment**: KakaoPay (primary for Korean market), Credit Card, Apple Pay, Google Pay. BNPL option for items over ₩50,000.
- **Price breakdown**: All fees visible upfront (product + shipping + tax). No surprises. Total prominent.
- **Guest checkout available**: "Continue as guest" option. Dream ID login optional but incentivized ("Save 5% as a Dream Hub member").
- **CTA**: "Complete — Support [Name]'s Dream" (not "Place Order").

**Post-purchase confirmation**:
- Full-screen celebratory moment.
- "You just supported [Dreamer Name]! 🎉"
- Impact statement: "You're their 157th supporter. Together, supporters have helped raise ₩2.4M toward their dream."
- Option to follow the dreamer for updates.
- Shareable card for social media.

### 4.4 UX decisions grounded in competitor research

| Decision | Based on | Avoiding |
|----------|----------|----------|
| Magazine-style editorial home, not product grid | Kickstarter + Shopify Narrative: story-first converts 32% higher | Etsy's search-first transactional feel |
| Story page before product listing | GoFundMe: emotional connection drives action | Instagram Shopping: product tags with no context |
| "Support this Dream" not "Add to Cart" | GoFundMe's impact language drives donations | Cold e-commerce transaction language |
| Dreamer info always visible on product pages | Etsy: 35% of buyers connect with seller stories | NOTHS: sellers invisible behind platform brand |
| All prices visible from discovery | Users hate hidden prices (Instagram Shopping complaint) | Any delayed price reveal |
| Impact breakdown showing exactly where money goes | GoFundMe transparency drives trust | Vague "portion goes to creator" claims |
| Guest checkout + KakaoPay primary | 25% abandon due to forced signup; Korean market needs KakaoPay | Forced account creation at checkout |
| Updates feed on dreamer pages | GoFundMe: campaigns with 70+ updates raise more | Static seller pages that never change |
| Platform buyer protection prominently displayed | #1 failure across Etsy/NOTHS/Patreon: no platform intervention | Marketplace as "middleman without muscle" |
| Curated editorial collections, not algorithm-only | NOTHS's occasion-based curation works for gift-oriented shopping | Pure algorithm-driven feeds (Instagram) |

---

## PART 5: CROSS-SERVICE INTEGRATION POINTS

### 5.1 Dream ID profile structure

```json
{
  "dreamId": "uuid",
  "name": "string",
  "avatar": "url",
  "dreamStatement": "string (max 280 chars)",
  "location": { "city": "string", "country": "string" },
  "language": ["ko", "en"],
  "verificationLevel": 1-4,
  "linkedServices": {
    "dreamBrain": { "noteCount": 142, "activeSince": "2025-03-15" },
    "dreamPlanner": { "currentPart": 3, "completedActivities": 14 },
    "dreamPlace": { "connectionsCount": 8, "trialProjects": 2 },
    "dreamStore": { "isCreator": true, "supportersCount": 156 }
  }
}
```

### 5.2 Cross-service interaction flows

- **Dream Brain → Dream Planner**: Voice note tagged as "Action Item" can be sent to Dream Planner with one tap, creating a Kanban card in the user's active project board.
- **Dream Planner → Dream Place**: Completing Part 3 ("Build") unlocks a prompt: "Ready to find a co-founder? Your Dream Place profile has been enriched with your planner insights."
- **Dream Place → Dream Store**: Teams formed in Dream Place can launch products in Dream Store. Team formation dashboard has "Launch in Dream Store" CTA.
- **Dream Store → Dream Brain**: Dreamer's story in Dream Store can pull quotes and insights from their Dream Brain recordings (with permission), adding authentic voice to their story.

### 5.3 Responsive breakpoints

```css
/* Mobile-first */
--dream-bp-sm: 640px;   /* Small tablets */
--dream-bp-md: 768px;   /* Tablets */
--dream-bp-lg: 1024px;  /* Small desktops */
--dream-bp-xl: 1280px;  /* Standard desktops */
--dream-bp-2xl: 1536px; /* Large screens */
```

Mobile (default): Single column, bottom tab navigation, full-width cards.
Tablet (768px+): 2-column layouts, sidebar navigation option.
Desktop (1024px+): Max content width 1200px, centered. Left sidebar navigation (240px). Multi-column grids expand (3-4 columns for product grids, 2-column for story layouts).

### 5.4 Accessibility requirements (global)

- WCAG 2.1 AA minimum across all services.
- Color contrast: **4.5:1** for body text, **3:1** for large text and interactive elements.
- All match percentages, verification levels, and progress indicators use color + icon + label (never color alone).
- Touch targets: minimum **44px × 44px**.
- Screen reader support: all images have descriptive alt text; interactive elements have ARIA labels.
- Reduced motion mode: all animations respect `prefers-reduced-motion: reduce`.
- Korean and English full localization with string externalization.

### 5.5 Dark mode tokens (shared)

```css
[data-theme="dark"] {
  --dream-neutral-50: #171717;
  --dream-neutral-100: #262626;
  --dream-neutral-200: #404040;
  --dream-neutral-800: #E5E5E5;
  --dream-neutral-900: #FAFAFA;
  --dream-color-surface: #1A1A2E;
  --dream-color-background: #0F0F1A;
  --dream-color-text-primary: #FAFAFA;
  --dream-color-text-secondary: #A3A3A3;
  /* Service primary colors remain the same but surfaces invert */
}
```

---

## PART 6: CROSS-SERVICE SHARED SCREENS — Chat, Notification, RTL, Onboarding

> 이 섹션은 4개 서비스 공통으로 사용되는 화면 스펙입니다. PART 0의 공유 디자인 토큰 위에서 동작합니다.

---

### 6.1 통합 채팅 시스템 UI (Cross-Service Chat)

#### 6.1.1 채팅의 역할 — 서비스별 맥락

채팅은 Dream Place(코파운더 매칭)에서 가장 핵심이지만, 모든 서비스에서 사용됩니다.

| 서비스 | 채팅 용도 | 특수 기능 |
|--------|----------|----------|
| Dream Place | 코파운더 매칭 후 1:1 대화, 팀 그룹채팅 | 아이스브레이커 프롬프트, 실시간 번역, 프로필 미니카드 |
| Dream Store | 구매자-크리에이터 소통 | 주문 참조 카드, 상품 공유 카드 |
| Dream Planner | AI 코치 대화 | AI 응답 스타일링, 퀵리플라이 칩, 인터랙티브 위젯 |
| Dream Cafe | 도어벨 매칭 후 대화 | 위치 공유, 만남 예약 카드 |

#### 6.1.2 채팅 화면 레이아웃

#### 대화 목록 화면 (Conversations List)

```
┌──────────────────────────────────────┐
│ [←]  메시지          [🔍] [새 대화]  │  ← 상단 바 (56px)
├──────────────────────────────────────┤
│ ┌─[필터 칩]──────────────────────┐   │
│ │ [전체] [Place] [Store] [Coach] │   │  ← 서비스별 필터
│ └────────────────────────────────┘   │
│                                      │
│ ┌────────────────────────────────┐   │
│ │ 🟢 [Avatar] 김지연             │   │  ← 온라인 표시 (초록 점)
│ │    87% 매치 · Dream Place      │   │  ← 출처 서비스 태그
│ │    "네, 내일 오후에 시간이..."  │   │  ← 마지막 메시지 미리보기
│ │                     오후 2:30  │   │  ← 시간 + 안 읽은 배지
│ └────────────────────────────────┘   │
│ ┌────────────────────────────────┐   │
│ │ 🤖 [AI Avatar] Dream Coach     │   │  ← AI 코치 대화 (보라색 테두리)
│ │    Dream Planner               │   │
│ │    "다음 활동으로 넘어갈까..."  │   │
│ │                     오전 9:15  │   │
│ └────────────────────────────────┘   │
│                                      │
│ (스크롤...)                          │
├──────────────────────────────────────┤
│ 🏠  👥  💬  🔔  👤                  │  ← 하단 탭바
└──────────────────────────────────────┘
```

**대화 카드 컴포넌트:**
```css
.conversation-card {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  border-bottom: 1px solid var(--dream-neutral-100);
  transition: background var(--dream-transition-fast);
}
.conversation-card:active {
  background: var(--dream-neutral-50);
}
.conversation-card__avatar {
  width: 48px;
  height: 48px;
  border-radius: var(--dream-radius-full);
  position: relative;  /* 온라인 표시용 */
}
.conversation-card__online-dot {
  width: 12px;
  height: 12px;
  background: var(--dream-success);
  border: 2px solid white;
  border-radius: 50%;
  position: absolute;
  bottom: 0;
  right: 0;
}
.conversation-card__source-tag {
  font: var(--dream-text-overline);
  padding: 2px 6px;
  border-radius: var(--dream-radius-full);
  /* 서비스별 색상 */
}
.conversation-card__source-tag--place { background: #DBEAFE; color: #2563EB; }
.conversation-card__source-tag--store { background: #FEF3C7; color: #E5A100; }
.conversation-card__source-tag--planner { background: #FCE7F3; color: #E11D73; }
.conversation-card__source-tag--brain { background: #EDE9FE; color: #7C3AED; }

.conversation-card__unread-badge {
  min-width: 20px;
  height: 20px;
  background: var(--dream-error);
  color: white;
  border-radius: var(--dream-radius-full);
  font: 600 11px/20px var(--dream-font-primary);
  text-align: center;
  padding: 0 6px;
}
```

#### 1:1 대화 화면 (Chat Room)

```
┌──────────────────────────────────────┐
│ [←] [Avatar] 김지연   [📞][⋮]       │  ← 상단: 뒤로, 상대 정보, 통화/메뉴
│      87% 매치 · 온라인               │  ← 매치율 + 상태
├──────────────────────────────────────┤
│                                      │
│        ── 2월 14일 금요일 ──         │  ← 날짜 구분선
│                                      │
│  ┌─────────────────────────┐         │
│  │ 안녕하세요! 프로필 보고  │         │  ← 상대 메시지 (왼쪽, 회색 배경)
│  │ 연락드립니다. AI 스타트  │         │
│  │ 업에 관심이 많으시더라고요│         │
│  └─────────────────────────┘         │
│  오후 2:15 · 🌐 번역 보기           │  ← 시간 + 번역 토글
│                                      │
│         ┌─────────────────────────┐  │
│         │ 네! 반갑습니다. 저도    │  │  ← 내 메시지 (오른쪽, 서비스 컬러)
│         │ 지연님 프로필 보고      │  │
│         │ 인상 깊었어요           │  │
│         └─────────────────────────┘  │
│                    오후 2:18 ✓✓      │  ← 읽음 표시
│                                      │
│  ┌──[프로필 미니카드]────────┐       │
│  │ 💡 지연님의 프로젝트       │       │  ← 시스템 카드 (자동 생성)
│  │ "AI 기반 교육 플랫폼"     │       │
│  │ [프로필 보기]              │       │
│  └───────────────────────────┘       │
│                                      │
├──────────────────────────────────────┤
│ ┌─[아이스브레이커]───────────────┐   │  ← 첫 대화 시에만 표시
│ │ 💬 "어떤 문제를 해결하고 싶으세요?"│
│ │ 💬 "팀에서 어떤 역할을 선호하세요?"│
│ └────────────────────────────────┘   │
├──────────────────────────────────────┤
│ [+] │ 메시지를 입력하세요...  │ [🎙] │  ← 입력 바
└──────────────────────────────────────┘
```

#### 6.1.3 메시지 버블 컴포넌트

```css
/* 상대방 메시지 */
.message-bubble--received {
  max-width: 75%;
  padding: 10px 14px;
  border-radius: 4px 16px 16px 16px;  /* 꼬리 왼쪽 위 */
  background: var(--dream-neutral-100);
  color: var(--dream-color-text-primary);
  font: var(--dream-text-body);
  margin-left: 8px;
  align-self: flex-start;
}

/* 내 메시지 — 서비스별 색상 적용 */
.message-bubble--sent {
  max-width: 75%;
  padding: 10px 14px;
  border-radius: 16px 4px 16px 16px;  /* 꼬리 오른쪽 위 */
  background: var(--dream-color-primary);
  color: var(--dream-color-on-primary);
  font: var(--dream-text-body);
  margin-right: 8px;
  align-self: flex-end;
}

/* 시스템 카드 (프로필 미니카드, 주문 참조 등) */
.message-card--system {
  max-width: 85%;
  padding: 12px;
  border-radius: var(--dream-radius-lg);
  background: var(--dream-color-surface);
  border: 1px solid var(--dream-neutral-200);
  box-shadow: var(--dream-shadow-sm);
  align-self: center;
  margin: 8px 0;
}

/* 날짜 구분선 */
.message-date-divider {
  text-align: center;
  font: var(--dream-text-caption);
  color: var(--dream-neutral-400);
  padding: 16px 0;
  display: flex;
  align-items: center;
  gap: 12px;
}
.message-date-divider::before,
.message-date-divider::after {
  content: '';
  flex: 1;
  height: 1px;
  background: var(--dream-neutral-200);
}

/* 읽음 표시 */
.message-status--sent { color: var(--dream-neutral-400); }    /* ✓ 전송됨 */
.message-status--delivered { color: var(--dream-neutral-400); } /* ✓✓ 도착 */
.message-status--read { color: var(--dream-color-primary); }   /* ✓✓ 읽음 (컬러) */
```

#### 6.1.4 실시간 자동 번역 UX

Dream Hub는 글로벌 플랫폼이므로 채팅에서 실시간 번역이 핵심 기능입니다.

**번역 UX 플로우:**
1. 상대방이 메시지를 보냄 (예: 한국어)
2. 수신자의 설정 언어와 다르면, 메시지 아래에 "🌐 번역 보기" 링크 표시
3. 탭하면 원문 아래에 번역문이 슬라이드 다운 (200ms ease)
4. 번역문은 약간 작은 폰트 (14px) + 기울임꼴 + 보조 텍스트 색상
5. "자동 번역" 토글을 ON하면 모든 메시지가 자동 번역 표시

```css
.message-translation {
  margin-top: 6px;
  padding-top: 6px;
  border-top: 1px dashed var(--dream-neutral-200);
  font: italic var(--dream-text-body-sm);
  color: var(--dream-color-text-secondary);
}
.message-translation__label {
  font: var(--dream-text-caption);
  color: var(--dream-color-text-tertiary);
}
/* "🌐 번역 보기" 토글 링크 */
.message-translate-toggle {
  font: var(--dream-text-caption);
  color: var(--dream-color-primary);
  cursor: pointer;
  margin-top: 4px;
}
```

#### 6.1.5 AI 코치 채팅 (Dream Planner 전용)

AI 코치와의 대화는 일반 채팅과 시각적으로 구분됩니다.

```css
/* AI 코치 메시지 — 보라색 계열 강조 */
.message-bubble--ai-coach {
  max-width: 85%;
  padding: 14px 16px;
  border-radius: 4px 16px 16px 16px;
  background: var(--dream-color-surface-alt);  /* 연한 핑크/보라 틴트 */
  border-left: 3px solid var(--dream-color-primary);  /* 서비스 컬러 왼쪽 바 */
  color: var(--dream-color-text-primary);
}
.message-bubble--ai-coach::before {
  content: '✨';
  margin-right: 6px;
}

/* 퀵 리플라이 칩 */
.quick-reply-container {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  padding: 8px 16px;
  overflow-x: auto;
}
.quick-reply-chip {
  height: 36px;
  padding: 0 16px;
  border-radius: var(--dream-radius-full);
  border: 1.5px solid var(--dream-color-primary);
  background: transparent;
  color: var(--dream-color-primary);
  font: 500 14px/36px var(--dream-font-primary);
  white-space: nowrap;
  cursor: pointer;
  transition: all var(--dream-transition-fast);
}
.quick-reply-chip:active {
  background: var(--dream-color-primary);
  color: var(--dream-color-on-primary);
}

/* AI 타이핑 인디케이터 */
.ai-typing-indicator {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 12px 16px;
}
.ai-typing-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--dream-neutral-400);
  animation: typing-bounce 1.2s ease-in-out infinite;
}
.ai-typing-dot:nth-child(2) { animation-delay: 0.2s; }
.ai-typing-dot:nth-child(3) { animation-delay: 0.4s; }
@keyframes typing-bounce {
  0%, 60%, 100% { transform: translateY(0); }
  30% { transform: translateY(-6px); }
}
```

#### 6.1.6 채팅 입력 바

```css
.chat-input-bar {
  display: flex;
  align-items: flex-end;
  gap: 8px;
  padding: 8px 12px;
  border-top: 1px solid var(--dream-neutral-200);
  background: var(--dream-color-surface);
  /* safe area 고려 */
  padding-bottom: calc(8px + env(safe-area-inset-bottom));
}

.chat-input-field {
  flex: 1;
  min-height: 40px;
  max-height: 120px;  /* 최대 ~5줄 */
  padding: 10px 16px;
  border-radius: 20px;
  border: 1px solid var(--dream-neutral-300);
  font: var(--dream-text-body);
  resize: none;
  overflow-y: auto;
  background: var(--dream-neutral-50);
}
.chat-input-field:focus {
  border-color: var(--dream-color-primary);
  box-shadow: 0 0 0 3px var(--dream-color-primary-light);
  background: var(--dream-color-surface);
}

/* 첨부(+) 버튼 */
.chat-attach-btn {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: var(--dream-neutral-100);
  color: var(--dream-neutral-600);
}

/* 전송/음성 버튼 — 입력 여부에 따라 전환 */
.chat-send-btn {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: var(--dream-color-primary);
  color: white;
  transition: all var(--dream-transition-fast);
}
.chat-send-btn--voice {
  background: transparent;
  color: var(--dream-color-primary);
}
```

#### 6.1.7 첨부 메뉴 (+ 버튼 탭 시)

바텀 시트로 열리는 첨부 옵션:

| 아이콘 | 라벨 | 기능 |
|--------|------|------|
| 📷 | 사진/동영상 | 갤러리에서 선택 |
| 📁 | 파일 | 문서, PDF 등 첨부 |
| 📍 | 위치 | 만남 장소 공유 (Dream Cafe 연계) |
| 👤 | 프로필 공유 | Dream Place 프로필 카드 전송 |
| 🛍️ | 상품 공유 | Dream Store 상품 카드 전송 |
| 📊 | 프로젝트 공유 | 트라이얼 프로젝트 초대 카드 |

#### 6.1.8 그룹 채팅 (팀 채팅)

Dream Place에서 팀이 구성되면 자동 생성되는 그룹 채팅방:
- 상단 바: 팀 이름 + 멤버 아바타 (최대 4개 표시 + "+N")
- 메시지마다 발신자 아바타 + 이름 표시 (1:1과 다른 점)
- 팀 설정: 팀 이름 변경, 멤버 초대/제거, 알림 설정
- 고정 메시지: 중요 메시지 상단 고정 기능

---

### 6.2 통합 알림 센터 UI (Notification Center)

#### 6.2.1 알림 유형 분류

```
/* 알림 카테고리 */
NOTIFICATION_TYPES = {
  // Dream Place 알림
  MATCH_NEW: { icon: '💫', color: '--dream-place-primary', priority: 'HIGH' },
  MATCH_ACCEPTED: { icon: '🤝', color: '--dream-success', priority: 'HIGH' },
  CONNECTION_REQUEST: { icon: '🔔', color: '--dream-place-primary', priority: 'HIGH' },
  TEAM_INVITE: { icon: '👥', color: '--dream-place-primary', priority: 'HIGH' },
  TRIAL_PROJECT_UPDATE: { icon: '📋', color: '--dream-info', priority: 'MEDIUM' },

  // Dream Planner 알림
  STREAK_REMINDER: { icon: '🔥', color: '--dream-streak-active', priority: 'MEDIUM' },
  PART_COMPLETE: { icon: '🎉', color: '--dream-planner-primary', priority: 'HIGH' },
  AI_COACH_NUDGE: { icon: '💬', color: '--dream-planner-primary', priority: 'LOW' },
  BADGE_EARNED: { icon: '🏅', color: '--dream-xp-gold', priority: 'MEDIUM' },

  // Dream Brain 알림
  INSIGHT_READY: { icon: '🧠', color: '--dream-brain-primary', priority: 'MEDIUM' },
  WEEKLY_REPORT: { icon: '📊', color: '--dream-brain-primary', priority: 'LOW' },
  RELATED_THOUGHT: { icon: '🔗', color: '--dream-brain-primary', priority: 'LOW' },

  // Dream Store 알림
  ORDER_UPDATE: { icon: '📦', color: '--dream-store-primary', priority: 'HIGH' },
  DREAMER_UPDATE: { icon: '📝', color: '--dream-store-primary', priority: 'MEDIUM' },
  NEW_SUPPORTER: { icon: '❤️', color: '--dream-store-accent', priority: 'HIGH' },
  MILESTONE_REACHED: { icon: '🎯', color: '--dream-success', priority: 'HIGH' },

  // 시스템 알림
  SYSTEM_UPDATE: { icon: '⚙️', color: '--dream-neutral-500', priority: 'LOW' },
  SECURITY_ALERT: { icon: '🔒', color: '--dream-error', priority: 'CRITICAL' },
}
```

#### 6.2.2 알림 센터 화면

```
┌──────────────────────────────────────┐
│ [←]  알림                   [⚙️설정] │  ← 상단 바
├──────────────────────────────────────┤
│ ┌─[필터 탭]──────────────────────┐   │
│ │ [전체(12)] [Place] [Planner]   │   │  ← 서비스별 필터 + 안 읽은 수
│ │ [Brain] [Store]                │   │
│ └────────────────────────────────┘   │
│                                      │
│  ── 오늘 ──                          │  ← 시간 구분
│                                      │
│ ┌────────────────────────────────┐   │
│ │ 💫 새로운 매치가 도착했어요!   │   │  ← HIGH 알림 (왼쪽 컬러 바)
│ │ │  김지연님과 87% 매치          │   │
│ │ │  "AI 기반 교육 플랫폼"       │   │
│ │ │  [프로필 보기] [패스]         │   │  ← 인라인 액션 버튼
│ │    3시간 전 · Dream Place      │   │
│ └────────────────────────────────┘   │
│                                      │
│ ┌────────────────────────────────┐   │
│ │ 🔥 연속 기록 7일째!           │   │  ← MEDIUM (하이라이트 배경 없음)
│ │    오늘도 플래너를 열어볼까요?  │   │
│ │    9시간 전 · Dream Planner    │   │
│ └────────────────────────────────┘   │
│                                      │
│  ── 어제 ──                          │
│                                      │
│ ┌────────────────────────────────┐   │
│ │ 📦 주문 배송이 시작되었어요   │   │
│ │ │  지연님의 핸드메이드 머그컵  │   │
│ │ │  [배송 추적]                 │   │
│ │    어제 오후 5:30 · Dream Store│   │
│ └────────────────────────────────┘   │
│                                      │
│ (스크롤...)                          │
└──────────────────────────────────────┘
```

#### 6.2.3 알림 카드 컴포넌트

```css
.notification-card {
  display: flex;
  gap: 12px;
  padding: 14px 16px;
  border-bottom: 1px solid var(--dream-neutral-100);
  transition: background var(--dream-transition-fast);
  position: relative;
}

/* 안 읽은 알림 */
.notification-card--unread {
  background: var(--dream-neutral-50);
}
.notification-card--unread::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 3px;
  background: var(--dream-color-primary);  /* 서비스 컬러 */
  border-radius: 0 2px 2px 0;
}

/* HIGH 우선순위 알림 — 인라인 액션 버튼 포함 */
.notification-card--high {
  background: var(--dream-color-primary-lighter);
}

.notification-card__icon {
  width: 40px;
  height: 40px;
  border-radius: var(--dream-radius-md);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  flex-shrink: 0;
  /* 배경색은 알림 타입에 따라 동적 */
}

.notification-card__body {
  flex: 1;
}
.notification-card__title {
  font: 600 15px/1.4 var(--dream-font-primary);
  color: var(--dream-color-text-primary);
}
.notification-card__desc {
  font: var(--dream-text-body-sm);
  color: var(--dream-color-text-secondary);
  margin-top: 2px;
}
.notification-card__meta {
  font: var(--dream-text-caption);
  color: var(--dream-color-text-tertiary);
  margin-top: 6px;
}
.notification-card__source {
  font: var(--dream-text-overline);
  padding: 2px 6px;
  border-radius: var(--dream-radius-full);
  /* 서비스별 배경/글자 색상 (채팅의 source-tag와 동일) */
}

/* 인라인 액션 버튼 */
.notification-actions {
  display: flex;
  gap: 8px;
  margin-top: 10px;
}
.notification-action-btn {
  height: 32px;
  padding: 0 14px;
  border-radius: var(--dream-radius-full);
  font: 500 13px/32px var(--dream-font-primary);
}
.notification-action-btn--primary {
  background: var(--dream-color-primary);
  color: var(--dream-color-on-primary);
}
.notification-action-btn--secondary {
  background: transparent;
  color: var(--dream-color-text-secondary);
  border: 1px solid var(--dream-neutral-300);
}
```

#### 6.2.4 푸시 알림 디자인

```
┌─ 푸시 알림 (iOS/Android) ─────────────────┐
│ [Dream Hub 로고]  Dream Place              │
│                                            │
│ 💫 새로운 매치! 김지연님과 87% 매치        │
│ "AI 기반 교육 플랫폼을 함께 만들 코파..."  │
│                                            │
│ [프로필 보기]  [나중에]                     │  ← 액셔너블 푸시
└────────────────────────────────────────────┘
```

**푸시 알림 규칙:**
- CRITICAL: 즉시 발송 (보안 알림)
- HIGH: 즉시 발송, 사운드 + 진동
- MEDIUM: 발송하되 조용히 (배지만 업데이트)
- LOW: 하루 1번 다이제스트로 묶어서 발송 (아침 9시 사용자 시간대 기준)
- 사용자가 앱 사용 중이면 인앱 토스트로 표시 (푸시 대신)
- 22시~8시 방해금지 (CRITICAL 제외)

#### 6.2.5 알림 설정 화면

```
┌──────────────────────────────────────┐
│ [←]  알림 설정                       │
├──────────────────────────────────────┤
│                                      │
│ 📱 푸시 알림                  [🟢]  │  ← 마스터 토글
│                                      │
│ ── Dream Place ──                    │
│ 새로운 매치                   [🟢]  │
│ 연결 요청                     [🟢]  │
│ 메시지                        [🟢]  │
│ 팀 업데이트                   [🟢]  │
│                                      │
│ ── Dream Planner ──                  │
│ AI 코치 알림                  [🟢]  │
│ 스트릭 리마인더               [🟢]  │
│ 파트 완료 축하                [🟢]  │
│                                      │
│ ── Dream Brain ──                    │
│ 인사이트 알림                 [🟢]  │
│ 주간 리포트                   [🟡]  │  ← 다이제스트만
│                                      │
│ ── Dream Store ──                    │
│ 주문 업데이트                 [🟢]  │
│ 드리머 소식                   [🟡]  │
│ 새 서포터                     [🟢]  │
│                                      │
│ ⏰ 방해금지 시간                     │
│ 오후 10시 ~ 오전 8시          [🟢]  │
│                                      │
│ 📊 다이제스트 발송 시간              │
│ 매일 오전 9:00                [>]   │
│                                      │
└──────────────────────────────────────┘
```

#### 6.2.6 인앱 토스트 알림

앱 사용 중 도착하는 실시간 알림:

```css
.in-app-toast {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 9999;
  padding: calc(env(safe-area-inset-top) + 8px) 16px 8px;
  background: var(--dream-color-surface);
  box-shadow: var(--dream-shadow-lg);
  border-bottom: 1px solid var(--dream-neutral-200);
  /* 슬라이드 다운 애니메이션 */
  animation: toast-slide-in 300ms cubic-bezier(0.4, 0, 0.2, 1);
  /* 4초 후 자동 슬라이드 업 */
}
@keyframes toast-slide-in {
  from { transform: translateY(-100%); }
  to { transform: translateY(0); }
}

/* 탭하면 해당 화면으로 이동, 위로 스와이프하면 닫기 */
```

#### 6.2.7 알림 뱃지 시스템

하단 탭바 아이콘 위에 표시되는 알림 뱃지:

```css
.tab-badge {
  position: absolute;
  top: 2px;
  right: -4px;
  min-width: 16px;
  height: 16px;
  background: var(--dream-error);
  color: white;
  font: 600 10px/16px var(--dream-font-primary);
  border-radius: var(--dream-radius-full);
  text-align: center;
  padding: 0 4px;
  border: 2px solid var(--dream-color-surface);  /* 배경과 분리 */
}
/* 99+ 일 때 */
.tab-badge--overflow::after {
  content: '99+';
}
```

---

### 6.3 아랍어 RTL 및 7개 언어 국제화 레이아웃

#### 6.3.1 지원 언어 목록 및 특성

| 언어 | 코드 | 방향 | 서체 고려사항 |
|------|------|------|-------------|
| 한국어 | ko | LTR | Pretendard (기본) |
| 영어 | en | LTR | Inter (라틴 폴백) |
| 일본어 | ja | LTR | Noto Sans JP (가나+한자) |
| 중국어 간체 | zh-CN | LTR | Noto Sans SC |
| 스페인어 | es | LTR | Inter |
| 프랑스어 | fr | LTR | Inter |
| 아랍어 | ar | **RTL** | Noto Sans Arabic |

#### 6.3.2 RTL 레이아웃 시스템

**핵심 원칙: Logical Properties 사용**

CSS의 물리적 속성(left/right) 대신 논리적 속성(start/end)을 사용해야 RTL에서 자동 미러링됩니다.

```css
/* ❌ 절대 사용하지 말 것 (RTL에서 깨짐) */
.bad-example {
  margin-left: 16px;
  padding-right: 24px;
  text-align: left;
  float: left;
  border-left: 3px solid blue;
}

/* ✅ 항상 이렇게 사용 (LTR/RTL 자동 대응) */
.good-example {
  margin-inline-start: 16px;
  padding-inline-end: 24px;
  text-align: start;
  float: inline-start;
  border-inline-start: 3px solid blue;
}
```

**물리적 → 논리적 속성 변환 매핑:**

```css
/* Margin */
margin-left    → margin-inline-start
margin-right   → margin-inline-end

/* Padding */
padding-left   → padding-inline-start
padding-right  → padding-inline-end

/* Border */
border-left    → border-inline-start
border-right   → border-inline-end

/* Position */
left           → inset-inline-start
right          → inset-inline-end

/* Text */
text-align: left  → text-align: start
text-align: right → text-align: end

/* Border Radius (RTL에서 수동 미러링 필요) */
border-radius: 4px 16px 16px 16px  /* LTR 채팅 버블 */
[dir="rtl"] border-radius: 16px 4px 16px 16px  /* RTL 미러링 */
```

#### 6.3.3 RTL 미러링이 필요한 컴포넌트

#### 채팅 버블 (가장 중요)

```css
/* LTR: 상대방 왼쪽, 내가 오른쪽 */
/* RTL: 상대방 오른쪽, 내가 왼쪽 — flexbox direction으로 자동 처리 */

.chat-messages {
  display: flex;
  flex-direction: column;
}
.message-bubble--received {
  align-self: flex-start;   /* LTR=왼쪽, RTL=오른쪽 자동 */
  border-radius: 4px 16px 16px 16px;
}
.message-bubble--sent {
  align-self: flex-end;     /* LTR=오른쪽, RTL=왼쪽 자동 */
  border-radius: 16px 4px 16px 16px;
}
/* RTL 버블 모양 미러링 */
[dir="rtl"] .message-bubble--received {
  border-radius: 16px 4px 16px 16px;
}
[dir="rtl"] .message-bubble--sent {
  border-radius: 4px 16px 16px 16px;
}
```

#### 네비게이션

```css
/* 뒤로가기 화살표 RTL 미러링 */
[dir="rtl"] .nav-back-icon {
  transform: scaleX(-1);  /* ← 를 → 로 미러링 */
}

/* 스와이프 제스처 방향 반전 */
/* LTR: 오른쪽→왼쪽 스와이프 = 삭제 */
/* RTL: 왼쪽→오른쪽 스와이프 = 삭제 */
```

#### 진행률 바

```css
/* Dream Planner 진행 바 — RTL에서 오른쪽에서 왼쪽으로 채워짐 */
.progress-bar {
  direction: inherit;  /* 부모 direction 따름 */
}
.progress-bar__fill {
  /* transform-origin을 start로 설정하면 자동 대응 */
  transform-origin: inline-start center;
}
```

#### 알림 카드 왼쪽 바

```css
/* 알림의 왼쪽 컬러 바 → RTL에서는 오른쪽 */
.notification-card--unread::before {
  /* left/right 대신 inset-inline-start 사용 */
  inset-inline-start: 0;
  border-radius: 0 2px 2px 0;
}
[dir="rtl"] .notification-card--unread::before {
  border-radius: 2px 0 0 2px;  /* 미러링 */
}
```

#### 6.3.4 RTL에서 미러링하면 안 되는 것들

| 요소 | 이유 |
|------|------|
| 재생/일시정지 버튼 | 전 세계 공통 아이콘 |
| 시계/시간 표시 | 숫자는 항상 LTR (12:30, 아랍어도 서양 숫자 사용 가능) |
| 전화 아이콘 | 전화기 방향은 고정 |
| 체크마크 (✓) | 보편적 기호 |
| 브랜드 로고 | Dream Hub 로고는 미러링 안 함 |
| 슬라이더/스크럽 바 | 오디오 재생 등은 항상 좌→우 |
| 숫자 (87%, ₩32,000) | 숫자 자체는 LTR 유지 |

#### 6.3.5 HTML dir 속성 설정

```html
<!-- 아랍어 사용자 -->
<html lang="ar" dir="rtl">

<!-- 한국어 사용자 -->
<html lang="ko" dir="ltr">

<!-- 채팅에서 혼합 언어 처리 -->
<p dir="auto">مرحبا Hello 안녕하세요</p>
<!-- dir="auto"는 첫 문자의 유니코드 방향을 따름 -->
```

#### 6.3.6 서체 스택 (7개 언어 대응)

```css
/* 언어별 서체 자동 전환 */
:root {
  --dream-font-primary: 'Pretendard', 'Inter', -apple-system, sans-serif;
}

[lang="ja"] {
  --dream-font-primary: 'Noto Sans JP', 'Pretendard', sans-serif;
  letter-spacing: 0;
}
[lang="zh-CN"] {
  --dream-font-primary: 'Noto Sans SC', 'Pretendard', sans-serif;
  letter-spacing: 0;
}
[lang="ar"] {
  --dream-font-primary: 'Noto Sans Arabic', 'Inter', sans-serif;
  line-height: 1.8;  /* 아랍어는 더 넓은 행간 필요 */
  letter-spacing: 0;
}
[lang="es"], [lang="fr"] {
  --dream-font-primary: 'Inter', -apple-system, sans-serif;
}

/* 디스플레이 폰트 (히어로 헤딩) */
[lang="ar"] {
  --dream-font-display: 'Noto Sans Arabic', sans-serif;
  /* 아랍어 캘리그래피 느낌을 위해 Bold보다 SemiBold 선호 */
}
```

#### 6.3.7 숫자 표기법

```javascript
// 아랍어 사용자에게도 서양 숫자 사용 (동부 아랍 숫자 ٧٨ 대신 78)
// 대부분의 글로벌 아랍어 앱이 이 방식 (인스타그램, 트위터 등)
const formatNumber = (num, locale) => {
  return new Intl.NumberFormat(locale, {
    numberingSystem: 'latn'  // 항상 서양 숫자 강제
  }).format(num);
};

// 날짜 포맷
const formatDate = (date, locale) => {
  return new Intl.DateTimeFormat(locale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    numberingSystem: 'latn'
  }).format(date);
};
// ar: "14 فبراير 2026"
// ko: "2026년 2월 14일"
// en: "February 14, 2026"
```

---

### 6.4 통합 온보딩 플로우 (Dream ID 최초 가입)

#### 6.4.1 온보딩 원칙

연구 결과 기반 결정:
- Duolingo: 가입 전에 첫 레슨을 경험시키면 전환율 2배 증가
- Headspace: 온보딩에서 38% 이탈 — 너무 많은 질문이 원인
- 최적 온보딩: **5화면 이하, 총 소요 시간 60초 이내, 최소한의 타이핑**

#### 6.4.2 온보딩 화면 플로우

```
화면 1        화면 2        화면 3         화면 4         화면 5
[웰컴]   →  [언어 선택]  → [로그인]   → [꿈 한 줄]   → [관심 서비스]
(10초)       (5초)         (10초)        (20초)         (10초)
                                                         ↓
                                                     [메인 허브]
```

#### 화면 1: 웰컴 (10초)

```
┌──────────────────────────────────────┐
│                                      │
│                                      │
│         [Dream Hub 로고]             │
│      ✨ 애니메이션 (3D 별 파티클)    │
│                                      │
│      "What's Your Dream?"           │
│                                      │
│   ┌─────────────────────────────┐    │
│   │  꿈꾸는 사람들이 만나는 곳.   │    │
│   │  아이디어를 현실로 만드세요.  │    │
│   └─────────────────────────────┘    │
│                                      │
│                                      │
│    ● ○ ○ ○ ○                        │  ← 페이지 인디케이터 (5개)
│                                      │
│   [                시작하기        ]  │  ← CTA 버튼 (Dream Hub 옐로우)
│                                      │
│   이미 계정이 있나요? 로그인         │  ← 기존 유저 링크
│                                      │
└──────────────────────────────────────┘
```

**UI 사양:**
- 배경: 다크 그라디언트 (`#1A1A2E` → `#2D1B69`) — 몽환적 느낌
- 로고: Dream Hub 로고 (화이트), 중앙 배치
- 3D 파티클: 느리게 떠다니는 별/반짝이 (Three.js 또는 Lottie)
- 타이틀: "What's Your Dream?" — Plus Jakarta Sans, 32px, Bold, White
- 서브텍스트: 사용자 기기 언어 자동 감지하여 해당 언어로 표시
- CTA 버튼: `--dream-hub-yellow` (#FFC300) 배경, 검정 텍스트

```css
.welcome-bg {
  background: linear-gradient(180deg, #1A1A2E 0%, #2D1B69 100%);
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}
.welcome-title {
  font: 700 32px/1.2 var(--dream-font-display);
  color: white;
  text-align: center;
}
.welcome-subtitle {
  font: 400 16px/1.6 var(--dream-font-primary);
  color: rgba(255, 255, 255, 0.7);
  text-align: center;
  max-width: 280px;
}
.welcome-cta {
  width: calc(100% - 48px);
  height: 52px;
  border-radius: var(--dream-radius-lg);
  background: var(--dream-hub-yellow);
  color: #171717;
  font: 700 18px/52px var(--dream-font-primary);
  border: none;
}
```

#### 화면 2: 언어 선택 (5초)

```
┌──────────────────────────────────────┐
│                                      │
│  🌍 Choose Your Language             │
│     언어를 선택하세요                 │
│                                      │
│  ┌────────────────────────────────┐  │
│  │ 🇰🇷  한국어               [✓] │  │  ← 자동 감지된 언어 체크
│  ├────────────────────────────────┤  │
│  │ 🇺🇸  English                  │  │
│  ├────────────────────────────────┤  │
│  │ 🇯🇵  日本語                   │  │
│  ├────────────────────────────────┤  │
│  │ 🇨🇳  中文 (简体)              │  │
│  ├────────────────────────────────┤  │
│  │ 🇪🇸  Español                  │  │
│  ├────────────────────────────────┤  │
│  │ 🇫🇷  Français                 │  │
│  ├────────────────────────────────┤  │
│  │ 🇸🇦  العربية                  │  │  ← 아랍어 (RTL)
│  └────────────────────────────────┘  │
│                                      │
│  ○ ● ○ ○ ○                          │
│                                      │
│  [              다음              ]   │
│                                      │
│  💡 언어는 나중에 설정에서            │
│     변경할 수 있어요                  │
│                                      │
└──────────────────────────────────────┘
```

**구현 사양:**
- 기기 OS 언어를 자동 감지하여 해당 언어를 미리 선택(체크)
- 국기 이모지 + 해당 언어 네이티브 표기 (영어로 번역 X)
- 선택 즉시 앱 전체 언어가 전환됨 (이후 화면부터 선택 언어 적용)
- 아랍어 선택 시 → `dir="rtl"` 즉시 적용
- 언어 선택 셀: 높이 52px, 탭 시 체크마크 + 서비스 컬러 하이라이트

```css
.language-option {
  display: flex;
  align-items: center;
  gap: 12px;
  height: 52px;
  padding: 0 16px;
  border-bottom: 1px solid var(--dream-neutral-100);
  cursor: pointer;
}
.language-option--selected {
  background: var(--dream-hub-yellow);
  background: rgba(255, 195, 0, 0.1);
}
.language-option__flag {
  font-size: 24px;
}
.language-option__name {
  font: 500 16px/1 var(--dream-font-primary);
  flex: 1;
}
.language-option__check {
  width: 24px;
  height: 24px;
  color: var(--dream-hub-yellow);
}
```

#### 화면 3: 로그인/가입 (10초)

```
┌──────────────────────────────────────┐
│                                      │
│     [Dream Hub 로고 (작게)]          │
│                                      │
│     Dream ID를 만드세요              │
│     모든 서비스를 하나의 계정으로     │
│                                      │
│  [🍎 Apple로 계속하기            ]   │  ← 검정 버튼
│                                      │
│  [G  Google로 계속하기           ]   │  ← 흰 버튼 + 테두리
│                                      │
│  [💬 카카오톡으로 계속하기       ]   │  ← 카카오 노란색
│                                      │
│  ─────── 또는 ───────                │
│                                      │
│  [이메일로 가입하기]                  │  ← 텍스트 링크
│                                      │
│  ○ ○ ● ○ ○                          │
│                                      │
│  가입 시 이용약관과 개인정보처리방침  │
│  에 동의하게 됩니다.                  │
│                                      │
└──────────────────────────────────────┘
```

**구현 사양:**
- 소셜 로그인 3종 (Apple / Google / Kakao) → **원탭 가입 목표**
- 언어 설정에 따라 소셜 로그인 순서 변경:
  - ko → 카카오 최상단
  - en, es, fr, ar → Google 최상단  
  - ja → Apple 최상단
- 이메일 가입은 보조 옵션으로 작게 표시
- 법적 고지: 작은 텍스트, 약관/개인정보 링크 내장

#### 화면 4: 꿈 한 줄 (20초) — 가장 중요한 화면

```
┌──────────────────────────────────────┐
│                                      │
│  [건너뛰기]                          │  ← 오른쪽 상단
│                                      │
│    ✨                                │
│    당신의 꿈은 무엇인가요?            │
│    한 줄로 적어보세요.               │
│                                      │
│  ┌────────────────────────────────┐  │
│  │                                │  │
│  │ 전 세계 사람들이 꿈을 이룰 수  │  │  ← 플레이스홀더 (연한 회색)
│  │ 있는 플랫폼을 만들고 싶어요    │  │
│  │                                │  │
│  └────────────────────────────────┘  │
│                                      │
│  💡 예시:                            │
│  "카페를 열어 사람들이 꿈을 나누는   │
│   공간을 만들고 싶어요"              │
│  "AI로 교육의 기회를 평등하게         │
│   만들고 싶어요"                     │
│                                      │
│  ○ ○ ○ ● ○                          │
│                                      │
│  [              다음              ]   │
│                                      │
│  이 꿈은 프로필에 표시되며            │
│  언제든 수정할 수 있어요              │
│                                      │
└──────────────────────────────────────┘
```

**구현 사양:**
- 텍스트 영역: 최소 2줄, 최대 5줄, 글자수 제한 140자
- 플레이스홀더: 실제 사용자가 쓸 법한 예시 (랜덤 로테이션)
- 건너뛰기 가능 (나중에 프로필에서 작성 가능)
- 예시 문구: 2~3개를 아코디언 없이 바로 보여줌
- 키보드 올라와도 레이아웃 안 깨지도록 `padding-bottom` 충분히
- 이 입력값이 Dream Place 프로필 + Dream Planner 초기 데이터로 활용

```css
.dream-input-area {
  width: calc(100% - 48px);
  min-height: 80px;
  padding: 16px;
  border-radius: var(--dream-radius-lg);
  border: 2px solid var(--dream-neutral-300);
  font: var(--dream-text-body);
  resize: none;
  transition: border-color var(--dream-transition-fast);
}
.dream-input-area:focus {
  border-color: var(--dream-hub-yellow);
  box-shadow: 0 0 0 4px rgba(255, 195, 0, 0.15);
}
.dream-input-area::placeholder {
  color: var(--dream-neutral-400);
  font-style: italic;
}
.dream-char-count {
  font: var(--dream-text-caption);
  color: var(--dream-neutral-400);
  text-align: end;
  margin-top: 4px;
}
.dream-char-count--over {
  color: var(--dream-error);
}
```

#### 화면 5: 관심 서비스 선택 (10초)

```
┌──────────────────────────────────────┐
│                                      │
│  [건너뛰기]                          │
│                                      │
│    어떤 것부터 시작할까요?            │
│    관심 있는 서비스를 골라보세요      │
│    (복수 선택 가능)                   │
│                                      │
│  ┌───────────────┐ ┌───────────────┐ │
│  │ 🧠            │ │ 📋            │ │
│  │ Dream Brain   │ │ Dream Planner │ │
│  │               │ │               │ │
│  │ 생각을        │ │ 꿈을 계획으로 │ │
│  │ 기록하고 싶어 │ │ 바꾸고 싶어   │ │
│  │         [✓]   │ │               │ │
│  └───────────────┘ └───────────────┘ │
│  ┌───────────────┐ ┌───────────────┐ │
│  │ 🌍            │ │ 🛍️            │ │
│  │ Dream Place   │ │ Dream Store   │ │
│  │               │ │               │ │
│  │ 함께할 동료를 │ │ 내 꿈을       │ │
│  │ 찾고 싶어     │ │ 세상에 팔고싶어│ │
│  │               │ │               │ │
│  └───────────────┘ └───────────────┘ │
│                                      │
│  ○ ○ ○ ○ ●                          │
│                                      │
│  [           Dream Hub 시작!      ]  │
│                                      │
└──────────────────────────────────────┘
```

**구현 사양:**
- 2×2 그리드, 각 카드 탭 시 체크 토글 + 서비스 컬러 테두리 활성화
- 복수 선택 가능, 0개도 가능 (건너뛰기와 동일)
- 선택된 서비스의 카드: 서비스 컬러 `border + 연한 배경 틴트`
- 미선택 카드: `neutral-200 border`
- 선택 결과에 따라 메인 허브 진입 후 해당 서비스 온보딩 연결
- 아무것도 선택 안 하면 → 메인 허브 (전체 서비스 둘러보기)

```css
.service-card {
  padding: 20px 16px;
  border-radius: var(--dream-radius-lg);
  border: 2px solid var(--dream-neutral-200);
  text-align: center;
  cursor: pointer;
  transition: all var(--dream-transition-normal);
}
.service-card--selected-brain {
  border-color: #7C3AED;
  background: rgba(124, 58, 237, 0.05);
}
.service-card--selected-planner {
  border-color: #E11D73;
  background: rgba(225, 29, 115, 0.05);
}
.service-card--selected-place {
  border-color: #2563EB;
  background: rgba(37, 99, 235, 0.05);
}
.service-card--selected-store {
  border-color: #E5A100;
  background: rgba(229, 161, 0, 0.05);
}
.service-card__icon {
  font-size: 36px;
  margin-bottom: 8px;
}
.service-card__title {
  font: 600 16px/1.3 var(--dream-font-primary);
  color: var(--dream-color-text-primary);
  margin-bottom: 4px;
}
.service-card__desc {
  font: var(--dream-text-body-sm);
  color: var(--dream-color-text-secondary);
}
```

#### 6.4.3 온보딩 이후: 메인 허브 첫 진입

온보딩 완료 후 사용자가 처음 보는 화면:

```
┌──────────────────────────────────────┐
│ [Dream Hub 로고]     [🔔] [👤]      │
├──────────────────────────────────────┤
│                                      │
│  안녕하세요, ○○님! 👋               │
│  당신의 꿈 여정이 시작되었어요       │
│                                      │
│  ── 추천 첫 번째 단계 ──            │
│  ┌────────────────────────────────┐  │
│  │ 📋 Dream Planner 시작하기      │  │  ← 선택한 서비스 기반 추천
│  │ "꿈을 구체적인 계획으로 바꿔요" │  │
│  │ [시작하기 →]                    │  │
│  └────────────────────────────────┘  │
│                                      │
│  ── 나의 서비스 ──                   │
│  [🧠 Brain] [📋 Planner]            │  ← 가로 스크롤 서비스 카드
│  [🌍 Place] [🛍️ Store]              │
│                                      │
│  ── 사이먼 스큅의 메시지 ──          │
│  ┌────────────────────────────────┐  │
│  │ "돈이 없어도 시작할 수 있다.    │  │  ← 오늘의 인용구
│  │  필요한 건 꿈뿐이다."          │  │
│  │           — Simon Squibb       │  │
│  └────────────────────────────────┘  │
│                                      │
├──────────────────────────────────────┤
│ 🏠 홈  💬 메시지  🔔 알림  👤 프로필│
└──────────────────────────────────────┘
```

#### 6.4.4 각 서비스별 미니 온보딩 (서비스 첫 진입 시)

메인 허브에서 개별 서비스에 처음 들어갈 때, 서비스별 1~2화면 미니 튜토리얼:

| 서비스 | 미니 온보딩 | 소요 시간 |
|--------|-----------|----------|
| Dream Brain | 마이크 권한 → 첫 녹음 유도 → AI 매직 모먼트 | 30초 |
| Dream Planner | PART 구조 소개 (시각적) → 첫 활동 시작 | 20초 |
| Dream Place | 프로필 보강 (스킬 태그 3개+) → 첫 매치 표시 | 45초 |
| Dream Store | 브라우징 안내 → 추천 스토리 표시 | 15초 |

**핵심: 설명 최소화, 행동 유도. "읽게 하지 말고 경험하게 하라."**

#### 6.4.5 온보딩 진행 인디케이터

```css
.onboarding-progress {
  display: flex;
  justify-content: center;
  gap: 8px;
  padding: 16px;
}
.onboarding-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.3);
  transition: all var(--dream-transition-normal);
}
.onboarding-dot--active {
  width: 24px;
  border-radius: 4px;
  background: var(--dream-hub-yellow);
}
.onboarding-dot--completed {
  background: rgba(255, 255, 255, 0.6);
}
```

---

### 6.5 구현 체크리스트

Claude Code에서 이 문서를 사용할 때의 우선순위:

1. **먼저 구현**: 채팅 입력 바 + 메시지 버블 + 대화 목록 (Dream Place의 핵심)
2. **함께 구현**: 알림 카드 컴포넌트 + 푸시 알림 규칙 + 알림 뱃지
3. **병행 구현**: 온보딩 5화면 플로우 (독립 모듈)
4. **전체 적용**: RTL Logical Properties 변환 (기존 CSS 전수 검토)

모든 CSS는 기존 `Dream_Hub_Platform__Complete_UIUX_and_Brand_Identity_Specification.md`의 디자인 토큰을 참조합니다. 새로 정의한 토큰은 없으며, 기존 공유 토큰 시스템 위에서 동작합니다.

---

## Conclusion: design philosophy encoded into this system

The Dream Hub design system encodes three principles distilled from analyzing 30+ competitor apps and thousands of user reviews. **First, speed is kindness** — Dream Brain's sub-1-second recording, Dream Planner's 10-minute activities, Dream Place's daily curated batch, and Dream Store's guest checkout all prioritize respecting the user's time. The competitor apps that users love most (Apple Voice Memos, Google Keep, Bear, Duolingo) share one trait: near-zero time from intent to action.

**Second, structure liberates** — the apps users abandon (Notion, Obsidian, Coursera) offer unlimited flexibility that becomes paralyzing. Every Dream Hub service makes decisions for the user: AI auto-categorizes in Dream Brain, the journey path provides structure in Dream Planner, daily batches curate matches in Dream Place, and editorial collections guide discovery in Dream Store. Users never face a blank canvas.

**Third, trust compounds** — CoFoundersLab's subscription scam destroyed it. Patreon's cancellation dark patterns fuel rage. Etsy's scam tolerance erodes buyer confidence. Dream Hub's tiered verification, transparent matching, impact breakdowns, and one-click cancellation treat trust as the foundational asset of the entire ecosystem. The design system's shared Dream ID, cross-service badges, and consistent interaction patterns reinforce that every touchpoint is part of a single trustworthy ecosystem built around Simon Squibb's core belief: give without take.

This specification is ready for direct implementation. Each hex code, pixel value, animation duration, and component definition can be translated directly into code. The token architecture allows any service's theme to be swapped by changing a single brand token layer while maintaining 100% consistency in components, spacing, typography, and interaction patterns across all four services.
