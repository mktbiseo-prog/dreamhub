# Dream Place — Design Guidelines for Claude Code
# 이 파일을 프로젝트 루트에 넣으면 Claude Code가 코딩할 때 자동으로 참고합니다.

---

## 🎯 프로젝트 정체성

Dream Place는 전 세계 드리머들을 연결하는 글로벌 매칭 플랫폼입니다.
철학: "우주는 넓고 우린 작은 존재다. 짧은 인생, 두려워 말고 연결되어라."
디자인 느낌: Apple.com 수준의 미니멀, 깔끔, 불필요한 요소 제로.

---

## 🎨 COLOR SYSTEM (절대 변경 금지)

### Primary Colors
```css
--dream-place-primary: #6C3CE1;          /* 딥 퍼플 — 우주, 신비, 메인 강조 */
--dream-place-primary-light: #E8E0FF;    /* 연한 라벤더 — 배경, 보조 요소 */
--dream-place-primary-lighter: #F5F1FF;  /* 극연한 라벤더 — 섹션 배경 */
--dream-place-primary-dark: #5429C7;     /* 진한 퍼플 — 호버, 프레스 상태 */
--dream-place-on-primary: #FFFFFF;       /* Primary 위에 올라가는 텍스트 */
```

### 사용 규칙
- Primary #6C3CE1: CTA 버튼, 활성 네비게이션, 매치 퍼센트, 링크에만 사용
- Primary Light #E8E0FF: 카드 배경, 뱃지 배경, 선택된 항목 배경에만 사용
- 나머지 모든 UI: 흰색(#FFFFFF), 검정(#171717), 회색 계열만 사용
- 절대 다른 색상 추가하지 말 것 (빨강, 초록, 노랑 등 금지 — 시맨틱 컬러 예외)

### Neutral Colors (흰/검/회 계열)
```css
--dream-neutral-50: #FAFAFA;     /* 페이지 배경 */
--dream-neutral-100: #F5F5F5;    /* 섹션 배경 */
--dream-neutral-200: #E5E5E5;    /* 구분선, 테두리 */
--dream-neutral-300: #D4D4D4;    /* 비활성 테두리 */
--dream-neutral-400: #A3A3A3;    /* 플레이스홀더 텍스트 */
--dream-neutral-500: #737373;    /* 보조 텍스트 */
--dream-neutral-600: #525252;    /* 부제목 텍스트 */
--dream-neutral-700: #404040;    /* 중요 보조 텍스트 */
--dream-neutral-800: #262626;    /* 제목 텍스트 */
--dream-neutral-900: #171717;    /* 가장 진한 텍스트 */
```

### Semantic Colors (기능용, 최소한으로만 사용)
```css
--dream-success: #22C55E;        /* 매치 80%+ */
--dream-success-light: #DCFCE7;
--dream-warning: #F59E0B;        /* 매치 50-79% */
--dream-warning-light: #FEF3C7;
--dream-error: #EF4444;          /* 에러만 */
--dream-error-light: #FEE2E2;
```

### 다크모드
```css
[data-theme="dark"] {
  --dream-color-surface: #1A1A2E;
  --dream-color-background: #0F0F1A;      /* 우주 느낌의 짙은 남색 */
  --dream-color-text-primary: #FAFAFA;
  --dream-color-text-secondary: #A3A3A3;
  /* Primary #6C3CE1은 다크모드에서도 동일하게 유지 */
}
```

---

## 📝 TYPOGRAPHY (일관되게 유지)

### Font Stack
```css
--font-primary: 'Pretendard', 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
--font-display: 'Plus Jakarta Sans', 'Pretendard', sans-serif;
```

### Scale
```
Hero 제목:      48px / font-bold / line-height 1.1 / letter-spacing -0.02em / font-display
페이지 제목:    32px / font-bold / line-height 1.2 / letter-spacing -0.01em / font-display
섹션 제목:      24px / font-semibold / line-height 1.3
카드 제목:      18px / font-semibold / line-height 1.4
본문:           16px / font-normal / line-height 1.6
보조 텍스트:    14px / font-normal / line-height 1.5 / text-neutral-500
캡션:           12px / font-medium / line-height 1.4 / text-neutral-400
```

### 규칙
- 제목에는 font-display (Plus Jakarta Sans) 사용
- 본문에는 font-primary (Pretendard/Inter) 사용
- 제목은 letter-spacing을 살짝 좁게 (-0.01em ~ -0.02em) — Apple 스타일
- 본문은 letter-spacing 기본값 유지
- 한국어/영어 모두 자연스러워야 함

---

## 📐 SPACING & LAYOUT

### Spacing Scale
```
4px   — xxs  (아이콘과 텍스트 사이)
8px   — xs   (인라인 요소 간격)
12px  — sm   (밀접한 요소 간격)
16px  — md   (카드 내부 패딩)
24px  — lg   (요소 간 기본 간격)
32px  — xl   (섹션 내 그룹 간격)
48px  — 2xl  (섹션 간 간격 — 모바일)
64px  — 3xl  (섹션 간 간격 — 데스크톱)
80px  — 4xl  (히어로와 다음 섹션 간격)
```

### Layout Rules
- 최대 콘텐츠 너비: 1200px, 가운데 정렬
- 모바일: 좌우 패딩 16px
- 데스크톱: 좌우 패딩 24px 이상
- 한 화면에 요소 3개 이하 — 여백을 넉넉하게 (Apple 스타일 핵심)
- 카드 간 간격: 16px (모바일), 24px (데스크톱)

### Responsive Breakpoints
```css
sm: 640px    /* 작은 태블릿 */
md: 768px    /* 태블릿 */
lg: 1024px   /* 작은 데스크톱 */
xl: 1280px   /* 표준 데스크톱 */
2xl: 1536px  /* 큰 화면 */
```

---

## 🧩 COMPONENT STYLE (shadcn/ui 기반)

### Buttons
```
CTA/Primary:    bg-[#6C3CE1] text-white rounded-lg h-12 px-6 font-semibold
                hover:bg-[#5429C7] transition-colors duration-150
                그림자 없음 — 플랫 스타일

Secondary:      bg-transparent border-1.5 border-[#6C3CE1] text-[#6C3CE1] rounded-lg h-12 px-6
                hover:bg-[#F5F1FF]

Ghost:          bg-transparent text-neutral-600 rounded-lg h-12 px-6
                hover:bg-neutral-100

Destructive:    bg-red-500 text-white (에러/삭제 상황에서만)
```

### Cards
```
기본 카드:      bg-white rounded-2xl p-4 border border-neutral-200
                shadow-sm hover:shadow-md transition-shadow duration-250

강조 카드:      bg-white rounded-2xl p-4 shadow-md border-none

선택된 카드:    bg-[#F5F1FF] rounded-2xl p-4 border-2 border-[#6C3CE1]
```

### Match Card (Dream Place 핵심 컴포넌트)
```
구조:
┌─────────────────────────────────────┐
│  [Avatar 48px]  이름, 위치          │
│                 "꿈 한줄 설명"       │
│                 ⭐ 인증 레벨         │
│                                     │
│  ████████████░░░  87% Match         │  ← 퍼센트 바: bg-[#6C3CE1]
│                                     │
│  [Skill Tag] [Skill Tag] [Tag]      │  ← 태그: bg-[#E8E0FF] text-[#6C3CE1]
│                                     │
│  [Pass]          [Invite to Connect]│  ← Ghost / Primary 버튼
└─────────────────────────────────────┘

카드: bg-white rounded-2xl p-5 shadow-sm hover:shadow-md
아바타: rounded-full, object-cover
매치 퍼센트 바: bg-[#E8E0FF]에 채워진 부분 bg-[#6C3CE1], rounded-full h-2
스킬 태그: bg-[#E8E0FF] text-[#6C3CE1] text-sm rounded-full px-3 py-1
```

### Input Fields
```
기본:           h-12 px-4 rounded-xl border-1.5 border-neutral-300 bg-white
                text-16 text-neutral-900
                placeholder: text-neutral-400
                focus: border-[#6C3CE1] ring-3 ring-[#E8E0FF] outline-none
                error: border-red-500
```

### Navigation
```
모바일 하단탭:  h-14 bg-white border-t border-neutral-200
                아이콘 24px + 라벨 12px
                활성: text-[#6C3CE1], 아이콘 filled
                비활성: text-neutral-400, 아이콘 outlined
                탭 5개: Discover / Matches / Projects / Messages / Profile

데스크톱 사이드바: w-60 bg-white border-r border-neutral-200
                   접힘 모드: w-16 아이콘만
```

### Badges / Tags
```
스킬 태그:      bg-[#E8E0FF] text-[#6C3CE1] text-xs font-medium rounded-full px-3 py-1
인증 뱃지:      border border-[#6C3CE1] text-[#6C3CE1] text-xs rounded-full px-2 py-0.5
매치 높음:      bg-green-50 text-green-700
매치 중간:      bg-amber-50 text-amber-700
```

---

## 🌌 HERO SECTION (랜딩 페이지 — Spline 3D)

### Spline Embed (실제 코드 — 그대로 사용)
```html
<script type="module" src="https://unpkg.com/@splinetool/viewer@1.12.58/build/spline-viewer.js"></script>
<spline-viewer url="https://prod.spline.design/1MigA5o47Of6hLrK/scene.splinecode"></spline-viewer>
```
- Spline Community 원본: https://app.spline.design/community/file/dc934dad-135e-42bd-ad4d-8234b6cfd7bc
- 히어로 섹션 높이: 100vh (풀스크린)
- 배경: 다크 (#0F0F1A) — 우주 느낌
- 3D 위에 텍스트 오버레이:
  - 헤드라인: 흰색, 48px, font-display, font-bold
  - 서브헤드: 흰색 70% 투명도, 18px
  - CTA 버튼: bg-[#6C3CE1] text-white
- 스크롤 다운 인디케이터: 하단 중앙, 은은한 바운스 애니메이션

### 히어로 카피 방향
```
헤드라인: "The universe is vast. Your dream doesn't have to be alone."
서브헤드: "Find your perfect co-dreamer across borders. Connect, collaborate, create."
CTA: "Start Exploring"
```

---

## ✨ ANIMATION & INTERACTION

### 규칙
- 모든 애니메이션은 은은하게. 화려한 효과 금지.
- prefers-reduced-motion: reduce 반드시 존중

### 트랜지션
```
빠름:    150ms ease      — 버튼 호버, 토글
기본:    250ms ease      — 카드 호버, 모달 열기
느림:    400ms cubic-bezier(0.4, 0, 0.2, 1) — 페이지 전환, 히어로 진입
```

### 허용되는 애니메이션
- 페이드인 (opacity 0→1, 200ms)
- 살짝 올라오기 (translateY 8px→0, 300ms) — 카드, 섹션 진입
- 스케일 (scale 0.98→1, 150ms) — 버튼 프레스
- 히어로 Spline 3D 마우스 인터랙션

### 금지되는 애니메이션
- 번쩍이는 효과
- 회전 애니메이션 (Spline 제외)
- 과도한 패럴랙스
- 자동 재생 슬라이더/캐러셀

---

## 📱 KEY SCREENS STRUCTURE

### 1. 랜딩 페이지 (비로그인)
```
[히어로: Spline 3D 우주 + 헤드라인 + CTA] — 100vh
[가치 제안: 3개 아이콘+텍스트, 1줄] — 넉넉한 여백
[작동 원리: 3단계 설명, 미니멀] — 번호 + 제목 + 한줄 설명
[소셜 프루프: 숫자 통계 3개] — "10,000+ Dreamers Connected"
[최종 CTA: 가입 유도] — 심플
[푸터: 미니멀]
```

### 2. 매치 피드 (로그인 후 홈)
```
[상단바: 로고 + 필터 + 알림]
[일일 매치 카드 피드: 8-12장/일, 무한스크롤 아님]
[카드 소진 시: "내일 새로운 매치가 도착합니다"]
[하단: 모바일 탭바]
```

### 3. 프로필 상세
```
[히어로: 사진/영상 + 인증뱃지]
[꿈 선언문: 큰 글씨, 눈에 띄게]
[매치 분석: 레이더 차트 6축]
[구조화된 소개: What I've built / My superpower / Looking for]
[포트폴리오 링크]
[CTA바: Pass / Invite to Connect — 하단 고정]
```

### 4. 팀 형성 대시보드
```
[탭: My Connections | Active Projects | Team Builder]
[팀 빌더: 스킬 레이더 차트 — 초록=채워짐, 빨강=부족]
[트라이얼 프로젝트 카드: 2주 체험 프로젝트]
[메시지: 인앱 채팅]
```

---

## 🌐 GLOBE VISUALIZATION

### 3D 지구본 (react-globe.gl 사용)
```
배경: 다크 (#0F0F1A)
지구: 점 기반 대륙 (Stripe/GitHub 스타일, 폴리곤 아님)
점 색상: #6C3CE1 (30% 투명도)
연결 아크: #6C3CE1 → #E8E0FF 그라디언트
드리머 위치: 밝은 점, 호버 시 프로필 미리보기
```

---

## 🚫 절대 하지 말 것 (NEVER DO)

1. Primary/Sub 외의 색상 추가하지 말 것
2. 그라디언트를 남용하지 말 것 (히어로 오버레이 제외)
3. 한 화면에 4개 이상 요소 배치하지 말 것
4. 여백을 줄이지 말 것 — 넉넉한 공간이 프로 느낌의 핵심
5. 기본 시스템 폰트를 사용하지 말 것 — 반드시 Pretendard/Inter
6. border-radius를 섞지 말 것 — 카드는 2xl(16px), 버튼은 lg(8px), 입력은 xl(12px) 통일
7. 그림자를 과하게 쓰지 말 것 — shadow-sm이 기본, 호버에만 shadow-md
8. 아이콘 라이브러리를 섞지 말 것 — Lucide Icons만 사용 (24px, 1.5px stroke)

---

## ✅ 항상 지킬 것 (ALWAYS DO)

1. 모든 인터랙티브 요소: 최소 44px × 44px 터치 타겟
2. 색상 대비: 본문 4.5:1, 큰 텍스트 3:1 이상
3. 모바일 퍼스트로 개발, 데스크톱으로 확장
4. 이미지에 alt 텍스트, 인터랙티브 요소에 aria-label
5. 모든 텍스트는 한국어/영어 전환 가능하게 (i18n 준비)
6. 로딩 상태: skeleton UI 사용 (spinner 금지)
7. 빈 상태: 일러스트 + 안내 메시지 + CTA
8. 에러 상태: 구체적 메시지 + 해결 액션

---

## 🔧 TECH STACK REFERENCE

```
Framework:      Next.js 15 (App Router)
UI Library:     shadcn/ui + Tailwind CSS v4
3D:             Spline embed (히어로) + react-globe.gl (지구본)
Icons:          Lucide React
Font:           Pretendard (Korean) + Inter (Latin) + Plus Jakarta Sans (Display)
State:          Zustand + TanStack Query v5
Auth:           Supabase Auth
DB:             Supabase (PostgreSQL + pgvector)
Deploy:         Vercel
```

---

*이 가이드라인을 벗어나는 디자인 결정이 필요하면 반드시 사용자에게 확인받을 것.*
*"바이브코딩 쓴 티가 나면 실패"라는 기준으로 모든 UI를 판단할 것.*
