---
name: storybook-story-authoring
description: React 컴포넌트의 Storybook 스토리(인터랙션 테스트 포함)를 새로 작성하거나 수정할 때 사용. "스토리 만들어줘", "스토리 추가", "컴포넌트 테스트 작성", 컴포넌트 신규 생성·수정 후 스토리 갱신이 필요할 때 적용한다. Storybook이 아직 없는 프로젝트에서 스토리 작성을 요청받은 경우에도 사용한다.
---

# Storybook Story Authoring

이 스킬은 **무엇을, 어떤 기준으로** 작성할지만 정한다.
**어떤 문법으로** 작성할지는 Storybook MCP가 알려준다. Storybook 버전마다 문법(CSF 형식, import 경로, 테스트 API)이 바뀌므로, 이 스킬에 적힌 코드 조각이나 기억에 있는 문법보다 MCP 지침이 항상 우선한다.

## 작업 순서

### 1. 환경 파악 (작성 전 반드시)

- `package.json`에서 Storybook 설치 여부·버전, 프레임워크(Vite/Next.js 등), 패키지 매니저(lockfile 기준), MSW 설치 여부를 확인한다.
- **Storybook이 설치되어 있지 않으면 → 아래 "Storybook이 없는 프로젝트" 절차로 간다.**
- `.storybook/preview.*`를 읽고 **이미 전역으로 적용된 decorator·Provider·parameters**를 파악한다. 스토리에서 중복으로 감싸지 않는다.
- `.storybook/main.*`에서 props 분석기 설정(`typescript.reactDocgen`)을 확인한다. 지정이 없으면 프레임워크 기본값이다. → `references/controls.md`
- 같은 프로젝트의 기존 스토리 2~3개를 읽고 파일 위치, `title` 방식, 네이밍, 공통 헬퍼(fixture, decorator, mock) 사용법을 확인한다.
- 프로젝트의 구조·아키텍처 규칙을 확인한다 (CLAUDE.md 등 프로젝트 문서, import 경계를 강제하는 lint 설정, barrel/public API 사용 방식) → `references/project-structure.md`

**우선순위:** 하드 규칙 > 프로젝트 기존 컨벤션 > 이 스킬의 기본값.
기존 컨벤션이 하드 규칙을 어기면 기존 컨벤션을 따르지 말고, 보고 시 언급한다.

### 2. 문법 가져오기

- Storybook MCP 서버가 연결되어 있으면, 스토리를 쓰기 전에 **`get-storybook-story-instructions`** 를 호출해 그 지침대로 작성한다. 컴포넌트 문서가 필요하면 `list-all-documentation` / `get-documentation`을 사용한다.
  (도구 이름은 버전에 따라 바뀔 수 있다. Storybook MCP 서버가 제공하는 "스토리 작성 지침" 도구를 찾아 사용한다.)
- MCP가 없으면: 설치된 Storybook 버전과 기존 스토리 파일의 문법을 그대로 따른다. 버전에 맞지 않는 문법을 기억에 의존해 쓰지 않는다. 보고 시 "MCP 미연결로 기존 스토리 문법 기준으로 작성"이라고 밝히고, MCP 연결 방법(`@storybook/addon-mcp` 설치 후 개발 서버의 MCP 엔드포인트를 에이전트에 등록)을 안내한다.

### 3. 컴포넌트 분석

다음을 파악해 작성할 스토리 목록을 정한다.

- 필수 props와 선택 props, variant/size 같은 열거형 props
  - 열거형 props의 타입이 **어디서 오는지** 본다. 리터럴 유니언을 직접 쓰지 않고 `cva`의 `VariantProps`, 매핑·조건부 타입, 다른 모듈에서 가져온 타입으로 만들어졌다면 컨트롤이 잘못 생성될 가능성이 높다. → `references/controls.md`
- 내부 상태 변화 (열림/닫힘, 선택, 입력값)
- 비동기 의존성 (API 호출, 데이터 패칭 훅) — 데이터를 props로 받는지, 내부에서 직접 가져오는지
- 사용자 상호작용 (클릭, 입력, 키보드, 포커스)
- 외부로 나가는 콜백 (`onChange`, `onSubmit` 등)
- portal 사용 여부 (Dialog, Popover, Toast 등)

→ 컴포넌트 유형별 필수 스토리는 `references/story-checklist.md`
→ 비동기 의존성의 모킹 방식은 `references/testing-rules.md`의 "모킹" (MSW가 없어도 진행한다)

### 4. 작성

아래 **하드 규칙**을 모두 지킨다. 세부 기준은 `references/testing-rules.md`.

### 5. 검증

- MCP의 `run-story-tests`(또는 프로젝트의 Storybook Vitest 실행 명령)로 작성한 스토리를 실행한다.
- 실패하면 원인을 고친다. **테스트를 통과시키려고 검증을 약화하지 않는다** (assertion 삭제, `skip`, 접근성 규칙 비활성화, 의미 없는 대기 추가 금지).
- **같은 원인으로 3회 수정해도 실패하면 멈춘다.** 더 고치지 말고 실패 내용, 시도한 방법, 추정 원인을 보고한다.
- 접근성 애드온이 있으면 위반 0건을 목표로 한다. 컴포넌트 자체의 문제라면 스토리에서 숨기지 말고 보고한다.
- 가능하면 `preview-stories`로 결과를 확인한다.
- **컨트롤 확인:** 열거형 props가 Controls 패널에서 select/radio로 나오는지 확인한다. object 컨트롤("Set object")이나 텍스트 입력으로 나오면 `references/controls.md`의 판단 순서대로 처리한다. 테스트가 통과해도 이 확인은 생략하지 않는다.

### 6. 보고

- 만든/수정한 스토리 목록과 각 스토리가 다루는 상태
- 테스트 실행 결과 (멈췄다면 실패 내용과 시도한 방법)
- 적용한 모킹 방식과 그 이유
- 컨트롤 처리 방식 (스토리 `argTypes`로 보완했는지, 설정 변경을 제안·적용했는지)
- 컴포넌트에서 발견한 문제 (접근 가능한 이름 없음, 키보드 조작 불가 등)
- 환경 개선 제안 (MCP 연결, MSW 도입, 테스트하기 쉬운 구조로의 분리 등) — 필요할 때만
- 체크리스트 중 의도적으로 생략한 항목과 이유

## Storybook이 없는 프로젝트

Storybook MCP는 Storybook 개발 서버 안에서 동작하므로, Storybook이 없으면 MCP도 쓸 수 없다. 이때는 Storybook 공식 CLI가 제공하는 에이전트용 설치 지침(agentic setup)을 따른다.

1. **멈추고 승인을 받는다.** 설치는 프로젝트 전체에 영향을 주므로 사용자 승인 없이 진행하지 않는다. 승인 요청 시 다음을 알린다.
   - 추가될 것: Storybook 관련 devDependencies, `.storybook/` 설정 폴더, `package.json` 스크립트
   - 생길 수 있는 것: CLI가 만드는 예제 스토리·컴포넌트 파일
   - 사용할 패키지 매니저 (lockfile 기준)
2. **승인되면** `npm create storybook@latest`(프로젝트의 패키지 매니저에 맞는 동등 명령)를 실행하고, **CLI가 출력하는 지침을 그대로 따른다.** 설치 절차를 기억에 의존해 임의로 구성하지 않는다.
   - AI 기능(MCP) 활성화를 묻는 단계가 있으면 활성화한다. 테스트(Vitest)·접근성 애드온도 함께 제안되면 설치한다.
   - CLI가 질문하는 선택지 중 사용자 의도가 불분명한 것은 사용자에게 묻는다.
3. CLI가 만든 예제 스토리·컴포넌트를 지울지 사용자에게 확인한다. 묻지 않고 지우지 않는다.
4. 설치 후 Storybook이 정상 실행되는지 확인한다.
5. MCP 연결을 시도한다. 연결이 이번 세션에서 불가능하면(에이전트 설정 변경·재시작 필요 등) 2단계의 "MCP가 없으면" 경로로 진행하고 보고에 연결 방법을 안내한다.
6. 원래 요청(스토리 작성)으로 돌아가 1단계부터 다시 진행한다.

사용자가 설치를 거절하면 스토리를 작성하지 않고, Storybook 없이 가능한 대안(일반 컴포넌트 테스트 등)이 필요한지 묻는다.

MSW 같은 부가 도구는 Storybook 설치와 별개의 결정이다. Storybook 설치 승인을 MSW 설치 승인으로 간주하지 않는다.

## 하드 규칙

**파일**
1. 스토리 파일은 컴포넌트 파일과 **같은 폴더**에 `<ComponentName>.stories.<ext>`로 둔다. 확장자는 컴포넌트와 맞춘다.
2. 한 파일은 한 컴포넌트를 다룬다. meta에 `component`를 지정한다.
3. 스토리 파일을 barrel(`index.ts`)이나 public API로 export하지 않는다.
4. 스토리도 프로젝트의 import 경계 규칙(모듈·레이어 간 의존 방향, public API 경유)을 지킨다. 스토리라는 이유로 예외를 만들지 않는다.

**스토리 구성**
5. 모든 컴포넌트에 `Default` 스토리가 있다. 필수 props만으로 렌더링되는 가장 기본 상태다.
6. 스토리 이름은 **상태나 시나리오를 설명**한다 (`Disabled`, `WithLongLabel`, `SubmitWithInvalidEmail`). `Story1`, `Test`, `Example` 금지.
7. 각 스토리는 **독립적**이다. 다른 스토리의 실행 결과나 순서에 의존하지 않는다.
8. 결정적(deterministic)이어야 한다. 현재 시각, 랜덤 값, 실제 네트워크에 의존하지 않는다. 날짜는 고정하고, 랜덤 데이터는 고정 픽스처로 바꾼다.

**데이터와 모킹**
9. 실제 API를 호출하지 않는다. 모킹 방식은 `references/testing-rules.md`의 우선순위를 따른다. 프로젝트에 이미 있는 핸들러·픽스처·mock은 재사용한다.
10. 새 모킹 도구(MSW 등)를 설치해야만 해결된다면, 설치하지 말고 멈춰서 사용자 승인을 받는다.
11. 콜백 props는 Storybook의 spy 함수(`fn()` 계열)로 args에 넣는다. 빈 함수나 `console.log`를 넣지 않는다.
12. 전역 decorator가 이미 제공하는 Provider를 스토리에서 다시 감싸지 않는다.

**인터랙션 테스트**
13. 사용자 상호작용이 있는 컴포넌트는 **최소 1개의 인터랙션 테스트**를 가진다. 동작만 수행하고 끝내지 말고 반드시 결과를 검증(expect)한다.
14. 요소 탐색 우선순위: role(+ name) > label > placeholder > text > test id. test id는 다른 방법이 불가능할 때만 쓴다.
15. 사용자 동작은 실제 사용자 이벤트 API(`userEvent` 계열)로 수행하고, 모든 동작과 비동기 검증을 `await` 한다.
16. 비동기 결과는 "나타날 때까지 찾는" 쿼리나 재시도형 검증으로 기다린다. 고정 시간 대기(`sleep`, `setTimeout`) 금지.
17. **사용자에게 보이는 결과**를 검증한다. 내부 state, CSS 클래스명, 내부 함수 호출 순서 같은 구현 세부사항을 검증하지 않는다. (단, props로 받은 콜백의 호출 여부·인자 검증은 허용)

**프로젝트 변경**
18. 스토리를 통과시키기 위해 컴포넌트 코드를 몰래 고치지 않는다. 테스트하기 어려운 구조(접근 가능한 이름 없음, 컴포넌트 내부 직접 패칭 등)라면 수정 제안을 보고에 포함하고, 수정했다면 무엇을 왜 바꿨는지 명시한다.
19. 의존성 설치, 설정 파일 생성·변경, 기존 파일 삭제는 사용자 승인 후에만 한다.

**컨트롤**
20. 열거형 props를 object 컨트롤로 방치하지 않는다. 사용자가 누르는 순간 잘못된 값(`{}`)이 들어가 화면이 깨진다. 처리 순서는 `references/controls.md`를 따른다.

## 참고 파일

- `references/story-checklist.md` — 컴포넌트 유형별 필수/권장 스토리
- `references/testing-rules.md` — 쿼리, 비동기, 모킹 우선순위, portal, 결정성 세부 기준
- `references/controls.md` — props 컨트롤이 잘못 생성될 때의 판단·처리 기준
- `references/project-structure.md` — 파일 위치, title, import 경계, mock 위치 규칙
