# Dream Store — Handoff Document

> Last updated: 2026-02-13
> Dev server: `pnpm --filter @dreamhub/dream-store dev` → http://localhost:3002

---

## Project Context

Dream Store is a "story-based commerce platform" where sellers (Dreamers) sell products through their dream journey. The CTA is "Support This Dream" not "Add to Cart." It lives inside the DreamHub monorepo at `apps/dream-store/`.

Key docs:
- `apps/dream-store/CLAUDE.md` — product spec, data model, API patterns, MVP scope, design rules
- `docs/드림 스토어 상세설계서.pdf` — 11-page research report (benchmarking, UX flows, tech stack)
- `CLAUDE.md` (root) — monorepo-wide tech stack, coding standards, design system

---

## What's Done

### Routes (14 total, all building successfully)

| Route | Type | File | Description |
|-------|------|------|-------------|
| `/` | Dynamic | `app/page.tsx` | **Enhanced Discover** — hero with search bar, quick stats, Staff Picks section, Featured Dream spotlight, Rising Dreams, Theme Collections, 10 category filters + product type & creator stage filters |
| `/stories/create` | Dynamic | `app/stories/create/` | **5-Step Onboarding Wizard** — Dream Declaration → Origin Story → Milestones → Impact → Review, progress bar, per-step validation |
| `/stories/[storyId]` | Dynamic | `app/stories/[storyId]/page.tsx` | **Enriched Story detail** — hero with Staff Pick + Creator badges, origin story with process images, progress bar (milestone celebration at 100%), impact statement, Dream Updates, Creator Profile Card, Supporter Stories (comments), Supporter Wall with badges |
| `/stories/[storyId]/products/create` | Dynamic | `app/stories/[storyId]/products/create/` | Product creation form |
| `/stories/[storyId]/products/[productId]` | Dynamic | `app/stories/[storyId]/products/[productId]/` | Product detail — **Image Gallery** (prev/next, dots, thumbnails), Trust Badges, "Why I Made This" |
| `/dashboard` | Dynamic | `app/dashboard/page.tsx` | **Creator Dashboard** — revenue/supporters/orders stats, my dreams list, recent orders table |
| `/my-dreams` | Dynamic | `app/my-dreams/page.tsx` | **Supporter Dashboard** — impact banner, supported dreams grid, order history table |
| `/api/checkout` | API | `app/api/checkout/route.ts` | Stripe Checkout session creation |
| `/api/webhooks/stripe` | API | `app/api/webhooks/stripe/route.ts` | Stripe webhook handler |
| `/api/auth/[...nextauth]` | API | `app/api/auth/[...nextauth]/route.ts` | NextAuth endpoints |
| `/auth/sign-in` | Dynamic | `app/auth/sign-in/page.tsx` | Sign in page |
| `/checkout/success` | Dynamic | `app/checkout/success/page.tsx` | Thank you + "View My Supported Dreams" CTA |
| `/checkout/cancel` | Dynamic | `app/checkout/cancel/page.tsx` | Checkout cancelled |
| `/_not-found` | Static | `app/not-found.tsx` | Custom 404 |

### Components

| Component | File | Notes |
|-----------|------|-------|
| Navbar | `components/Navbar.tsx` | Sticky, brand gradient logo, auth-aware |
| UserMenu | `components/UserMenu.tsx` | Dropdown: Dashboard, My Dreams, Sign Out |
| Footer | `components/Footer.tsx` | 4-column layout |
| DreamCard | `components/DreamCard.tsx` | **Staff Pick / Featured / Creator Stage badges**, cover image, creator avatar, progress bar, price |
| ThemeToggle | `components/ThemeToggle.tsx` | Dark mode toggle |
| SearchBar | `app/SearchBar.tsx` | Search input with clear/submit, URL param-based |
| CategoryFilter | `app/CategoryFilter.tsx` | **Enhanced** — category tabs + product type + creator stage filters |
| FollowButton | `app/stories/[storyId]/FollowButton.tsx` | Follow/unfollow toggle |
| SupporterWall | `app/stories/[storyId]/SupporterWall.tsx` | **Supporter badges** (Founding/10x/Early Dreamer) |
| UpdateForm | `app/stories/[storyId]/UpdateForm.tsx` | Post update (owner only) |
| UpdateCard | `app/stories/[storyId]/UpdateCard.tsx` | Update display + delete |
| CommentForm | `app/stories/[storyId]/CommentForm.tsx` | Supporter story / comment form |
| CommentList | `app/stories/[storyId]/CommentList.tsx` | Comment list with delete |
| ImageGallery | `…/products/[productId]/ImageGallery.tsx` | Multi-image gallery: prev/next arrows, dots, thumbnails |
| SupportButton | `…/products/[productId]/SupportButton.tsx` | Stripe checkout trigger |
| CreateDreamStoryForm | `app/stories/create/CreateDreamStoryForm.tsx` | 5-step wizard |

### Server Actions

| Action | File | Description |
|--------|------|-------------|
| `createDreamStory` | `lib/actions/stories.ts` | Create story with origin story, impact, creator stage, milestones |
| `createProduct` | `lib/actions/products.ts` | Create product under dream story |
| `toggleFollow` | `lib/actions/social.ts` | Follow/unfollow |
| `createDreamUpdate` | `lib/actions/updates.ts` | Post update (ownership verified) |
| `deleteDreamUpdate` | `lib/actions/updates.ts` | Delete update (ownership verified) |
| `createDreamComment` | `lib/actions/comments.ts` | Post supporter comment |
| `deleteDreamComment` | `lib/actions/comments.ts` | Delete own comment |

### Data Layer

- **Queries**: `lib/queries.ts` — `getStories`, `getStoryById`, `getProductById`, `getSupporters`, `isFollowing`, `getDreamUpdates`, `getDreamComments`, `searchStories`, `getCreatorDashboard`, `getSupporterDashboard`
- **Mock data**: `lib/mockData.ts` — 6 Dream Stories (with creatorBio, originStory, processImages, impactStatement, creatorStage), 9 Products (multi-image, productType), 8 Supporters, 3 Comments
- **Types**: `lib/types.ts` — DreamStory, Product, Milestone, Supporter, DreamUpdateView, DreamCommentView, CATEGORIES, PRODUCT_TYPES, CREATOR_STAGES, `getSupporterBadge()`, `getCreatorBadge()`
- **Validation**: `lib/validations.ts` — `createDreamStorySchema` (with originStory, impactStatement, creatorStage), `createProductSchema`
- **Auth**: `lib/auth.ts` — `getCurrentUser()`, `getCurrentUserId()`, `requireAuth()`
- **Stripe**: `lib/stripe.ts` — Stripe client setup

### Shared Packages Modified

| Package | File | What Changed |
|---------|------|--------------|
| `@dreamhub/ui` | `src/components/textarea.tsx` | Textarea component |
| `@dreamhub/ui` | `src/components/card.tsx` | Card components |
| `@dreamhub/database` | `prisma/schema.prisma` | DreamStory (extended), Milestone, Product (extended), Order, Follow, DreamUpdate, DreamComment |
| `@dreamhub/database` | `src/index.ts` | All type exports including DreamUpdate, DreamComment |

### Middleware

- `src/middleware.ts` — Protects `/stories/create`, `/stories/*/products/create`, `/dashboard`, `/my-dreams`

### Loading States

- `app/loading.tsx` — Home skeleton
- `app/stories/[storyId]/loading.tsx` — Story detail skeleton
- `app/stories/[storyId]/products/[productId]/loading.tsx` — Product detail skeleton
- `app/dashboard/loading.tsx` — Dashboard skeleton

### Design Document Coverage

All 11 sections from `드림 스토어 상세설계서.pdf` are now implemented:

1. **Homepage/Discover** — Search, Staff Picks, Rising Dreams, Theme Collections, enhanced filters
2. **Story Detail** — Origin story, process images, impact statement, creator profile card, badges
3. **Creator/Supporter Dashboards** — Revenue stats, order history, impact tracking
4. **Product Detail** — Image gallery, trust badges, "Why I Made This"
5. **Onboarding** — 5-step wizard (Dream Declaration → Origin → Milestones → Impact → Review)
6. **Trust & Safety** — Trust badges (Secure Checkout, Payment methods, Refund Guarantee)
7. **Social Proof** — Supporter Wall with badges, supporter comments/stories
8. **Dream Updates** — Creator-only posting, inline form, delete
9. **Comments** — Supporter stories as social proof
10. **Badges** — Staff Pick, Featured, Creator badges (Star/Rising/Verified Maker), Supporter badges (Founding/10x/Early Dreamer)
11. **Milestone Celebration** — 100% progress celebration banner

---

## What's NOT Done (Next Steps)

### Medium Priority

1. **Image upload** — Cloudinary or Uploadthing integration (currently URL-based)
2. **Rich text editor** — Tiptap for dream stories and updates (currently plain text)
3. **Dreams Near You** — Location-based filtering (requires geolocation in schema)

### Low Priority (Polish)

4. **SEO / Open Graph** — Dynamic OG images for stories and products
5. **i18n** — next-intl setup (English default, Korean secondary)
6. **Image optimization** — Replace `<img>` with `next/image` (requires domains config)
7. **Error boundaries** — `error.tsx` for each dynamic route
8. **Video support** — Video URLs on stories (currently image-only)

---

## Architecture

```
apps/dream-store/src/
├── app/
│   ├── layout.tsx              ← Root: Navbar + Footer + Providers
│   ├── page.tsx                ← Discover (home) — search, staff picks, collections
│   ├── SearchBar.tsx           ← Search input (client)
│   ├── CategoryFilter.tsx      ← Categories + type/stage filters (client)
│   ├── Providers.tsx           ← SessionProvider wrapper
│   ├── loading.tsx             ← Home skeleton
│   ├── not-found.tsx           ← Custom 404
│   ├── api/
│   │   ├── auth/[...nextauth]/
│   │   ├── checkout/route.ts
│   │   └── webhooks/stripe/
│   ├── auth/sign-in/
│   ├── checkout/
│   │   ├── success/page.tsx
│   │   └── cancel/page.tsx
│   ├── dashboard/
│   │   ├── page.tsx            ← Creator Dashboard
│   │   └── loading.tsx
│   ├── my-dreams/
│   │   └── page.tsx            ← Supporter Dashboard
│   └── stories/
│       ├── create/
│       │   ├── page.tsx
│       │   └── CreateDreamStoryForm.tsx  ← 5-step wizard
│       └── [storyId]/
│           ├── page.tsx            ← Story detail (enriched)
│           ├── loading.tsx
│           ├── FollowButton.tsx
│           ├── SupporterWall.tsx   ← With supporter badges
│           ├── UpdateForm.tsx
│           ├── UpdateCard.tsx
│           ├── CommentForm.tsx
│           ├── CommentList.tsx
│           └── products/
│               ├── create/
│               │   ├── page.tsx
│               │   └── CreateProductForm.tsx
│               └── [productId]/
│                   ├── page.tsx
│                   ├── loading.tsx
│                   ├── ImageGallery.tsx
│                   └── SupportButton.tsx
├── components/
│   ├── Navbar.tsx
│   ├── UserMenu.tsx            ← Dashboard, My Dreams, Sign Out
│   ├── Footer.tsx
│   ├── DreamCard.tsx           ← With badges
│   └── ThemeToggle.tsx
└── lib/
    ├── actions/
    │   ├── stories.ts
    │   ├── products.ts
    │   ├── social.ts
    │   ├── updates.ts
    │   ├── comments.ts
    │   └── stripe.ts
    ├── auth.ts
    ├── queries.ts              ← All data fetching + search
    ├── types.ts                ← Types + badges + constants
    ├── mockData.ts             ← 6 stories, 9 products, expanded mock data
    ├── stripe.ts
    └── validations.ts
```

### Design Tokens

- CTA gradient: `from-brand-600 to-orange-500`
- Cards: `rounded-card` (12px), generous padding
- Creator avatars: circular with border
- Typography: 16px+ body for storytelling
- Dark mode: `dark:` prefix, localStorage toggle
- Staff Pick badge: `bg-yellow-400 text-yellow-900`
- Featured badge: `bg-brand-500 text-white`

---

## Quick Commands

```bash
pnpm --filter @dreamhub/dream-store dev          # localhost:3002
pnpm --filter @dreamhub/dream-store build         # production build
pnpm --filter @dreamhub/database db:generate      # regenerate Prisma client

# Test URLs
http://localhost:3002                               # Discover (search, staff picks, collections)
http://localhost:3002/stories/story-1               # Story detail (enriched)
http://localhost:3002/stories/story-1/products/prod-1  # Product detail (gallery)
http://localhost:3002/stories/create                # 5-step wizard
http://localhost:3002/dashboard                     # Creator Dashboard
http://localhost:3002/my-dreams                     # Supporter Dashboard
```
