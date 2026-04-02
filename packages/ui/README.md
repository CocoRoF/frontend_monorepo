# `@xgen/ui` — 디자인 시스템 패키지

> **역할:** 프로젝트 전체의 **유일한 UI 출구.**
> 모든 Feature는 이 패키지를 통해서만 UI 컴포넌트를 사용한다.

---

## 디렉토리 구조

```
src/
├── primitives/       ← shadcn CLI가 관리하는 순수 UI 원자
│   ├── button.tsx       (Radix + CVA 기반)
│   ├── dialog.tsx
│   ├── tabs.tsx
│   └── ...
│
├── components/       ← XGEN 도메인 조합 컴포넌트
│   ├── content-area.tsx (프리미티브 위에 비즈니스 로직 조합)
│   ├── resource-card.tsx
│   ├── sidebar/
│   └── ...
│
├── lib/              ← 유틸리티
│   └── utils.ts         cn() 유틸리티
│
├── hooks/            ← 공유 React 훅
│   └── use-toast.ts
│
├── styles/           ← 디자인 토큰
│   ├── globals.css      ⭐ 단일 진입점 (CSS Custom Properties + @theme)
│   └── _variables.scss  SCSS 브릿지 (전환기, 삭제 예정)
│
├── index.ts          ← 배럴 export
│
├── layout/           ← (레거시) 전환 완료 후 components/로 이동
├── feedback/         ← (레거시) 전환 완료 후 components/로 이동
├── inputs/           ← (레거시) 전환 완료 후 components/로 이동
├── data-display/     ← (레거시) 전환 완료 후 components/로 이동
└── navigation/       ← (레거시) 전환 완료 후 components/로 이동
```

---

## 절대 규칙

### 1. primitives/ vs components/ 구분

| | `primitives/` | `components/` |
|---|---|---|
| **관리 주체** | shadcn CLI (`pnpm dlx shadcn@latest add`) | 개발자 수동 작성 |
| **내용** | 순수 UI 원자 (Button, Dialog, Table, ...) | XGEN 비즈니스 조합 (ContentArea, ResourceCard, ...) |
| **XGEN 로직** | ❌ 없음 | ⭕ 있음 (`@xgen/types`, `@xgen/i18n` 사용) |
| **수정 가능** | ⭕ 커스텀 가능 (shadcn은 소유 코드) | ⭕ 자유 |

### 2. 스타일링 규칙

```
⭕ Tailwind 유틸리티 클래스 + cn() 조합
⭕ CVA (class-variance-authority)로 variant 관리
⭕ CSS Custom Properties (var(--color-*))

❌ 새 .module.scss 파일 생성 금지
❌ 인라인 style={{ }} 객체 금지
❌ 하드코딩 hex 색상 금지 (#305eeb 등)
```

### 3. 디자인 토큰

**`src/styles/globals.css`의 `@theme` 블록이 유일한 진본(Single Source of Truth)이다.**

- 새 토큰 추가 → `globals.css`의 `@theme` 블록에 추가
- SCSS에서 참조 필요 → `_variables.scss` 브릿지 사용 (전환기 한정)
- Feature에서 참조 → Tailwind 클래스 (`bg-primary`, `text-muted-foreground`) 사용

### 4. 새 프리미티브 추가 절차

```bash
# 1. packages/ui 디렉토리에서 실행
cd packages/ui
pnpm dlx shadcn@latest add <component-name>

# 2. src/index.ts에 export 추가
export { NewComponent } from './primitives/new-component';

# 3. pnpm install (Radix 의존성이 자동 추가되므로)
cd ../..
pnpm install
```

### 5. 새 조합 컴포넌트 추가 절차

1. `src/components/` 아래에 kebab-case 파일 생성
2. 프리미티브를 조합하여 구현
3. `src/index.ts`에 export 추가
4. Props 타입도 export

### 6. 의존성 규칙

```
⭕ 이 패키지가 의존할 수 있는 것:
   - @radix-ui/* (shadcn이 자동 추가)
   - @xgen/types, @xgen/i18n, @xgen/icons (workspace)
   - class-variance-authority, clsx, tailwind-merge
   - framer-motion, lucide-react
   - react, react-dom

❌ 이 패키지가 의존하면 안 되는 것:
   - 어떤 Feature 패키지도 (@xgen/feature-*)
   - 앱 패키지 (@xgen/web)
   - @xgen/api-client (UI는 API를 모른다)
   - @xgen/auth-provider (UI는 인증을 모른다)
   - @xgen/config (UI는 환경설정을 모른다)
```

---

## 빌드

빌드 없음. 소스 TypeScript를 Next.js `transpilePackages`로 직접 소비한다.
