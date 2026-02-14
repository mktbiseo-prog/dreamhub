# Dream Hub — Global Rules (Shared CLAUDE.md)

## 교차 서비스 통합 알고리즘 (Cross-Service Integration)

교차 서비스 연결(매칭, 신뢰도, 데이터 흐름, 이벤트 시스템 등) 작업 시
반드시 docs/dream_hub_unified_algorithmic_blueprint.md 를 참고할 것.

이 문서에는 다음 내용이 포함되어 있음:
- Dream DNA 4차원 벡터 구조 및 JSON 스키마 (섹션 2)
- 다중 신호 융합 알고리즘 (섹션 3)
- 교차 서비스 신호 처리 프로토콜 (섹션 4)
- 교차 도메인 추천 엔진 아키텍처 (섹션 5)
- 기하평균 다목적 매칭 공식 및 증명 (섹션 6)
- 그람-슈미트 직교화 기반 상호보완성 알고리즘 (섹션 7)
- 게일-섀플리 안정 매칭 알고리즘 (섹션 8)
- 교차 서비스 신뢰도 시스템 (섹션 9)
- 생태계 플라이휠 측정 공식 (섹션 10)
- 그래프 클러스터 발견 알고리즘 (섹션 11)
- 콜드스타트 부트스트래핑 전략 (섹션 12)
- 실시간 이벤트 스트리밍 아키텍처 (섹션 13)
- 데이터베이스 샤딩 전략 (섹션 14)
- GraphQL Federation API 명세 (섹션 15)
- ZKP 보안 프로토콜 (섹션 16)
- Prisma 스키마 및 구현 의사코드 (섹션 17)

각 서비스별 상세설계서도 docs/ 폴더에 있으니 해당 서비스 작업 시 함께 참고할 것.


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
