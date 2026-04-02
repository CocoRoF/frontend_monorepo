# shadcn/ui 통합 계획서

> **목표:** 모노레포 철학(packages → features → apps)을 유지하면서, `@xgen/ui`를 shadcn/ui 기반으로 재구축하여 접근성·확장성·개발 생산성을 근본적으로 강화한다.

---

## 목차

1. [현행 분석 요약](#1-현행-분석-요약)
2. [왜 shadcn/ui인가 — 모노레포 철학과의 정합성](#2-왜-shadcnui인가--모노레포-철학과의-정합성)
3. [아키텍처 설계 — 전체 구조도](#3-아키텍처-설계--전체-구조도)
4. [Phase 0: 인프라 구축](#4-phase-0-인프라-구축)
5. [Phase 1: 디자인 토큰 통합](#5-phase-1-디자인-토큰-통합)
6. [Phase 2: 기반 프리미티브 도입](#6-phase-2-기반-프리미티브-도입)
7. [Phase 3: 기존 @xgen/ui 컴포넌트 마이그레이션](#7-phase-3-기존-xgenui-컴포넌트-마이그레이션)
8. [Phase 4: Feature 패키지 마이그레이션](#8-phase-4-feature-패키지-마이그레이션)
9. [Phase 5: Canvas 영역 마이그레이션](#9-phase-5-canvas-영역-마이그레이션)
10. [의존성 관리 전략](#10-의존성-관리-전략)
11. [SCSS → Tailwind CSS 전환 전략](#11-scss--tailwind-css-전환-전략)
12. [공존 전략 — SCSS와 Tailwind의 병행 운영](#12-공존-전략--scss와-tailwind의-병행-운영)
13. [Breaking Change 관리](#13-breaking-change-관리)
14. [파일 구조 최종 청사진](#14-파일-구조-최종-청사진)
15. [리스크 및 대응 방안](#15-리스크-및-대응-방안)
16. [Phase별 체크리스트](#16-phase별-체크리스트)
17. [결론](#17-결론)

---

## 1. 현행 분석 요약

### 1-1. 모노레포 3계층 구조

```
packages/   (인프라)    → ui, types, config, i18n, icons, api-client, auth-provider, canvas-*
features/   (기능)      → main-*, canvas-*, auth-*, root-* (35+ 패키지)
apps/       (조립)      → web (Next.js 16.2.1 + Turbopack)
```

### 1-2. 현재 `@xgen/ui` 패키지 현황

| 항목 | 현재 상태 |
|------|----------|
| **컴포넌트 수** | 17개 + 1 hook (`useToast`) |
| **스타일링** | SCSS Modules (`.module.scss`) + `_variables.scss` 디자인 토큰 |
| **빌드** | 빌드 없음 — 소스 TS를 Next.js `transpilePackages`로 직접 소비 |
| **접근성 (a11y)** | 직접 구현 (ESC 닫기, role 등 부분적) |
| **헤드리스 기반** | 없음 — 모든 컴포넌트가 커스텀 빌드 |
| **외부 의존** | `framer-motion` (애니메이션), 나머지 내부 패키지 |
| **카테고리** | layout(2), feedback(3+hook), data-display(4), inputs(5), navigation(3+compound) |

### 1-3. 디자인 토큰 현황 — 3중 단절 문제

현재 디자인 토큰이 **세 곳에 분산되어 일관성이 깨져 있다:**

| 위치 | 형식 | 문제 |
|------|------|------|
| `packages/ui/src/styles/_variables.scss` | SCSS 변수 (`$gray-500`) | SCSS import 필요, CSS에서 직접 사용 불가 |
| `apps/web/src/app/globals.css` | CSS Custom Properties (`--color-gray-500`) | 값이 SCSS와 미묘하게 다름 (gray-100: `#f1f3f5` vs `#f2f4f7`) |
| `features/main-Dashboard/src/styles/` | 독자적 SCSS 변수 53개 | 위 둘과 별개의 토큰 시스템 |
| 인라인 스타일 (PromptStorage, ToolStorage, Documents) | 하드코딩 hex 값 | 토큰 미사용 |

### 1-4. Feature 패키지의 두 세계

| 영역 | `@xgen/ui` 사용 | 스타일링 방식 | 주요 문제 |
|------|-----------------|-------------|----------|
| **`main-*` Features** | O (ContentArea, FilterTabs, Button, SearchInput, EmptyState) | 인라인 JS 스타일 + SCSS Modules 혼재 | 하드코딩 hex 색상, 디자인 토큰 미사용 |
| **`canvas-*` Features** | ✗ (전혀 사용하지 않음) | 100% SCSS Modules | `@xgen/ui`와 완전 분리, 모달/탭/드롭다운 자체 구현 |

### 1-5. `@xgen/ui`에 없어서 Feature가 직접 만드는 것들

| 누락 프리미티브 | 자체구현 위치 | 발견 횟수 |
|----------------|-------------|----------|
| **Table / DataTable** | main-Dashboard (raw `<table>`) | 1+ |
| **Select / Combobox** | canvas-ai-generator, workflow-tester (raw `<select>`) | 2+ |
| **RadioGroup** | canvas-deploy (raw `<input type="radio">`) | 1+ |
| **Dialog (headless)** | canvas-node-detail, canvas-deploy, canvas-document-drop, canvas-sidebar-templates (모두 `createPortal` 직접 구현) | 4+ |
| **Tabs (headless)** | canvas-deploy, canvas-sidebar-nodes (수동 tab 전환) | 3+ |
| **Badge** | Documents, AuthProfile (인라인 스타일 직접 구현) | 2+ |
| **Textarea** | Chat Features (multiline input) | 2+ |
| **Skeleton / Loading** | Dashboard + 3개 이상 Feature (커스텀 스피너) | 4+ |
| **Tooltip** | 없음 (필요하지만 부재) | — |
| **Accordion / Collapsible** | canvas-sidebar-nodes (접이식 리스트) | 1+ |

### 1-6. 인라인 SVG 아이콘 중복

`@xgen/icons`가 존재함에도 불구하고:
- main-ChatCurrent: 11개 인라인 SVG
- main-PromptStorage: 5개 인라인 SVG
- main-Documents: 4개 인라인 SVG
- main-ToolStorage: 4개 인라인 SVG

**총 24개 이상의 인라인 SVG가 `@xgen/icons`로 이관 가능.**

---

## 2. 왜 shadcn/ui인가 — 모노레포 철학과의 정합성

### 2-1. shadcn/ui가 우리 철학에 맞는 이유

| 모노레포 원칙 | shadcn/ui 특성 | 정합성 |
|-------------|---------------|--------|
| **packages는 공유 인프라** | shadcn 컴포넌트는 `packages/ui`에 소스로 적재 — 라이브러리가 아니라 소유하는 코드 | ⭕ `@xgen/ui`를 소스 코드로 소유하는 현재 방식과 동일 |
| **Feature는 서로 import 안 함** | 모든 Feature가 `@xgen/ui`만 import — shadcn 도입해도 이 방향 유지 | ⭕ 의존 방향 불변 |
| **App은 조립만** | 변경 없음 — App은 Feature를 등록/조합할 뿐 | ⭕ |
| **`@xgen/ui`에서 import** | shadcn 컴포넌트가 `@xgen/ui`로 통합되어 기존 import 경로 유지 가능 | ⭕ |
| **소스 코드 소유** | shadcn은 코드를 복사하여 소유 — npm 의존이 아님 | ⭕ 커스터마이징 자유도 최대 |
| **빌드 없이 소비** | 현재 `transpilePackages`로 소스 직접 소비 — shadcn도 동일 패턴 | ⭕ |

### 2-2. shadcn/ui가 해결하는 문제

| 현재 문제 | shadcn 해결책 |
|----------|--------------|
| **접근성 부분 구현** | Radix UI 프리미티브 기반 — WAI-ARIA 완전 준수 (키보드, 스크린리더, 포커스 트랩) |
| **프리미티브 부족** (Table, Select, Tabs, Dialog 등) | shadcn이 40+ 프리미티브 제공 — 자체구현 제거 가능 |
| **디자인 토큰 3중 단절** | Tailwind CSS + CSS Custom Properties로 단일 토큰 시스템 통합 |
| **SCSS Modules 격리 문제** | Tailwind utility-first로 전환 — 스타일이 컴포넌트와 원자적으로 결합 |
| **CVA 미사용** | shadcn은 CVA + `cn()` 패턴으로 variant 관리 표준화 |
| **Feature 간 스타일 불일치** | 동일 프리미티브 사용으로 시각적 일관성 자동 확보 |

### 2-3. shadcn/ui가 아닌 대안을 배제한 이유

| 대안 | 배제 이유 |
|------|----------|
| **MUI (Material UI)** | 레거시 앱이 MUI v7 + Emotion — 번들 크기 크고, 모노레포 SCSS 토큰과 이질적 |
| **Radix UI 직접 사용** | shadcn이 이미 Radix 위에 variant + 스타일을 얹어 놓음 — 직접 조립할 필요 없음 |
| **Headless UI (Tailwind Labs)** | 프리미티브 수가 적고, Radix만큼 세밀한 접근성 제어 불가 |
| **현행 SCSS 유지 + 자체 확장** | 접근성, 프리미티브 부족 문제 해결에 인력·시간 과다 소요 |

---

## 3. 아키텍처 설계 — 전체 구조도

### 3-1. 변경 후 의존성 흐름

```
apps/web
├── components.json  (shadcn CLI — app-level 블록용)
├── tailwind.config  (Tailwind CSS v4 — 전역 설정은 @xgen/ui에 위임)
└── src/app/globals.css → @import "@xgen/ui/styles" (단일 진입점)

packages/ui  ← shadcn 컴포넌트의 본거지
├── components.json  (shadcn CLI — 프리미티브 설치 대상)
├── src/
│   ├── styles/
│   │   └── globals.css       ← 디자인 토큰 (CSS Custom Properties)
│   ├── lib/
│   │   └── utils.ts          ← cn() 유틸리티
│   ├── primitives/           ← shadcn CLI가 생성한 순수 프리미티브
│   │   ├── button.tsx
│   │   ├── dialog.tsx
│   │   ├── table.tsx
│   │   ├── tabs.tsx
│   │   ├── select.tsx
│   │   └── ...
│   ├── components/           ← XGEN 비즈니스 조합 컴포넌트 (기존 + 신규)
│   │   ├── content-area.tsx
│   │   ├── resource-card.tsx
│   │   ├── sidebar/
│   │   └── ...
│   └── index.ts              ← 배럴 export (하위 호환)
└── package.json

features/*
├── @xgen/ui의 primitives + components만 import
├── @xgen/types의 인터페이스 구현
└── 자체 SCSS 모듈 → 점진적 Tailwind 전환

apps/web
├── features.ts에서 Feature 등록만
└── 비즈니스 코드 없음
```

### 3-2. 핵심 설계 원칙

```
1. @xgen/ui는 단일 디자인 시스템의 유일한 출구다.
   → shadcn 프리미티브도, XGEN 조합 컴포넌트도, 디자인 토큰도 전부 @xgen/ui에서 나간다.
   → Feature는 @xgen/ui만 import한다. Radix를 직접 import하지 않는다.

2. 프리미티브와 조합 컴포넌트를 구분한다.
   → primitives/ = shadcn CLI가 생성한 순수 UI 원자 (Button, Dialog, Table, ...)
   → components/ = XGEN 도메인 로직이 포함된 조합 (ContentArea, ResourceCard, Sidebar, ...)

3. 디자인 토큰은 CSS Custom Properties 하나로 통합한다.
   → SCSS 변수, CSS 변수, 하드코딩 hex → 모두 CSS Custom Properties로 수렴
   → Tailwind CSS가 이 CSS 변수를 소비한다

4. 하위 호환을 유지한다.
   → 기존 import { ContentArea } from '@xgen/ui' 는 깨지지 않는다
   → 점진적 마이그레이션 — Phase별로 Feature 단위 전환
```

---

## 4. Phase 0: 인프라 구축

> **목표:** Tailwind CSS v4 + shadcn CLI 환경을 모노레포에 세팅한다. 기존 코드에 영향 없이 새 인프라만 추가한다.

### 4-1. Tailwind CSS v4 설치

```bash
# 루트에서
pnpm add -D tailwindcss @tailwindcss/postcss --filter @xgen/web

# packages/ui에도 peer dependency 추가
cd packages/ui
# package.json에 수동 추가 (아래 참조)
```

**`apps/web/postcss.config.mjs`** 수정:
```js
/** @type {import('postcss-load-config').Config} */
const config = {
  plugins: {
    '@tailwindcss/postcss': {},
  },
};
export default config;
```

### 4-2. Tailwind CSS v4 설정 — CSS-first 접근

Tailwind CSS v4는 `tailwind.config.*` 파일 대신 **CSS 파일에서 직접 설정**한다.

**`packages/ui/src/styles/globals.css`** (신규 생성):
```css
@import "tailwindcss";

/*
 * ─── XGEN Design Tokens ───
 * 모든 디자인 토큰의 단일 진입점 (Single Source of Truth)
 * Figma XGEN-BO-Design과 1:1 매핑
 */

@theme {
  /* ─── Colors ─── */
  --color-gray-50: #f8f9fa;
  --color-gray-100: #f2f4f7;
  --color-gray-200: #e4e7ec;
  --color-gray-300: #d0d5dd;
  --color-gray-400: #abb1ba;
  --color-gray-500: #7a7f89;
  --color-gray-600: #40444d;
  --color-gray-700: #282b31;
  --color-gray-800: #1d1f23;
  --color-gray-900: #17181c;

  --color-primary: #305eeb;
  --color-primary-start: #305eeb;
  --color-primary-end: #783ced;

  --color-success: #2eb146;
  --color-warning: #f59f00;
  --color-error: #e03131;
  --color-info: #305eeb;

  /* ─── Backgrounds ─── */
  --color-background: #ffffff;
  --color-foreground: #1d1f23;
  --color-card: #ffffff;
  --color-muted: #f8f9fa;
  --color-muted-foreground: #7a7f89;
  --color-accent: #f2f4f7;
  --color-accent-foreground: #1d1f23;
  --color-destructive: #e03131;
  --color-border: #e4e7ec;
  --color-input: #e4e7ec;
  --color-ring: #305eeb;
  --color-overlay: rgba(0, 0, 0, 0.5);

  /* ─── Typography ─── */
  --font-family-sans: 'Pretendard', -apple-system, BlinkMacSystemFont, system-ui, sans-serif;
  --font-family-mono: 'Fira Code', 'Consolas', monospace;

  /* ─── Border Radius ─── */
  --radius-sm: 6px;
  --radius-md: 8px;
  --radius-lg: 12px;
  --radius-xl: 16px;
  --radius-full: 9999px;

  /* ─── Shadows ─── */
  --shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.05);
  --shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  --shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
  --shadow-xl: 0 20px 25px -5px rgba(0, 0, 0, 0.1);

  /* ─── Z-index ─── */
  --z-dropdown: 100;
  --z-sticky: 200;
  --z-modal: 300;
  --z-popover: 400;
  --z-overlay: 500;
  --z-toast: 600;

  /* ─── Spacing aliases ─── */
  --spacing-xs: 0.25rem;
  --spacing-sm: 0.5rem;
  --spacing-md: 1rem;
  --spacing-lg: 1.5rem;
  --spacing-xl: 2rem;
  --spacing-2xl: 3rem;

  /* ─── Modal sizes ─── */
  --modal-sm: 400px;
  --modal-md: 560px;
  --modal-lg: 720px;
  --modal-xl: 960px;

  /* ─── Transition ─── */
  --transition-fast: 150ms;
  --transition-base: 250ms;
  --transition-slow: 350ms;
}
```

**`apps/web/src/app/globals.css`** 수정:
```css
@import "../../packages/ui/src/styles/globals.css";
/* → 또는 @import "@xgen/ui/styles"; (exports map 통해) */

body {
  background: var(--color-background);
  color: var(--color-foreground);
  font-family: var(--font-family-sans);
}

* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}
```

### 4-3. `cn()` 유틸리티 설치

```bash
pnpm add clsx tailwind-merge --filter @xgen/ui
```

**`packages/ui/src/lib/utils.ts`** (신규 생성):
```typescript
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

### 4-4. shadcn CLI 설정

**`packages/ui/components.json`** (신규 생성):
```json
{
  "$schema": "https://ui.shadcn.com/schema.json",
  "style": "default",
  "rsc": true,
  "tsx": true,
  "tailwind": {
    "config": "",
    "css": "src/styles/globals.css",
    "baseColor": "neutral",
    "cssVariables": true
  },
  "iconLibrary": "lucide",
  "aliases": {
    "components": "@xgen/ui/primitives",
    "utils": "@xgen/ui/lib/utils",
    "hooks": "@xgen/ui/hooks",
    "lib": "@xgen/ui/lib",
    "ui": "@xgen/ui/primitives"
  }
}
```

**`apps/web/components.json`** (신규 생성):
```json
{
  "$schema": "https://ui.shadcn.com/schema.json",
  "style": "default",
  "rsc": true,
  "tsx": true,
  "tailwind": {
    "config": "",
    "css": "../../packages/ui/src/styles/globals.css",
    "baseColor": "neutral",
    "cssVariables": true
  },
  "iconLibrary": "lucide",
  "aliases": {
    "components": "@/components",
    "hooks": "@/hooks",
    "lib": "@/lib",
    "utils": "@xgen/ui/lib/utils",
    "ui": "@xgen/ui/primitives"
  }
}
```

### 4-5. `packages/ui/package.json` 업데이트

```jsonc
{
  "name": "@xgen/ui",
  "version": "0.0.0",
  "private": true,
  "main": "src/index.ts",
  "types": "src/index.ts",
  "exports": {
    ".": "./src/index.ts",
    "./primitives/*": "./src/primitives/*.tsx",
    "./components/*": "./src/components/*.tsx",
    "./lib/*": "./src/lib/*.ts",
    "./hooks/*": "./src/hooks/*.ts",
    "./styles": "./src/styles/globals.css",
    "./styles/*": "./src/styles/*"
  },
  "dependencies": {
    "@xgen/i18n": "workspace:*",
    "@xgen/icons": "workspace:*",
    "@xgen/types": "workspace:*",
    "class-variance-authority": "^0.7.1",
    "clsx": "^2.1.0",
    "framer-motion": "^11.0.0",
    "lucide-react": "^0.400.0",
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "tailwind-merge": "^2.5.0"
  },
  "devDependencies": {
    "@types/react": "^19",
    "@types/react-dom": "^19",
    "sass": "^1.77.0"
  },
  "peerDependencies": {
    "react": "^18 || ^19",
    "react-dom": "^18 || ^19"
  }
}
```

### 4-6. `next.config.ts` 업데이트

`sassOptions.includePaths`에 변경 없음. `transpilePackages`에 이미 `@xgen/ui` 포함.
Tailwind CSS v4는 PostCSS 플러그인으로 동작하므로 Next.js 설정 변경 불필요.

### 4-7. Phase 0 완료 기준

- [ ] `pnpm install` 성공
- [ ] `pnpm dev:web` 실행 시 기존 화면 정상 렌더링 (SCSS 깨지지 않음)
- [ ] `cn()` 유틸리티 import 가능
- [ ] `packages/ui/src/styles/globals.css`에서 Tailwind 디렉티브 동작 확인
- [ ] `shadcn add button` 실행 시 `packages/ui/src/primitives/button.tsx` 생성 확인

---

## 5. Phase 1: 디자인 토큰 통합

> **목표:** 3중 단절된 디자인 토큰을 CSS Custom Properties 하나로 통합한다.

### 5-1. 현재 → 목표 매핑

```
현재 (3곳에 분산):
  1. packages/ui/src/styles/_variables.scss  → SCSS 변수
  2. apps/web/src/app/globals.css            → CSS Custom Properties (값 불일치)
  3. features/main-Dashboard/src/styles/     → 독자적 SCSS 변수 53개
  4. 인라인 스타일 하드코딩                     → #305EEB, #E5E7EB 등

목표 (1곳으로 통합):
  packages/ui/src/styles/globals.css → CSS Custom Properties (Tailwind @theme)
    ↓ Tailwind가 소비
    ↓ SCSS 호환 래퍼 제공 (전환기)
    ↓ Feature가 직접 참조 가능
```

### 5-2. SCSS 호환 브릿지

전환 기간 동안 SCSS 변수가 CSS 변수를 참조하도록 브릿지 파일을 만든다:

**`packages/ui/src/styles/_variables.scss`** 수정:
```scss
// ──────────────────────────────────────────────
// SCSS → CSS Custom Properties 브릿지
// Phase 1~3 동안 기존 SCSS 코드의 하위 호환 유지
// 최종적으로 이 파일은 삭제된다.
// ──────────────────────────────────────────────

// Colors
$gray-50:  var(--color-gray-50);
$gray-100: var(--color-gray-100);
$gray-200: var(--color-gray-200);
$gray-300: var(--color-gray-300);
$gray-400: var(--color-gray-400);
$gray-500: var(--color-gray-500);
$gray-600: var(--color-gray-600);
$gray-700: var(--color-gray-700);
$gray-800: var(--color-gray-800);
$gray-900: var(--color-gray-900);

$primary: var(--color-primary);
$success: var(--color-success);
$warning: var(--color-warning);
$error:   var(--color-error);
$info:    var(--color-info);

// ... 나머지 토큰도 동일 패턴
```

> **주의:** `var()`는 SCSS 함수 인자로 사용할 수 없다 (`lighten($primary, 10%)` 불가). 이런 SCSS 함수 사용처를 먼저 식별하고 CSS 네이티브 방식(`color-mix()`, `oklch()`)으로 대체한다.

### 5-3. apps/web/globals.css 정리

기존 CSS 변수 정의를 모두 제거하고 `@xgen/ui/styles`에서 가져온다:
```css
@import "@xgen/ui/styles";

/* app-level overrides만 남긴다 */
body {
  background: var(--color-background);
  color: var(--color-foreground);
  font-family: var(--font-family-sans);
}
```

### 5-4. Dashboard 독자 토큰 제거

`features/main-Dashboard/src/styles/dashboard.module.scss`의 53개 독자 변수를 `@xgen/ui/styles`의 변수로 교체한다.

### 5-5. Phase 1 완료 기준

- [ ] 디자인 토큰이 `packages/ui/src/styles/globals.css`에만 정의
- [ ] SCSS 브릿지가 `var()` 참조로 전환
- [ ] `apps/web/globals.css`에서 중복 토큰 삭제
- [ ] Dashboard 독자 토큰 53개 제거
- [ ] 전체 화면 시각적 회귀 없음

---

## 6. Phase 2: 기반 프리미티브 도입

> **목표:** Feature가 자체 구현한 누락 프리미티브를 shadcn으로 대체한다.

### 6-1. 도입 우선순위

우선순위는 **자체구현 횟수 × 복잡도 × 접근성 영향**으로 결정:

| 순위 | shadcn 프리미티브 | Radix 기반 | 대체 대상 | 도입 이유 |
|------|-----------------|-----------|----------|----------|
| **1** | **Dialog** | `@radix-ui/react-dialog` | 4곳의 createPortal 직접 구현 | 접근성 위험 가장 큼 (포커스 트랩, ESC, aria) |
| **2** | **Tabs** | `@radix-ui/react-tabs` | 3곳의 수동 탭 전환 | 키보드 내비게이션 누락 |
| **3** | **Table** | — (순수 HTML + 스타일) | Dashboard raw table | 데이터 표시 핵심 |
| **4** | **Select** | `@radix-ui/react-select` | 2곳의 raw `<select>` | 접근성 + 커스터마이징 |
| **5** | **Input** | — | 로우 `<input>` 사용처 정리 | 기반 프리미티브 |
| **6** | **Textarea** | — | Chat multiline input | 기반 프리미티브 |
| **7** | **Badge** | — | 인라인 스타일 뱃지 | 시각적 일관성 |
| **8** | **RadioGroup** | `@radix-ui/react-radio-group` | canvas-deploy raw radio | 접근성 |
| **9** | **Tooltip** | `@radix-ui/react-tooltip` | 현재 없음, 필요 | 접근성 필수 |
| **10** | **Skeleton** | — | 커스텀 스피너 4곳+ | 로딩 UX 통일 |
| **11** | **Accordion** | `@radix-ui/react-accordion` | sidebar-nodes 접이식 | 접근성 |
| **12** | **DropdownMenu** | `@radix-ui/react-dropdown-menu` | 기존 커스텀 DropdownMenu 대체 | 접근성 강화 |
| **13** | **Popover** | `@radix-ui/react-popover` | SidebarPopover 대체 | 접근성 |
| **14** | **Sheet** | `@radix-ui/react-dialog` | 슬라이드 패널 지원 | Canvas 사이드패널 |
| **15** | **Toast (Sonner)** | — | 기존 Toast 시스템 대체 | DX 향상 |
| **16** | **Form** | react-hook-form | 향후 폼 관리 | 검증 통일 |

### 6-2. 설치 명령 및 파일 위치

```bash
# packages/ui 디렉토리에서 실행
cd packages/ui

# 핵심 프리미티브 일괄 설치
pnpm dlx shadcn@latest add dialog tabs table select input textarea badge \
  radio-group tooltip skeleton accordion dropdown-menu popover sheet \
  -c .
```

shadcn CLI가 생성하는 파일 위치 (components.json의 aliases 설정에 따라):
```
packages/ui/src/primitives/
├── dialog.tsx         ← @radix-ui/react-dialog 래퍼
├── tabs.tsx           ← @radix-ui/react-tabs 래퍼
├── table.tsx          ← 순수 HTML table + 스타일
├── select.tsx         ← @radix-ui/react-select 래퍼
├── input.tsx          ← 스타일된 input
├── textarea.tsx       ← 스타일된 textarea
├── badge.tsx          ← CVA variant 뱃지
├── radio-group.tsx    ← @radix-ui/react-radio-group 래퍼
├── tooltip.tsx        ← @radix-ui/react-tooltip 래퍼
├── skeleton.tsx       ← 로딩 스켈레톤
├── accordion.tsx      ← @radix-ui/react-accordion 래퍼
├── dropdown-menu.tsx  ← @radix-ui/react-dropdown-menu 래퍼
├── popover.tsx        ← @radix-ui/react-popover 래퍼
└── sheet.tsx          ← @radix-ui/react-dialog 기반 서랍
```

### 6-3. 아이콘 통합 전략

shadcn은 기본적으로 `lucide-react`를 아이콘으로 사용한다. 우리는 `@xgen/icons`가 있다.

**전략: `@xgen/icons`를 유지하되, `lucide-react`를 내부적으로 re-export**

```typescript
// packages/icons/src/index.ts에 추가
export { ChevronDown, ChevronRight, X, Check, Search, ... } from 'lucide-react';
```

이렇게 하면:
- shadcn 프리미티브가 `lucide-react`를 직접 사용 → 문제 없음
- Feature는 계속 `@xgen/icons`에서 import → 규칙 유지
- Lucide 아이콘이 필요하면 `@xgen/icons`를 거쳐 사용

### 6-4. index.ts 배럴 export 확장

```typescript
// packages/ui/src/index.ts

// ─── 기존 컴포넌트 (하위 호환) ───
export { ContentArea } from './components/content-area';
export { Modal } from './components/modal';
export { Button } from './components/button';
// ... 기존 17개

// ─── shadcn 프리미티브 (신규) ───
export {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
  DialogFooter, DialogTrigger, DialogClose
} from './primitives/dialog';

export {
  Tabs, TabsList, TabsTrigger, TabsContent
} from './primitives/tabs';

export {
  Table, TableHeader, TableBody, TableRow, TableHead, TableCell,
  TableFooter, TableCaption
} from './primitives/table';

export {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
  SelectGroup, SelectLabel
} from './primitives/select';

export { Input } from './primitives/input';
export { Textarea } from './primitives/textarea';
export { Badge } from './primitives/badge';
export { RadioGroup, RadioGroupItem } from './primitives/radio-group';
export { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from './primitives/tooltip';
export { Skeleton } from './primitives/skeleton';

export {
  Accordion, AccordionItem, AccordionTrigger, AccordionContent
} from './primitives/accordion';

export {
  DropdownMenu as DropdownMenuPrimitive,
  DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuLabel
} from './primitives/dropdown-menu';

export { Popover, PopoverTrigger, PopoverContent } from './primitives/popover';
export { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from './primitives/sheet';

// ─── 유틸리티 ───
export { cn } from './lib/utils';
```

### 6-5. Phase 2 완료 기준

- [ ] 16개 shadcn 프리미티브가 `packages/ui/src/primitives/`에 설치됨
- [ ] 모든 프리미티브가 `@xgen/ui` index.ts에서 export됨
- [ ] `@xgen/icons`에 lucide-react re-export 추가됨
- [ ] `pnpm dev:web` 정상 동작 (기존 기능 회귀 없음)
- [ ] 새 프리미티브를 사용하는 데모 페이지 1개 작성

---

## 7. Phase 3: 기존 @xgen/ui 컴포넌트 마이그레이션

> **목표:** 기존 17개 커스텀 컴포넌트를 shadcn 프리미티브 위에 재구축한다.

### 7-1. 마이그레이션 전략 — Wrapper 패턴

기존 컴포넌트의 **API(Props)를 유지**하면서 내부 구현을 shadcn 프리미티브로 교체한다.
이렇게 하면 Feature 코드 변경 없이 마이그레이션 가능.

```
Before:
  ContentArea.tsx → SCSS Module → raw div

After:
  ContentArea.tsx → cn() + Tailwind → 동일 Props, 동일 외부 API
```

### 7-2. 컴포넌트별 마이그레이션 계획

#### 필수 마이그레이션 (내부 구현 교체)

| 기존 컴포넌트 | shadcn 프리미티브 | 작업 내용 |
|-------------|-----------------|----------|
| **Button** | `primitives/button` 기반 재구축 | CVA variant 전환, 기존 5 variant 유지 |
| **Modal** | `Dialog` 프리미티브 위에 재구축 | Props 호환 래퍼 (`size`, `onClose`, `header/body/footer`) |
| **DropdownMenu** | `DropdownMenuPrimitive` 위에 재구축 | 기존 `placement`, `items` API 유지 |
| **FilterTabs** | `Tabs` 프리미티브 위에 재구축 | `count`, `variant` 등 기존 props 유지 |
| **Toggle** | shadcn `Switch` 프리미티브 도입 후 재구축 | 기존 3 sizes, label 위치 유지 |
| **SearchInput** | `Input` 프리미티브 + 커스텀 래퍼 | debounce, clear button, icon 유지 |
| **FormField** | shadcn `Form` 패턴 참조하여 재구축 | label, error, hint 유지 |

#### 스타일만 전환 (기존 로직 유지)

| 기존 컴포넌트 | 작업 내용 |
|-------------|----------|
| **ContentArea** | SCSS → Tailwind 클래스 전환 (구조 불변) |
| **ResizablePanel** | SCSS → Tailwind 전환 (드래그 로직 유지) |
| **EmptyState** | SCSS → Tailwind 전환 |
| **Card** | SCSS → Tailwind 전환 |
| **CardGrid** | SCSS → Tailwind 전환 (CSS Grid 유지) |
| **ResourceCard** | SCSS → Tailwind 전환 + Badge 프리미티브 활용 |
| **ResourceCardGrid** | SCSS → Tailwind + Skeleton 프리미티브 로딩 상태 |

#### 별도 검토 필요

| 기존 컴포넌트 | 판단 |
|-------------|------|
| **Toast 시스템** (ToastProvider, useToast, ConfirmToast) | `sonner` 라이브러리로 전체 교체 검토 (shadcn의 기본 Toast 솔루션) |
| **Sidebar** (compound: Sidebar, SidebarSection, SidebarPopover) | 복잡도 높음 — framer-motion 애니메이션 포함, 단계적 전환 |

### 7-3. Button 마이그레이션 예시

**Before (현재 Button — SCSS Module):**
```tsx
import styles from './button.module.scss';

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', ... }, ref) => {
    const classNames = `${styles.button} ${styles[variant]} ${styles[size]}`;
    return <button className={classNames} ref={ref} />;
  }
);
```

**After (shadcn 기반 — CVA + Tailwind):**
```tsx
import { cn } from '../lib/utils';
import { cva, type VariantProps } from 'class-variance-authority';

const buttonVariants = cva(
  'inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        primary: 'bg-primary text-white hover:bg-primary/90',
        secondary: 'bg-gray-100 text-gray-800 hover:bg-gray-200',
        outline: 'border border-border bg-transparent hover:bg-accent',
        ghost: 'hover:bg-accent hover:text-accent-foreground',
        danger: 'bg-error text-white hover:bg-error/90',
      },
      size: {
        sm: 'h-8 px-3 text-xs',
        md: 'h-10 px-4 text-sm',
        lg: 'h-12 px-6 text-base',
      },
    },
    defaultVariants: { variant: 'primary', size: 'md' },
  }
);

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => (
    <button className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />
  )
);
```

**Feature 코드는 변경 없음:**
```tsx
// 전후 동일
import { Button } from '@xgen/ui';
<Button variant="primary" size="md">저장</Button>
```

### 7-4. Phase 3 완료 기준

- [ ] 17개 기존 컴포넌트 모두 Tailwind + cn() 기반으로 전환
- [ ] 기존 Props 인터페이스 100% 하위 호환
- [ ] 모든 `.module.scss` 파일 삭제 (packages/ui 내부)
- [ ] Feature 코드 변경 없이 `pnpm dev:web` 정상 동작
- [ ] 접근성 테스트 통과 (Dialog 포커스 트랩, Tab 키보드 네비게이션 등)

---

## 8. Phase 4: Feature 패키지 마이그레이션

> **목표:** Feature의 자체구현 UI를 `@xgen/ui` 프리미티브로 교체하고, 인라인 스타일/SCSS를 정리한다.

### 8-1. 마이그레이션 우선순위 — main-* Features

| 순위 | Feature | 핵심 작업 | 난이도 |
|------|---------|----------|--------|
| **1** | **main-PromptStorage** | 인라인 JS 스타일 → Tailwind, 자체 카드 그리드 → ResourceCardGrid 활용 | 중 |
| **2** | **main-ToolStorage** | PromptStorage와 거의 동일 패턴 | 중 |
| **3** | **main-Documents** | 동일 패턴 + Badge 프리미티브 적용 | 중 |
| **4** | **main-Dashboard** | 독자 SCSS 변수 53개 제거, raw Table → Table 프리미티브 | 중 |
| **5** | **main-ChatCurrent** | 인라인 SVG 11개 → @xgen/icons, Textarea 프리미티브 적용 | 중 |
| **6** | **main-ChatHistory** | FilterTabs + 리스트 UI 정리 | 하 |
| **7** | **main-AuthProfile** | 이미 ResourceCard 사용 — Tailwind 전환만 | 하 |
| **8** | **나머지 main-*** | FAQ, ServiceRequest, Intro 페이지들 | 하 |
| **9** | **auth-LoginForm** | .module.css → Tailwind, Form 프리미티브 | 하 |
| **10** | **root-Landing-*** | Landing 페이지 6개 Feature | 하 |

### 8-2. Feature 마이그레이션 체크리스트 (Feature당)

```
□ 자체 구현 모달 → Dialog 프리미티브 교체
□ 자체 구현 탭 → Tabs 프리미티브 교체
□ 자체 구현 셀렉트 → Select 프리미티브 교체
□ raw <table> → Table 프리미티브 교체
□ 인라인 SVG → @xgen/icons 이관
□ 인라인 JS 스타일 → Tailwind 클래스
□ .module.scss → Tailwind 클래스 (또는 cn() 활용)
□ 하드코딩 hex 색상 → CSS 변수 / Tailwind 토큰 참조
□ 독자 디자인 토큰 → @xgen/ui/styles 토큰 사용
□ 컴포넌트화 미진 부분 → 분리 (README 6절 원칙)
```

### 8-3. 인라인 스타일 → Tailwind 전환 예시

**Before (main-PromptStorage):**
```tsx
const styles = {
  container: { padding: '24px', maxWidth: '1400px', margin: '0 auto' },
  card: { display: 'flex', flexDirection: 'column', padding: '20px',
          background: '#fff', border: '1px solid #E5E7EB', borderRadius: '12px' },
};
return <div style={styles.container}><div style={styles.card}>...</div></div>;
```

**After:**
```tsx
return (
  <div className="p-6 max-w-[1400px] mx-auto">
    <div className="flex flex-col p-5 bg-card border border-border rounded-lg">
      ...
    </div>
  </div>
);
```

### 8-4. Phase 4 완료 기준

- [ ] 모든 main-* Feature에서 인라인 JS 스타일 제거
- [ ] 인라인 SVG 24개 이상 → @xgen/icons 이관
- [ ] 자체구현 모달 4곳 → Dialog 교체
- [ ] 자체구현 탭 3곳 → Tabs 교체
- [ ] 하드코딩 hex 색상 0개
- [ ] Feature 내 독자 디자인 토큰 0개

---

## 9. Phase 5: Canvas 영역 마이그레이션

> **목표:** `@xgen/ui`를 전혀 사용하지 않는 canvas-* Features를 점진적으로 프리미티브 활용으로 전환한다.

### 9-1. Canvas 영역의 특수성

Canvas Features는 의도적으로 `@xgen/ui`를 사용하지 않는다:
- 캔버스 에디터는 고도로 특화된 UI가 필요
- 렌더링 성능이 중요 (노드 수백 개 동시 렌더)
- ReactFlow 기반으로 자체 렌더링 파이프라인 보유

**따라서 canvas-*는 전면 전환이 아닌 선택적 프리미티브 도입으로 접근한다.**

### 9-2. Canvas 마이그레이션 대상

| Feature | 프리미티브 교체 | 유지 |
|---------|---------------|------|
| **canvas-node-detail** | 자체 모달 → Dialog | 노드 상세 UI는 SCSS 유지 가능 |
| **canvas-deploy** | 자체 모달 → Dialog, raw radio → RadioGroup, 자체 탭 → Tabs | |
| **canvas-document-drop** | 자체 모달 → Dialog | |
| **canvas-sidebar-templates** | 자체 모달 → Dialog | |
| **canvas-sidebar-nodes** | 자체 탭 → Tabs, raw input → SearchInput | 노드 리스트 SCSS 유지 가능 |
| **canvas-ai-generator** | raw select → Select | |
| **canvas-execution** | 14개 SCSS Module — 대부분 유지 | 실행 패널은 고도 특화 UI |
| **canvas-core** | 변경 최소화 | ReactFlow 기반 렌더링은 터치 안 함 |
| **canvas-header** | 변경 최소화 | |
| **canvas-history** | 변경 최소화 | |

### 9-3. Canvas package.json 의존성 추가

canvas-* Features가 `@xgen/ui`를 사용하려면 `package.json`에 의존성을 추가해야 한다:
```json
{
  "dependencies": {
    "@xgen/ui": "workspace:*"
  }
}
```

### 9-4. Phase 5 완료 기준

- [ ] canvas-* 내 자체구현 모달 4곳 → Dialog 교체
- [ ] canvas-deploy 탭/라디오 → Tabs, RadioGroup 교체
- [ ] canvas-sidebar-nodes 탭/검색 → Tabs, SearchInput 교체
- [ ] canvas-ai-generator select → Select 교체
- [ ] canvas-execution SCSS 건드리지 않음 (성능 민감)
- [ ] canvas-core ReactFlow 건드리지 않음

---

## 10. 의존성 관리 전략

### 10-1. Radix UI 패키지는 @xgen/ui에서만 관리

```
⭕ packages/ui/package.json에 @radix-ui/* 의존성
❌ features/*/package.json에 @radix-ui/* 직접 의존

→ Feature는 @xgen/ui 프리미티브만 import
→ Radix 버전 관리가 한 곳에서 이루어짐
```

### 10-2. 새 Radix 의존성 추가 시

shadcn CLI가 자동으로 `@xgen/ui/package.json`에 추가한다:
```bash
# 예: Combobox 프리미티브 추가
cd packages/ui
pnpm dlx shadcn@latest add combobox
# → @radix-ui/react-popover + cmdk 자동 추가
```

### 10-3. 의존성 트리 최종 형태

```
@xgen/ui
├── @radix-ui/react-dialog
├── @radix-ui/react-tabs
├── @radix-ui/react-select
├── @radix-ui/react-radio-group
├── @radix-ui/react-tooltip
├── @radix-ui/react-accordion
├── @radix-ui/react-dropdown-menu
├── @radix-ui/react-popover
├── class-variance-authority
├── clsx
├── tailwind-merge
├── lucide-react
├── framer-motion (기존 유지)
├── @xgen/types (workspace)
├── @xgen/i18n (workspace)
└── @xgen/icons (workspace)

features/*
├── @xgen/ui (workspace)     ← 유일한 UI 의존
├── @xgen/types (workspace)
├── @xgen/i18n (workspace)
├── @xgen/api-client (workspace)
└── react
```

---

## 11. SCSS → Tailwind CSS 전환 전략

### 11-1. 5단계 전환 절차 (컴포넌트 단위)

```
1. SCSS Module 파일 열기
2. 각 클래스의 속성을 Tailwind 유틸리티로 1:1 변환
3. 변환된 클래스를 cn()으로 조합
4. 시각적 동일성 확인 (Storybook 또는 눈으로)
5. .module.scss 파일 삭제
```

### 11-2. 변환 치트시트

| SCSS | Tailwind |
|------|----------|
| `padding: $spacing-4` (16px) | `p-4` |
| `margin-bottom: $spacing-2` (8px) | `mb-2` |
| `color: $text-primary` | `text-foreground` |
| `color: $text-secondary` | `text-muted-foreground` |
| `background: $bg-secondary` | `bg-muted` |
| `border: 1px solid $border-color` | `border border-border` |
| `border-radius: $radius-lg` | `rounded-lg` |
| `font-size: $font-size-sm` | `text-sm` |
| `font-weight: $font-weight-semibold` | `font-semibold` |
| `display: flex; gap: 8px` | `flex gap-2` |
| `display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr))` | `grid grid-cols-[repeat(auto-fill,minmax(320px,1fr))]` |
| `box-shadow: $shadow-sm` | `shadow-sm` |
| `transition: all $transition-fast` | `transition-all duration-150` |
| `z-index: $z-modal` | `z-[300]` (또는 커스텀 유틸리티) |

### 11-3. 반응형 규칙

```scss
// Before (SCSS)
.container {
  padding: 16px;
  @media (min-width: 768px) { padding: 24px; }
  @media (min-width: 1024px) { padding: 32px; }
}

// After (Tailwind)
<div className="p-4 md:p-6 lg:p-8">
```

### 11-4. 다크 모드 대비

현재 다크 모드는 없지만, CSS Custom Properties 기반 토큰으로 전환하면 향후 추가가 용이:
```css
@theme {
  --color-background: #ffffff;
  --color-foreground: #1d1f23;
}

/* 향후 다크 모드 추가 시 */
@media (prefers-color-scheme: dark) {
  :root {
    --color-background: #17181c;
    --color-foreground: #f8f9fa;
  }
}
```

---

## 12. 공존 전략 — SCSS와 Tailwind의 병행 운영

### 12-1. 왜 병행이 필요한가

80개 `.module.scss` 파일을 한 번에 전환하는 것은 비현실적이다.
전환 기간(Phase 1~5) 동안 SCSS와 Tailwind가 공존해야 한다.

### 12-2. 공존 규칙

```
1. 새로 작성하는 코드 → 반드시 Tailwind (cn() + 프리미티브)
2. 기존 SCSS → 해당 컴포넌트 수정 시 함께 전환 (기회주의적 마이그레이션)
3. 하나의 파일 안에서 SCSS + Tailwind 혼용 허용 (전환기 한정)
4. SCSS 브릿지(_variables.scss의 var() 참조)를 통해 토큰 일관성 유지
5. 새 .module.scss 파일 생성 금지 — Phase 0 이후
```

### 12-3. Tailwind가 SCSS를 인식하는 방법

Next.js + Turbopack은 PostCSS + Sass를 모두 처리할 수 있다:
- `.module.scss` → Sass 컴파일러 → CSS Modules
- `.tsx`의 `className` → Tailwind PostCSS 플러그인 → 유틸리티 생성

두 파이프라인은 독립적으로 동작하므로 충돌하지 않는다.

### 12-4. cn()과 SCSS Module 혼합 사용

```tsx
import styles from './legacy.module.scss';
import { cn } from '@xgen/ui';

// 전환기: SCSS 클래스와 Tailwind 클래스를 cn()으로 합성
<div className={cn(styles.container, 'p-4 flex gap-2')}>
```

---

## 13. Breaking Change 관리

### 13-1. API 하위 호환 보장 범위

| 보장됨 | 보장 안 됨 |
|--------|-----------|
| `import { Button } from '@xgen/ui'` 경로 유지 | SCSS 변수를 직접 import하는 Feature (`@use '../styles/variables'`) |
| 기존 Props 인터페이스 유지 (ButtonProps, ModalProps 등) | `.module.scss` 클래스명에 의존하는 외부 코드 |
| `@xgen/types` 인터페이스 불변 | `@xgen/ui/styles` export가 SCSS에서 CSS로 변경됨 |

### 13-2. 마이그레이션 가이드가 필요한 변경

1. **`@xgen/ui/styles` import 변경:**
   ```scss
   // Before
   @use '@xgen/ui/styles/variables' as *;

   // After
   @import '@xgen/ui/styles';           // CSS 파일
   // 또는 SCSS 브릿지 계속 사용
   @use '@xgen/ui/styles/variables' as *;  // Phase 동안 유지
   ```

2. **Toast 시스템 변경 (sonner 전환 시):**
   ```tsx
   // Before
   import { useToast } from '@xgen/ui';
   const { toast } = useToast();
   toast.success('완료');

   // After (API 동일하게 래퍼 제공)
   import { useToast } from '@xgen/ui';  // 내부적으로 sonner 사용
   const { toast } = useToast();
   toast.success('완료');  // 동일 API
   ```

---

## 14. 파일 구조 최종 청사진

```
packages/ui/
├── package.json
├── tsconfig.json
├── components.json              ← shadcn CLI 설정
└── src/
    ├── index.ts                 ← 배럴 export (하위 호환 + 신규)
    │
    ├── styles/
    │   ├── globals.css          ← ⭐ 단일 디자인 토큰 (CSS Custom Properties + @theme)
    │   └── _variables.scss      ← SCSS 브릿지 (전환기, 최종 삭제 예정)
    │
    ├── lib/
    │   └── utils.ts             ← cn() 유틸리티
    │
    ├── hooks/
    │   ├── use-toast.ts         ← Toast hook (sonner 래퍼)
    │   └── use-mobile.ts        ← 반응형 hook (필요 시)
    │
    ├── primitives/              ← shadcn CLI가 관리하는 순수 프리미티브
    │   ├── accordion.tsx
    │   ├── badge.tsx
    │   ├── button.tsx           ← shadcn 기본 Button (CVA 기반)
    │   ├── dialog.tsx
    │   ├── dropdown-menu.tsx
    │   ├── input.tsx
    │   ├── popover.tsx
    │   ├── radio-group.tsx
    │   ├── select.tsx
    │   ├── sheet.tsx
    │   ├── skeleton.tsx
    │   ├── switch.tsx
    │   ├── table.tsx
    │   ├── tabs.tsx
    │   ├── textarea.tsx
    │   └── tooltip.tsx
    │
    ├── components/              ← XGEN 도메인 조합 컴포넌트
    │   ├── content-area.tsx     ← Tailwind 전환됨
    │   ├── resizable-panel.tsx
    │   ├── empty-state.tsx
    │   ├── button.tsx           ← XGEN 확장 Button (5 variant + icon 슬롯)
    │   ├── search-input.tsx     ← Input 프리미티브 위에 debounce + clear
    │   ├── filter-tabs.tsx      ← Tabs 프리미티브 위에 count + variant
    │   ├── form-field.tsx       ← 기존 form wrapper
    │   ├── toggle.tsx           ← Switch 프리미티브 위에 라벨/사이즈
    │   ├── modal.tsx            ← Dialog 프리미티브 위에 size + header/footer
    │   ├── card.tsx
    │   ├── card-grid.tsx
    │   ├── resource-card.tsx
    │   ├── resource-card-grid.tsx
    │   ├── dropdown-menu.tsx    ← DropdownMenu 프리미티브 위에 기존 API 래퍼
    │   └── sidebar/
    │       ├── index.ts
    │       ├── sidebar.tsx
    │       ├── sidebar-section.tsx
    │       └── sidebar-popover.tsx
    │
    └── global.d.ts
```

---

## 15. 리스크 및 대응 방안

### 15-1. 기술적 리스크

| 리스크 | 영향도 | 확률 | 대응 |
|--------|-------|------|------|
| **SCSS `var()` 호환 문제** — SCSS 함수(`lighten`, `darken`)에 CSS 변수 전달 불가 | 높음 | 높음 | Phase 1에서 모든 SCSS 함수 사용처 사전 조사, `color-mix()` 등 CSS 네이티브 대체 |
| **Tailwind + SCSS 빌드 충돌** — PostCSS 파이프라인 간섭 | 중간 | 낮음 | Next.js Turbopack이 두 파이프라인을 독립 처리; 충돌 시 postcss.config에서 순서 명시 |
| **번들 크기 증가** — Radix UI 런타임 추가 | 중간 | 중간 | tree-shaking 확인, 실제로 import한 프리미티브만 번들 포함됨 |
| **Canvas 성능 영향** — Radix 컴포넌트 오버헤드 | 높음 | 낮음 | Canvas 영역은 Dialog/Tabs 등 비빈번 UI만 교체, 렌더 루프에 영향 없음 |
| **shadcn CLI 업데이트와 충돌** — CLI가 파일을 덮어쓸 수 있음 | 낮음 | 낮음 | primitives/는 CLI 관리, components/는 수동 관리 — 영역 분리 |

### 15-2. 운영 리스크

| 리스크 | 대응 |
|--------|------|
| **팀원 학습 곡선** — Tailwind + CVA + cn() 패턴 | Phase 0에서 팀 워크숍 진행, 치트시트 배포 |
| **PR 충돌** — SCSS→Tailwind 전환 중 다른 작업과 충돌 | Feature 단위로 전환, 작업 브랜치 수명 최소화 |
| **시각적 회귀** — 스타일 전환 시 미묘한 차이 | Phase별 시각적 회귀 테스트, Figma 디자인과 대조 |
| **전환 중단 리스크** — 일부만 전환하고 중단될 경우 | 공존 전략(12절)으로 어느 Phase에서든 중단 가능하게 설계 |

---

## 16. Phase별 체크리스트

### Phase 0: 인프라 구축
- [ ] `tailwindcss`, `@tailwindcss/postcss` 설치
- [ ] `postcss.config.mjs`에 Tailwind 플러그인 추가
- [ ] `packages/ui/src/styles/globals.css` 생성 (디자인 토큰 + `@import "tailwindcss"`)
- [ ] `packages/ui/src/lib/utils.ts` 생성 (`cn()`)
- [ ] `clsx`, `tailwind-merge`, `class-variance-authority` 설치
- [ ] `packages/ui/components.json` 생성
- [ ] `apps/web/components.json` 생성
- [ ] `packages/ui/package.json` exports 업데이트
- [ ] `pnpm install` 성공
- [ ] 기존 화면 회귀 없음
- [ ] `pnpm dlx shadcn@latest add button -c packages/ui` 테스트 성공

### Phase 1: 디자인 토큰 통합
- [ ] `_variables.scss` → `var()` 브릿지로 전환
- [ ] `apps/web/globals.css` 중복 토큰 제거
- [ ] Dashboard 독자 토큰 53개 제거
- [ ] SCSS 함수 사용처 전수 조사 및 대체
- [ ] 크로스 브라우저 확인 (CSS `color-mix()` 지원)
- [ ] 시각적 회귀 테스트

### Phase 2: 기반 프리미티브 도입
- [ ] 16개 shadcn 프리미티브 설치
- [ ] `@xgen/ui/index.ts` 배럴 export 확장
- [ ] `@xgen/icons`에 lucide-react re-export 추가
- [ ] 데모 페이지 작성

### Phase 3: 기존 컴포넌트 마이그레이션
- [ ] Button → CVA + Tailwind 전환
- [ ] Modal → Dialog 기반 재구축
- [ ] FilterTabs → Tabs 기반 재구축
- [ ] DropdownMenu → Radix DropdownMenu 기반 재구축
- [ ] Toggle → Switch 기반 재구축
- [ ] SearchInput → Input + 커스텀 래퍼
- [ ] FormField → 재구축
- [ ] ContentArea, EmptyState, Card 류 → Tailwind 스타일 전환
- [ ] Toast 시스템 → sonner 전환 검토
- [ ] Sidebar → 단계적 전환
- [ ] `packages/ui/` 내 모든 `.module.scss` 삭제

### Phase 4: Feature 마이그레이션
- [ ] main-PromptStorage 전환
- [ ] main-ToolStorage 전환
- [ ] main-Documents 전환
- [ ] main-Dashboard 전환
- [ ] main-ChatCurrent 전환 (SVG 11개 이관 포함)
- [ ] main-ChatHistory 전환
- [ ] main-AuthProfile Tailwind 정리
- [ ] 나머지 main-* 전환
- [ ] auth-LoginForm 전환
- [ ] root-Landing-* 전환
- [ ] 인라인 SVG 24개+ → @xgen/icons 이관

### Phase 5: Canvas 마이그레이션
- [ ] canvas-node-detail 모달 → Dialog
- [ ] canvas-deploy 모달/탭/라디오 → Dialog/Tabs/RadioGroup
- [ ] canvas-document-drop 모달 → Dialog
- [ ] canvas-sidebar-templates 모달 → Dialog
- [ ] canvas-sidebar-nodes 탭/검색 → Tabs/SearchInput
- [ ] canvas-ai-generator 셀렉트 → Select
- [ ] canvas-* package.json에 @xgen/ui 의존성 추가

---

## 17. 결론

### 17-1. 전체 투입 요약

| Phase | 범위 | 전제 조건 |
|-------|------|----------|
| **Phase 0** | 인프라 세팅 (Tailwind + shadcn CLI) | 없음 |
| **Phase 1** | 디자인 토큰 단일화 | Phase 0 |
| **Phase 2** | 프리미티브 16개 도입 | Phase 0 |
| **Phase 3** | @xgen/ui 17개 컴포넌트 재구축 | Phase 1, 2 |
| **Phase 4** | main-* Feature 전환 (10+ 패키지) | Phase 3 |
| **Phase 5** | canvas-* Feature 선택적 전환 (10+ 패키지) | Phase 2 |

> **Phase 4와 Phase 5는 병렬 진행 가능** — 서로 독립적.

### 17-2. 이것이 완료되면 얻는 것

```
1. 단일 디자인 토큰 시스템 — CSS Custom Properties 하나로 통합
2. 접근성 완전 준수 — Radix UI가 WAI-ARIA 처리
3. 40+ 프리미티브 즉시 사용 — 자체구현 제거
4. 일관된 variant 관리 — CVA + cn() 패턴 표준화
5. 다크 모드 즉시 대응 가능 — CSS 변수 기반
6. Feature 간 시각적 일관성 — 동일 프리미티브, 동일 토큰
7. 모노레포 철학 강화 — packages → features → apps 의존 방향 더욱 명확
8. 개발 생산성 향상 — 프리미티브 조합으로 빠른 UI 구축
```

### 17-3. 핵심 불변 원칙 (변경되지 않는 것)

```
⭕ packages → features → apps 의존 방향
⭕ Feature 간 import 금지
⭕ App은 조립만 한다
⭕ @xgen/ui가 유일한 UI 출구
⭕ @xgen/types가 인터페이스 계약 제공
⭕ features.ts import 한 줄로 기능 토글
⭕ Feature id = 디렉토리명
⭕ 파일명 kebab-case
```

**shadcn/ui는 우리의 모노레포 철학을 바꾸는 것이 아니라, `@xgen/ui` 내부의 구현 품질을 근본적으로 끌어올리는 것이다.**
