# Dream Brain — Design Guidelines for Claude Code
# 이 파일을 프로젝트 루트에 넣으면 Claude Code가 코딩할 때 자동으로 참고합니다.

---

## 🎯 프로젝트 정체성

Dream Brain은 AI 기반 음성 녹음 + 세컨드 브레인 앱입니다.
말하면 AI가 자동 정리하고 인사이트를 뽑아주는 "생각 캡처 도구".
철학: 1초 안에 녹음 시작. 정리는 AI가 알아서. 사용자는 말만 하면 됨.
디자인 느낌: Apple Voice Memos처럼 빠르고 미니멀. 다크 테마 기반. 조용한 지능.

---

## 🎨 COLOR SYSTEM (절대 변경 금지)

### Primary Colors
```css
--dream-brain-primary: #00D4AA;          /* 네온 민트 — AI/테크/지능 느낌 */
--dream-brain-primary-light: #CCFBF1;    /* 연한 민트 — 보조 배경 */
--dream-brain-primary-lighter: #F0FDFA;  /* 극연한 민트 — 섹션 배경 */
--dream-brain-primary-dark: #00B894;     /* 진한 민트 — 호버, 프레스 */
--dream-brain-on-primary: #FFFFFF;       /* Primary 위 텍스트 */
```

### 다크 테마 (기본 테마 — Dream Brain은 다크 퍼스트)
```css
--dream-brain-bg: #0A1628;               /* 딥 네이비 — 메인 배경 */
--dream-brain-surface: #132039;          /* 약간 밝은 네이비 — 카드 배경 */
--dream-brain-surface-alt: #1A2B4A;      /* 더 밝은 네이비 — 호버/활성 */
--dream-brain-border: #1E3355;           /* 테두리 */
--dream-brain-text-primary: #FAFAFA;     /* 메인 텍스트 */
--dream-brain-text-secondary: #94A3B8;   /* 보조 텍스트 */
--dream-brain-text-tertiary: #64748B;    /* 캡션/힌트 */
```

### 사용 규칙
- Dream Brain은 **다크 테마가 기본** (밝은 테마는 옵션)
- Primary #00D4AA: 녹음 버튼(대기 상태), 활성 네비게이션, AI 하이라이트, 링크
- 녹음 중: 빨간색 #EF4444 (펄스 애니메이션)
- 나머지: 다크 네이비 계열 + 흰/회색 텍스트
- 절대 3개 이상 강조색 사용 금지

### Semantic Colors
```css
--dream-success: #22C55E;
--dream-warning: #F59E0B;
--dream-error: #EF4444;           /* 녹음 중 상태에도 사용 */
--dream-recording-active: #EF4444;
--dream-recording-glow: rgba(239, 68, 68, 0.15);
```

### Knowledge Graph Node Colors
```css
--dream-node-idea: #00D4AA;      /* 아이디어 노드 */
--dream-node-task: #22C55E;      /* 할일 노드 */
--dream-node-person: #3B82F6;    /* 사람 노드 */
--dream-node-project: #F59E0B;   /* 프로젝트 노드 */
```

---

## 📝 TYPOGRAPHY

### Font Stack
```css
--font-primary: 'Pretendard', 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
--font-display: 'Plus Jakarta Sans', 'Pretendard', sans-serif;
--font-mono: 'JetBrains Mono', 'Fira Code', monospace;  /* 타임스탬프, 코드용 */
```

### Scale
```
Hero 제목:      48px / font-bold / line-height 1.1 / letter-spacing -0.02em / font-display
페이지 제목:    32px / font-bold / line-height 1.2 / letter-spacing -0.01em
섹션 제목:      24px / font-semibold / line-height 1.3
카드 제목:      18px / font-semibold / line-height 1.4
본문:           16px / font-normal / line-height 1.6 / text-[#FAFAFA]
보조 텍스트:    14px / font-normal / line-height 1.5 / text-[#94A3B8]
캡션/시간:      12px / font-mono / line-height 1.4 / text-[#64748B]
```

---

## 📐 SPACING & LAYOUT

### Layout Rules
- 최대 콘텐츠 너비: 1200px
- 모바일: 좌우 패딩 16px
- 데스크톱: 좌우 패딩 24px+
- 한 화면에 요소 3개 이하
- 녹음 버튼이 항상 가장 눈에 띄는 요소

### Responsive Breakpoints
```css
sm: 640px / md: 768px / lg: 1024px / xl: 1280px / 2xl: 1536px
```

---

## 🧩 COMPONENT STYLE (shadcn/ui 기반)

### Recording Button (핵심 컴포넌트)
```css
/* 대기 상태 — 숨쉬는 애니메이션 */
.record-btn {
  width: 120px; height: 120px;
  border-radius: 50%;
  background: #00D4AA;
  box-shadow: 0 8px 32px rgba(0, 212, 170, 0.35);
  animation: breathe 3s ease-in-out infinite;
}

/* 녹음 중 — 빨간색 펄스 */
.record-btn--active {
  background: #EF4444;
  box-shadow: 0 0 0 12px rgba(239, 68, 68, 0.15);
  animation: pulse 1.2s ease-in-out infinite;
}

@keyframes breathe { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.03); } }
@keyframes pulse { 0%, 100% { box-shadow: 0 0 0 0 rgba(239,68,68,0.3); } 50% { box-shadow: 0 0 0 16px rgba(239,68,68,0); } }
```

### Waveform Visualizer
```
40개 세로 바 | 3px 너비 | 2px 간격
오디오 진폭에 따라 높이 반응
그라디언트: #00D4AA (하단) → #06B6D4 (상단)
재생 시: 현재 위치 이전=100% 불투명, 이후=30% 불투명
```

### Note Card (피드 아이템)
```
구조: 아이콘 + 제목/요약 + 시간 + 카테고리 태그
배경: --dream-brain-surface (#132039)
테두리: 없음, 하단 1px border (#1E3355)
카테고리 태그: bg-[#00D4AA]/10 text-[#00D4AA] rounded-full text-xs px-3 py-1
```

### AI Summary Card
```
배경: --dream-brain-surface-alt (#1A2B4A)
왼쪽 보더: 3px solid #00D4AA
패딩: 16px
앞에 ✨ 아이콘
텍스트: #FAFAFA, 14px
```

### Buttons
```
Primary:     bg-[#00D4AA] text-white rounded-lg h-12 px-6 font-semibold
             hover:bg-[#00B894] transition-colors duration-150

Secondary:   bg-transparent border-1.5 border-[#00D4AA] text-[#00D4AA] rounded-lg
             hover:bg-[#00D4AA]/10

Ghost:       bg-transparent text-[#94A3B8] rounded-lg
             hover:bg-[#1A2B4A]
```

### Input Fields
```
h-12 px-4 rounded-xl
bg-[#132039] border-1.5 border-[#1E3355]
text-[#FAFAFA] placeholder:text-[#64748B]
focus: border-[#00D4AA] ring-3 ring-[#00D4AA]/20
```

### Navigation
```
모바일 하단탭:  bg-[#0A1628] border-t border-[#1E3355]
               활성: text-[#00D4AA], 비활성: text-[#64748B]
               탭 4개: Home(녹음) / Notes / Brain(그래프) / Profile

데스크톱 사이드바: w-60 bg-[#0A1628] border-r border-[#1E3355]
```

---

## 🧠 HERO SECTION (랜딩 페이지)

### 3D 소스
```
상태: Spline 유료 에셋 → 무료 대안 탐색 중
대안 1: Spline Community에서 무료 brain/neural 3D 검색
대안 2: Three.js 코드 기반 뉴런 네트워크 파티클 애니메이션
       → 점(노드)들이 선(엣지)으로 연결되며 천천히 부유하는 효과
       → 색상: #00D4AA 점 + #00D4AA/30 선
       → 마우스 움직임에 반응 (가까운 노드가 밝아짐)
```

### 히어로 구조
```
배경: #0A1628 (다크)
3D/애니메이션: 전체 화면
텍스트 오버레이: 흰색
헤드라인: "Your thoughts, organized by AI."
서브헤드: "Speak. Dream Brain listens, transcribes, and connects your ideas."
CTA: bg-[#00D4AA] "Start Recording"
```

---

## 📱 KEY SCREENS STRUCTURE

### 1. 홈 / 녹음 (가장 중요한 화면)
```
[상단바: 로고 + 검색 + 프로필]
[최근 녹음 피드: Note Card 리스트]
[하단 중앙: 거대한 녹음 버튼 120px — 숨쉬는 애니메이션]
→ 앱 열면 1초 안에 녹음 시작 가능해야 함
```

### 2. 녹음 상세
```
[오디오 플레이어: 웨이브폼 바 + 재생/일시정지 + 배속 토글]
[AI 요약 카드: 2-3문장 요약]
[전체 트랜스크립트: 깔끔한 본문 텍스트]
[관련 노트: 가로 스크롤 카드]
[액션 아이템: 체크리스트 (Dream Planner로 전송 가능)]
```

### 3. 브레인 뷰 (3D 지식 그래프)
```
[풀스크린 3D: Three.js/React Three Fiber]
[노드: 원, 크기=연결 수, 색상=카테고리]
[엣지: 선, 투명도=연결 강도]
[클러스터: AI가 자동 그룹핑]
[하단 시트: 리스트 뷰 토글]
[인사이트 패널: "이번 달 [주제]를 12번 말했어요"]
```

### 4. 검색
```
[큰 검색 입력란]
[자연어 검색: "지난주 마케팅에 대해 뭐라고 했지?"]
[필터 칩: 전체 / 아이디어 / 할일 / 사람 / 프로젝트 / 즐겨찾기]
```

---

## ✨ ANIMATION & INTERACTION

### 핵심 인터랙션
```
앱 실행 → 녹음: 스플래시 없음. 캐시된 홈 로드. 1초 미만.
녹음 → 트랜스크립트: 쉬머 스켈레톤(500ms) → 텍스트 페이드인(300ms) → 태그 팝(1.5초 후)
노트 삭제: 왼쪽 스와이프 → 빨간 영역 → 카드 축소(250ms) → Undo 토스트(5초)
그래프 노드 탭: 연결된 노드 밝아짐 + 미연결 dim(0.15) → 카메라 이동(500ms spring)
```

### 트랜지션
```
빠름: 150ms ease — 버튼, 토글
기본: 250ms ease — 카드, 모달
느림: 400ms cubic-bezier(0.4, 0, 0.2, 1) — 페이지 전환
```

---

## 🚫 절대 하지 말 것

1. 라이트 테마를 기본으로 쓰지 말 것 — Dream Brain은 다크 퍼스트
2. 녹음 버튼을 작게 만들지 말 것 — 화면에서 가장 큰 요소여야 함
3. Primary 외의 강조색 추가 금지
4. 여백 줄이지 말 것
5. 시스템 폰트 사용 금지 — Pretendard/Inter 필수
6. 복잡한 UI 만들지 말 것 — Apple Voice Memos 수준의 단순함
7. 정리 시스템을 사용자에게 요구하지 말 것 — AI가 자동 분류

## ✅ 항상 지킬 것

1. 모든 인터랙티브 요소: 최소 44px × 44px
2. 색상 대비: WCAG AA 이상
3. 모바일 퍼스트
4. 접근성: alt text, aria-label
5. 로딩: skeleton UI (spinner 금지)
6. 빈 상태: "Your brain starts here. Record your first thought."
7. 아이콘: Lucide Icons only (24px, 1.5px stroke)

---

## 🔧 TECH STACK

```
Framework:      Next.js 15 (App Router)
UI Library:     shadcn/ui + Tailwind CSS v4
3D:             Three.js / React Three Fiber (뉴런 파티클) 또는 Spline embed (무료 발견 시)
Audio:          Web Audio API + MediaRecorder
Icons:          Lucide React
Font:           Pretendard + Inter + Plus Jakarta Sans + JetBrains Mono
State:          Zustand + TanStack Query v5
Auth/DB:        Supabase
AI:             OpenAI Whisper (STT) + GPT-4o/Claude (분석)
Deploy:         Vercel
```

---

*"바이브코딩 쓴 티가 나면 실패" — 모든 UI 판단 기준.*
