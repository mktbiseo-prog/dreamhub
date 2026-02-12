# Dream Store — CLAUDE.md

## 🌍 CRITICAL: ALL UI TEXT MUST BE IN ENGLISH
This is a global product. Every label, button, placeholder, heading, tooltip, and error message must be in English. No Korean text in the UI. Use next-intl for i18n support.

## What is Dream Store?
A story-based commerce platform where people sell products/services through their dream story. Unlike Etsy or Shopify where you "buy a product," on Dream Store you "support a dream." Every product page leads with the creator's dream journey, making purchasing an act of supporting someone's dream.

## Core Concept: "Support This Dream, Not Just Buy This Product"
- Every seller (called "Dreamer") has a Dream Story page
- Products are listed UNDER the dream story, not separately
- Buyers see: Dream Story → Why I Made This → The Product → Support This Dream (buy button)
- The CTA is "Support This Dream" not "Add to Cart"

## Key Pages & Features

### 1. Dream Story Page (Creator Profile)
- Hero: Dream statement + creator photo/video
- Journey timeline: key milestones in their dream pursuit
- "Dream Updates" feed (like Patreon updates)
- Products/services grid below the story
- Supporter Wall: visual display of everyone who supported
- Follow button: "Follow This Dream" for free updates

### 2. Product/Service Listing Page  
- Story-first layout: dream context before product details
- Product images/video
- Price + "Support This Dream" button
- "Why I Made This" section (connects product to dream)
- Reviews framed as "Supporter Stories"
- Related products from same dreamer

### 3. Home/Discover Page
- Featured Dreams (curated rotating spotlight)
- Categories: Art, Tech, Food, Education, Social Impact, etc.
- "Dreams Near You" (location-based)
- "Rising Dreams" (trending new creators)
- Search with filters (category, price range, location)

### 4. Creator Dashboard
- Sales analytics
- Supporter management
- Dream Updates composer
- Product listing management
- Revenue & payout tracking

### 5. Supporter Dashboard (Buyer Side)
- Dreams I'm supporting
- Order history
- Saved/bookmarked dreams
- Impact summary: "You've supported 5 dreams this year"

## Business Model
- 8-10% commission on each sale (platform fee)
- Free to list, free to browse
- Premium features for creators (analytics, promotion tools) — future

## Tech Specifics
- Commerce engine: Custom-built (not Shopify/Medusa for MVP — too complex)
- Payment: Stripe Connect (marketplace split payments)
- Image upload: Cloudinary or Uploadthing
- Search: Basic PostgreSQL full-text search for MVP → Typesense later
- Rich text editor: Tiptap (for dream stories and updates)

## Data Model (Key Entities)
```
User (Dreamer) → has one → DreamStory
DreamStory → { title, statement, journeyTimeline[], coverImage, videoUrl }
DreamStory → has many → Products
Product → { title, description, images[], price, category, whyIMadeThis }
Product → has many → Orders
Order → { buyerId, productId, amount, stripeFee, platformFee, status }
DreamStory → has many → DreamUpdates (blog-style posts)
DreamStory → has many → Followers
```

## API Endpoints Pattern
```
# Dream Stories
GET    /api/stories                  — discover/browse dreams
GET    /api/stories/:id              — get dream story + products
POST   /api/stories                  — create dream story (auth required)
PATCH  /api/stories/:id              — update dream story

# Products
GET    /api/products                 — browse all products
POST   /api/stories/:id/products     — add product to dream
PATCH  /api/products/:id             — update product

# Orders
POST   /api/orders                   — create order (Stripe checkout)
GET    /api/orders                   — buyer's order history
GET    /api/dashboard/orders         — seller's orders

# Social
POST   /api/stories/:id/follow       — follow a dream
GET    /api/stories/:id/updates       — get dream updates
POST   /api/stories/:id/updates       — post dream update (creator only)
```

## MVP Scope (Build This First)
1. ✅ Dream Story creation (title, statement, cover image, basic timeline)
2. ✅ Product listing (title, description, images, price)
3. ✅ Discover page with category filtering
4. ✅ Basic Stripe Checkout (single purchase)
5. ✅ Supporter Wall (list of buyers)
6. ❌ Dream Updates feed (later)
7. ❌ Follow system (later)
8. ❌ Creator Dashboard analytics (later)
9. ❌ Search (basic only for MVP)
10. ❌ Reviews/supporter stories (later)

## Design Reference
- Warm, inspiring aesthetic — NOT corporate e-commerce
- Hero images are large and cinematic
- "Support This Dream" button: gradient purple → warm orange
- Cards have generous padding and subtle shadows
- Creator photos always circular with border
- Typography: larger body text (16px+) for storytelling feel
