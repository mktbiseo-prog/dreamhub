# Dream Hub — Global Rules (Shared CLAUDE.md)

## 🌍 CRITICAL: Language & Market
- **All UI text, labels, buttons, placeholders, error messages, and copy MUST be in English**
- This is a GLOBAL product targeting international users
- Use i18n (next-intl) from Day 1 — hardcode English as default, Korean as secondary
- All code comments and variable names in English
- All commit messages in English

## Tech Stack (All Services Share This)
- **Frontend**: Next.js 15 + React 19 + TypeScript
- **UI**: Tailwind CSS + shadcn/ui
- **Backend**: NestJS (TypeScript)
- **Database**: PostgreSQL + Prisma ORM
- **Auth**: Auth.js (NextAuth) — shared "Dream ID" across all services
- **AI**: OpenAI API (GPT-4o-mini for cost efficiency, GPT-4o for complex tasks)
- **Deployment**: Vercel (frontend) + Railway or Render (backend)
- **Package Manager**: pnpm

## Monorepo Structure
```
dreamhub/
├── apps/
│   ├── dream-planner/     # Next.js app
│   ├── dream-store/       # Next.js app
│   ├── dream-brain/       # Next.js app
│   ├── dream-place/       # Next.js app
│   └── dream-cafe/        # Next.js app (admin/booking)
├── packages/
│   ├── ui/                # Shared UI components (shadcn/ui based)
│   ├── database/          # Shared Prisma schema & client
│   ├── auth/              # Shared Dream ID auth
│   ├── ai/                # Shared AI utilities
│   └── config/            # Shared ESLint, TypeScript configs
├── turbo.json
└── package.json
```

## Coding Standards
- Use TypeScript strict mode
- Prefer Server Components over Client Components
- Use `async/await` not `.then()`
- Validate all user input with Zod
- Use Tailwind CSS only — no inline styles, no CSS modules
- Component files: PascalCase (e.g., `DreamCard.tsx`)
- Utility files: camelCase (e.g., `formatDate.ts`)

## DO NOT
- Never commit `.env` files
- Never use `any` type in TypeScript
- Never bypass authentication checks
- Never expose API keys in client code
- Never use CSS-in-JS libraries
- Never install unnecessary dependencies without checking existing ones first

## Design System
- Primary color: Brand gradient (purple → blue)
- Font: Inter (Google Fonts)
- Border radius: 8px default, 12px for cards, 16px for modals
- Spacing: Use Tailwind's spacing scale (4px base)
- Dark mode: Support from Day 1 using Tailwind dark: prefix
- Mobile-first responsive design

## Dream ID (Shared Auth)
All services use a single "Dream ID" login. One account = access to all Dream Hub services.
- Social login: Google, Apple, Kakao (for Korean market)
- Email + password as fallback
- JWT session strategy
- User profile fields: name, email, avatar, bio, dreamStatement, skills[], interests[]
