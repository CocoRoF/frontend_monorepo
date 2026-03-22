# XGEN Frontend Monorepo — 작업 규칙

---

## 목차

1. [요약](#1-요약)
2. [3개의 층 — 의존성 규칙](#2-3개의-층--의존성-규칙)
3. [코드 위치 규칙](#3-코드-위치-규칙)
4. [공유 패키지 사용 규칙](#4-공유-패키지-사용-규칙)
5. [4가지 모듈 타입 — 판단법과 작성법](#5-4가지-모듈-타입--판단법과-작성법)
6. [컴포넌트화 원칙 — 복붙 금지](#6-컴포넌트화-원칙--복붙-금지)
7. [네이밍 규칙](#7-네이밍-규칙)
8. [기능 토글 규칙](#8-기능-토글-규칙)
9. [브랜치/머지 운영](#9-브랜치머지-운영)
10. [TASK 처리 기준](#10-task-처리-기준)
11. [새 Feature 추가 — 실전 예시](#11-새-feature-추가--실전-예시)
12. [이것만은 하지 마세요](#12-이것만은-하지-마세요)
13. [PR 전 자가 점검표](#13-pr-전-자가-점검표)

---

## 1. 요약

```
apps/      → 조립만 한다. 비즈니스 코드 넣지 않는다.
features/  → 기능 하나 = 폴더 하나 = 패키지 하나. 서로 import 안 한다.
packages/  → 모두가 공유하는 도구. UI, API, 인증, 아이콘, 타입 등.
```

```
파일명      → kebab-case (content-area.tsx)
공통 UI     → 반드시 @xgen/ui 사용 (새로 만들지 않는다)
API 호출    → 반드시 @xgen/api-client 사용 (fetch 직접 안 쓴다)
환경 변수   → 반드시 @xgen/config 사용 (process.env 직접 안 읽는다)
다국어      → 반드시 @xgen/i18n의 useTranslation() 사용
인증        → 반드시 @xgen/auth-provider의 useAuth() 사용
아이콘      → 반드시 @xgen/icons에서 import
브랜치      → refactor/figma-layout에서 따고, 완료 후 다시 머지
```

---

## 2. 3개의 층 — 의존성 규칙

### 허용되는 의존 방향

```
apps  →  features  →  packages
(조립)    (기능)       (인프라)

⭕ app이 feature를 import
⭕ feature가 package를 import
❌ feature가 다른 feature를 import     ← 가장 중요한 규칙
❌ package가 feature를 import
❌ feature가 app을 import
```

### Feature 독립성 테스트

```
⭕ 올바름:
  features.ts에서 import 한 줄 주석 → 기능만 사라짐 → 나머지 정상

❌ 잘못됨:
  chat-history를 삭제했더니 chat-new에서 에러 → Feature 간 의존이 있다는 뜻
```

**자가 점검:** "내 Feature 폴더를 통째로 삭제해도 다른 Feature가 깨지는가?"

---

## 3. 코드 위치 규칙

### 판단법

```
→ 특정 화면/기능의 UI나 로직?      → features/{해당-feature}/src/
→ 3개 이상 Feature가 공유하는 범용? → packages/{해당-package}/
→ Next.js 라우팅/레이아웃만?        → apps/{해당-app}/src/
→ 모르겠다?                        → 팀 리드에게 물어본다
```

### App에 비즈니스 코드 넣지 않는다

```
⭕  apps/web/src/features.ts       → import + register만
⭕  apps/web/src/components/       → XgenSidebar, Layout 같은 구조 컴포넌트만

❌  apps/web/src/components/ChatMessageList.tsx    → Feature에 넣어야 함
❌  apps/web/src/utils/chatFormatter.ts            → Feature나 Package에 넣어야 함
```

---

## 4. 공유 패키지 사용 규칙

Feature에서 직접 구현하지 말고, 반드시 공유 패키지를 통해 사용해야 하는 것들.

### UI — @xgen/ui

```typescript
// ⭕
import { ContentArea } from '@xgen/ui';

// ❌ 비슷한 래퍼를 Feature 안에서 새로 만드는 것
function MyContentWrapper({ children }) {
  return <div className="content-area">{children}</div>;
}
```

새 UI를 만들기 전 반드시 확인:
1. `@xgen/ui`에 비슷한 컴포넌트가 있는가? → 있으면 그것을 사용
2. JIRA 하위 티켓에 공통컴포넌트 작업이 연결되어 있는가? → 있으면 그것을 기다리거나 먼저 작업
3. 다른 Feature에서도 같은 컴포넌트가 필요한가? → `@xgen/ui`에 공통으로 만들기
4. 이 Feature에서만 쓸 특수 UI인가? → 그때만 Feature 내부에 작성

### API — @xgen/api-client

```typescript
// ⭕
import { createApiClient } from '@xgen/api-client';
const api = createApiClient();
const data = await api.get<UserList>('/users');

// ❌ fetch 직접 호출 — 인증 토큰 누락, 에러 처리 누락, base URL 하드코딩
const res = await fetch('http://localhost:8000/users', {
  headers: { Authorization: `Bearer ${token}` }
});
```

### 환경변수 — @xgen/config

```typescript
// ⭕
import { getBackendUrl } from '@xgen/config';
const coreUrl = getBackendUrl('core');

// ❌ process.env 직접 읽기
const url = process.env.NEXT_PUBLIC_CORE_BASE_URL;
```

### 인증 — @xgen/auth-provider

```typescript
// ⭕
import { useAuth } from '@xgen/auth-provider';
const { user, isAuthenticated, hasAccessToSection } = useAuth();

// ❌ 쿠키를 직접 파싱
const token = document.cookie.match(/xgen_access_token=([^;]+)/)?.[1];
```

### 다국어 — @xgen/i18n

```typescript
// ⭕
import { useTranslation } from '@xgen/i18n';
const { t } = useTranslation();
return <h1>{t('sidebar.workspace.mainDashboard.title')}</h1>;

// ❌ 한국어 하드코딩
return <h1>메인 대시보드</h1>;
```

### 아이콘 — @xgen/icons

```typescript
// ⭕
import { IconSidebarChat, FiSettings } from '@xgen/icons';

// ❌ react-icons를 Feature에서 직접 설치/import
import { FiSettings } from 'react-icons/fi';
```

---

## 5. 4가지 모듈 타입 — 판단법과 작성법

### 어떤 타입을 써야 하는가?

```
"사이드바에 독립 메뉴 필요?"       → FeatureModule        (registry.register)
"캔버스 안에서 동작하는 플러그인?"  → CanvasSubModule      (registry.registerCanvasSub)
"관리자 페이지의 하위 메뉴?"       → AdminSubModule       (registry.registerAdminSub)
"문서 관리 페이지의 탭?"           → DocumentTabConfig    (registry.registerDocumentTab)
```

### FeatureModule 작성 패턴

```typescript
'use client';
import React from 'react';
import type { FeatureModule, RouteComponentProps } from '@xgen/types';
import { useTranslation } from '@xgen/i18n';

const MyPage: React.FC<RouteComponentProps> = () => {
  const { t } = useTranslation();
  return <div>{t('workspace.myFeature.title')}</div>;
};

export const myFeature: FeatureModule = {
  id: 'main-MyFeature',                  // ← 디렉토리명과 반드시 동일!
  name: 'My Feature',
  sidebarSection: 'workspace',           // ← 사이드바 어느 섹션에 넣을지
  sidebarItems: [{
    id: 'my-feature',
    titleKey: 'workspace.myFeature.title',
    descriptionKey: 'workspace.myFeature.description',
  }],
  routes: { 'my-feature': MyPage },
};

export default myFeature;
```

### AdminSubModule 작성 패턴

```typescript
'use client';
import React from 'react';
import type { AdminSubModule } from '@xgen/types';

const AdminMyPage: React.FC = () => ( <div>관리 페이지</div> );

export const adminMyModule: AdminSubModule = {
  id: 'admin-MyModule',                  // ← 디렉토리명과 반드시 동일!
  name: '내 관리 모듈',
  sidebarSection: 'settings',            // ← 관리자 사이드바 섹션
  sidebarItems: [{
    id: 'my-module',
    titleKey: 'admin.sidebar.settings.myModule.title',
    descriptionKey: 'admin.sidebar.settings.myModule.description',
  }],
  routes: { 'my-module': AdminMyPage },
};

export default adminMyModule;
```

### Auth 페이지 — pageRoutes 패턴 (사이드바 없이 독립 URL)

```typescript
export const authLoginModule: FeatureModule = {
  id: 'auth-Login',
  name: '로그인',
  // sidebarSection 없음!
  // sidebarItems 없음!
  pageRoutes: { '/login': LoginPage },     // ← 독립 URL에 직접 매핑
};
```

### Document 탭 — 이중 export 패턴

```typescript
// FeatureModule + DocumentTabConfig 두 가지를 동시에 export하는 특수 케이스
export const documentCollectionFeature: FeatureModule = { /* ... */ };

export const documentCollectionTab: DocumentTabConfig = {
  id: 'collection',
  titleKey: 'document.tabs.collection',
  order: 1,
  component: DocumentCollections,
};

export default documentCollectionFeature;  // default = FeatureModule
export { documentCollectionTab };          // named = DocumentTabConfig
```

---

## 6. 컴포넌트화 원칙 — 복붙 금지

### 목표

> 페이지 내에서 재사용 가능한 영역(섹션/패널/카드/툴바 등)은
> 가능한 한 컴포넌트로 분리하여 **"복붙"으로 코드가 누적되지 않도록** 한다.

### 판단 기준

| 상황 | 판단 |
|---|---|
| 같은 카드 UI가 페이지에 3번 나온다 | **분리** — 한 곳 수정 → 3곳 반영 |
| 다른 Feature에서도 쓸 수 있는 범용 테이블 | **분리 → `@xgen/ui`** 에 넣기 |
| 이 Feature 안에서만 쓰는 특수 차트 | **Feature 내부에서 분리** |
| 이미 `@xgen/ui`에 비슷한 컴포넌트가 있다 | **새로 만들지 않고 그것을 사용** |

### Before — 복붙 (이렇게 하지 마세요)

```tsx
function AdminPage() {
  return (
    <div>
      {/* 사용자 섹션 */}
      <div className="bg-white rounded-lg p-6 shadow-sm">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold">사용자 관리</h2>
          <button className="px-4 py-2 bg-blue-500 text-white rounded">추가</button>
        </div>
        <table>{/* ... */}</table>
      </div>
      {/* 로그 섹션 — 위와 거의 동일한 구조를 복붙 */}
      <div className="bg-white rounded-lg p-6 shadow-sm">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold">로그 관리</h2>
          <button className="px-4 py-2 bg-blue-500 text-white rounded">필터</button>
        </div>
        <table>{/* ... */}</table>
      </div>
    </div>
  );
}
```

### After — 컴포넌트 분리 (이렇게 하세요)

```tsx
function SectionPanel({ title, actionLabel, onAction, children }) {
  return (
    <div className="bg-white rounded-lg p-6 shadow-sm">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-bold">{title}</h2>
        <button className="px-4 py-2 bg-blue-500 text-white rounded" onClick={onAction}>
          {actionLabel}
        </button>
      </div>
      {children}
    </div>
  );
}

function AdminPage() {
  return (
    <div>
      <SectionPanel title="사용자 관리" actionLabel="추가" onAction={handleAdd}>
        <UserTable />
      </SectionPanel>
      <SectionPanel title="로그 관리" actionLabel="필터" onAction={handleFilter}>
        <LogTable />
      </SectionPanel>
    </div>
  );
}
```

디자인 변경 시 `SectionPanel` 하나만 수정 → 모든 곳에 반영.

### 이미 페이지가 있어도 컴포넌트화한다

> 이미 새 디자인으로 적용된 페이지가 존재하더라도,
> **페이지 단위로만 작업되어 컴포넌트화가 미진한 경우**
> 해당 페이지에 대해 컴포넌트화를 **추가로 진행**한다.

"이 페이지 이미 끝났는데요?" → 컴포넌트 분리가 안 되어 있으면 끝난 게 아닙니다.

---

## 7. 네이밍 규칙

### 파일명: kebab-case만

```
⭕ content-area.tsx
⭕ tool-storage-panel.tsx
⭕ workflow-list-item.tsx

❌ ContentArea.tsx        (PascalCase)
❌ contentArea.tsx        (camelCase)
❌ content_area.tsx       (snake_case)
```

### Feature 디렉토리명 — 접두사로 영역, 접미사로 성격

| 접두사 | 의미 |
|---|---|
| `main-` | 일반 사용자 기능 |
| `canvas-` | 캔버스 플러그인 |
| `admin-` | 관리자 기능 |
| `auth-` | 인증 화면 |
| `mypage-` | 마이페이지 |
| `support-` | 고객 지원 |

| 접미사 | 의미 |
|---|---|
| `-Storage` | 내가 저장/관리하는 곳 (CRUD) |
| `-Store` | 탐색/다운로드 마켓 |
| `-Introduction` | 인트로/랜딩 페이지 |
| `-Monitor` / `-Monitoring` | 실시간 모니터링 |
| `-Management` | 관리 기능 |

### Feature id = 디렉토리명 (반드시)

```typescript
// 디렉토리: features/main-CurrentChat/
id: 'main-CurrentChat'   // ⭕

// 디렉토리: features/admin-Users/
id: 'admin-Users'        // ⭕

id: 'current-chat'       // ❌ 디렉토리명과 다름
```

### package.json name

```
features/main-Dashboard/  →  "name": "@xgen/feature-main-Dashboard"
features/canvas-core/     →  "name": "@xgen/feature-canvas-core"
packages/api-client/      →  "name": "@xgen/api-client"
```

---

## 8. 기능 토글 규칙

기능 ON/OFF는 `features.ts`에서 import 한 줄로 제어한다.

```typescript
// ⭕ 기능 ON — import 활성
import canvasAutoWorkflow from '@xgen/feature-canvas-auto-workflow';

// ⭕ 기능 OFF — import 주석
// import canvasAutoWorkflow from '@xgen/feature-canvas-auto-workflow'; // 제외

// ❌ if문으로 분기하거나 환경변수로 토글하지 않는다
```

import를 주석 처리하면:
→ Registry에 등록되지 않음 → 사이드바에 안 나타남 → 번들에서 제외됨.

---

## 9. 브랜치/머지 운영

### 흐름

```
main ──────────────────────── (운영)
  │
  └── refactor/figma-layout ─ (작업 기준 브랜치)
        │
        ├── feature/my-task-1 ─ (내 작업 브랜치)
        │     └── 완료 후 → refactor/figma-layout에 머지
        │
        └── feature/my-task-2
              └── 완료 후 → refactor/figma-layout에 머지
```

### 규칙

| 규칙 | 설명 |
|---|---|
| **데일리 머지** | `main` → `refactor/figma-layout` 매일 머지하여 최신 유지 |
| **브랜치 생성** | `refactor/figma-layout`에서 새 브랜치를 따서 작업 |
| **머지 방향** | 작업 완료 → `refactor/figma-layout`에 머지 |

```bash
# 작업 시작
git checkout refactor/figma-layout
git pull origin refactor/figma-layout
git checkout -b feature/my-task-123

# 작업 완료 후 머지
git checkout refactor/figma-layout
git pull origin refactor/figma-layout
git merge feature/my-task-123
git push origin refactor/figma-layout
```

---

## 10. TASK 처리 기준

| 상황 | 처리 |
|---|---|
| JIRA에 할당된 UI/컴포넌트 작업이 이미 완료됨 | **해결됨(완료)** 처리 |
| 페이지는 있지만 컴포넌트화가 미진 | **컴포넌트화 추가 진행** 후 완료 처리 |
| 하위 티켓에 공통컴포넌트 작업이 연결됨 | **해당 공통 컴포넌트를 우선 적용** |
| 비슷한 UI가 이미 공통 컴포넌트로 존재 | **새로 만들지 않고 가져다 사용** |

---

## 11. 새 Feature 추가 — 실전 예시

"알림 센터" 기능을 추가한다고 가정.

### Step 1 — 모듈 타입 결정

```
사이드바에 메뉴가 필요? → YES → FeatureModule
캔버스 내부 플러그인?   → NO
관리자 페이지?         → NO
```

### Step 2 — 파일 생성

```
features/main-NotificationCenter/
├── package.json
├── tsconfig.json
└── src/
    └── index.ts
```

**package.json:**
```json
{
  "name": "@xgen/feature-main-NotificationCenter",
  "version": "0.0.0",
  "private": true,
  "main": "src/index.ts",
  "types": "src/index.ts",
  "dependencies": {
    "@xgen/types": "workspace:*",
    "@xgen/ui": "workspace:*",
    "@xgen/i18n": "workspace:*",
    "@xgen/api-client": "workspace:*",
    "react": "^19.0.0"
  }
}
```

**tsconfig.json:**
```json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": { "outDir": "dist" },
  "include": ["src"]
}
```

**src/index.ts:**
```typescript
'use client';
import React from 'react';
import type { FeatureModule, RouteComponentProps } from '@xgen/types';
import { ContentArea } from '@xgen/ui';
import { useTranslation } from '@xgen/i18n';

const NotificationCenterPage: React.FC<RouteComponentProps> = () => {
  const { t } = useTranslation();
  return (
    <ContentArea>
      <h2 className="text-lg font-semibold mb-4">
        {t('workspace.notificationCenter.title')}
      </h2>
    </ContentArea>
  );
};

export const notificationCenterFeature: FeatureModule = {
  id: 'main-NotificationCenter',
  name: 'Notification Center',
  sidebarSection: 'workspace',
  sidebarItems: [{
    id: 'notification-center',
    titleKey: 'workspace.notificationCenter.title',
    descriptionKey: 'workspace.notificationCenter.description',
  }],
  routes: { 'notification-center': NotificationCenterPage },
};

export default notificationCenterFeature;
```

### Step 3 — 앱에 등록

```typescript
// apps/web/src/features.ts
import notificationCenter from '@xgen/feature-main-NotificationCenter';

// features 배열에 추가
const features = [ ..., notificationCenter ];
features.forEach((f) => registry.register(f));
```

```jsonc
// apps/web/package.json — dependencies에 추가
"@xgen/feature-main-NotificationCenter": "workspace:*"
```

### Step 4 — i18n 키 추가

```jsonc
// packages/i18n/src/locales/ko.json
{ "workspace": { "notificationCenter": { "title": "알림 센터", "description": "알림을 확인하세요" } } }

// packages/i18n/src/locales/en.json
{ "workspace": { "notificationCenter": { "title": "Notification Center", "description": "Check your notifications" } } }
```

### Step 5 — 확인

```bash
pnpm install
pnpm dev:web
```

→ 사이드바에 "알림 센터" 메뉴가 자동으로 나타남. import 한 줄 주석으로 기능 OFF.

---

## 12. 이것만은 하지 마세요

| ❌ 하지 마세요 | ⭕ 이렇게 하세요 | 이유 |
|---|---|---|
| Feature에서 다른 Feature를 import | 공유 로직은 `packages/`로 추출 | Feature 독립성 유지 |
| `apps/` 안에 비즈니스 컴포넌트 작성 | `features/`에 Feature로 생성 | App은 조립만 |
| `@xgen/ui`에 있는 것과 비슷한 UI를 새로 만듦 | `@xgen/ui`에서 import | UI 일관성 |
| PascalCase 파일명: `ChatHeader.tsx` | `chat-header.tsx` | 네이밍 규칙 |
| Feature `id`와 디렉토리명이 다름 | 반드시 동일하게 | 추적 가능성 |
| `fetch()` 직접 호출 | `@xgen/api-client` 사용 | 인증/에러/URL 중앙화 |
| `process.env.XXX` 직접 읽기 | `@xgen/config` 사용 | 환경 설정 중앙화 |
| 쿠키를 직접 파싱해서 인증 확인 | `@xgen/auth-provider`의 `useAuth()` | 인증 중앙화 |
| 한국어 문자열 하드코딩 | `@xgen/i18n`의 `useTranslation()` | 다국어 지원 |
| 한 페이지에 같은 UI 패턴을 복붙 | 컴포넌트로 분리 | 유지보수 비용 감소 |
| `react-icons`를 Feature에서 직접 설치 | `@xgen/icons`에서 import | 아이콘 일관성 |

---

## 13. PR 전 자가 점검표

### 위치

- [ ] 이 코드가 `features/`, `packages/`, `apps/` 중 올바른 곳에 있는가?
- [ ] Feature를 삭제해도 다른 Feature가 정상 동작하는가?
- [ ] Feature 간 직접 import가 없는가?
- [ ] App에 비즈니스 로직을 넣지 않았는가?

### 네이밍

- [ ] 파일명이 kebab-case인가?
- [ ] Feature `id`가 디렉토리명과 일치하는가?
- [ ] `package.json`의 `name`이 `@xgen/feature-{name}` 형식인가?

### 컴포넌트 & 복붙

- [ ] 2회 이상 반복되는 UI 패턴이 컴포넌트로 분리되어 있는가?
- [ ] `@xgen/ui`에 비슷한 컴포넌트가 이미 있지 않은가?
- [ ] 이미 완성된 페이지라도 컴포넌트화가 되어 있는가?

### 공유 패키지 사용

- [ ] API 호출이 `@xgen/api-client`를 통하는가?
- [ ] 환경 변수가 `@xgen/config`를 통해 읽히는가?
- [ ] 인증이 `@xgen/auth-provider`의 `useAuth()`를 통하는가?
- [ ] 아이콘이 `@xgen/icons`에서 import되는가?
- [ ] 다국어가 `@xgen/i18n`의 `useTranslation()`을 통하는가?

### 모듈 계약

- [ ] FeatureModule / CanvasSubModule / AdminSubModule / DocumentTabConfig 중 올바른 타입인가?
- [ ] `default export`가 있는가?
- [ ] `'use client'` 선언이 있는가?
- [ ] `routes` 컴포넌트의 props가 `RouteComponentProps`를 따르는가?

### i18n

- [ ] UI 텍스트가 i18n 키를 사용하는가? (하드코딩 문자열 없음)
- [ ] `ko.json`과 `en.json`에 모두 추가했는가?
