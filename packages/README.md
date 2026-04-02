# `packages/` — 공유 인프라 패키지 디렉토리

> **역할:** 모든 Feature와 App이 공유하는 **기반 인프라 코드.**
> Feature 간 중복을 제거하고, 일관된 인터페이스를 제공한다.

---

## 패키지 목록과 역할

| 패키지 | 역할 | 주요 소비자 |
|---|---|---|
| `@xgen/ui` | 디자인 시스템 (프리미티브 + 조합 컴포넌트) | 모든 Feature |
| `@xgen/types` | 공유 타입 + FeatureRegistry 싱글턴 | 모든 Feature, apps/web |
| `@xgen/i18n` | 다국어 (react-i18next 래핑) | 모든 Feature |
| `@xgen/icons` | SVG 아이콘 컴포넌트 | 모든 Feature, @xgen/ui |
| `@xgen/api-client` | API 호출 레이어 | Feature (데이터 패칭) |
| `@xgen/auth-provider` | 인증 상태 관리 | Feature (인증 필요 시) |
| `@xgen/config` | 환경 변수, 런타임 설정 | Feature, apps/web |
| `@xgen/canvas-types` | 캔버스 전용 타입 | canvas-* Feature |
| `@xgen/canvas-engine` | 캔버스 실행 엔진 | canvas-* Feature |
| `@xgen/canvas-layout` | 캔버스 레이아웃 로직 | canvas-* Feature |

---

## 절대 규칙

### 1. 의존성 방향 (최우선 규칙)

```
packages → packages  ⭕ (허용, 단 순환 금지)
packages → features  ❌ 절대 금지
packages → apps      ❌ 절대 금지
```

**패키지는 절대로 Feature나 App을 import하지 않는다.**

### 2. 순환 의존 금지

```
❌ @xgen/ui → @xgen/types → @xgen/ui  (순환)
❌ @xgen/api-client → @xgen/auth-provider → @xgen/api-client  (순환)
```

순환 의존이 발견되면 공통 부분을 추출하여 별도 패키지로 분리한다.

### 3. 패키지 간 의존 관계 (현행)

```
@xgen/ui        → @xgen/types, @xgen/i18n, @xgen/icons
@xgen/types     → (의존 없음 — 순수 타입)
@xgen/i18n      → (외부: react-i18next)
@xgen/icons     → (의존 없음 — 순수 SVG)
@xgen/api-client → @xgen/types, @xgen/config
@xgen/auth-provider → @xgen/types, @xgen/config
@xgen/config    → (의존 없음)
```

### 4. 새 패키지 생성 기준

새 패키지를 만들기 전에 아래 기준을 **모두** 충족하는지 확인:

- [ ] **2개 이상의 Feature**가 동일한 코드를 중복 사용하고 있는가?
- [ ] 기존 패키지 (`@xgen/ui`, `@xgen/types` 등)에 추가하기 적절하지 않은가?
- [ ] 단독으로 테스트할 수 있는 명확한 책임 경계가 있는가?

하나라도 No이면 기존 패키지에 코드를 추가하거나, Feature 내부에 유지한다.

### 5. 빌드 전략

**빌드 없음.** 모든 패키지는 TypeScript 소스를 직접 노출하며,
`apps/web`의 Next.js `transpilePackages` 설정으로 빌드 시점에 트랜스파일된다.

```json
// 올바른 package.json exports 예시
{
  "exports": {
    ".": "./src/index.ts",
    "./*": "./src/*"
  }
}
```

---

## 스타일링 가이드 (@xgen/ui 패키지 한정)

`@xgen/ui`는 이 디렉토리의 유일한 스타일링 담당 패키지이다.
다른 packages/* 패키지는 **CSS/SCSS를 포함하지 않는다.**

스타일 관련 상세 규칙은 [`packages/ui/README.md`](ui/README.md)를 참조한다.
