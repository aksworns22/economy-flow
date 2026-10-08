# 오늘의 경제 흐름

React 18 + TypeScript + Vite 7 기반 앱인토스 WebView 프로젝트입니다. 시작 화면에서 오늘의 요약을 바로 읽습니다. TDS Mobile의 Button, Provider와 색상 토큰을 사용합니다.

## 실행

Node.js 24 이상이 필요합니다.

```sh
npm ci
npm run dev
```

브라우저에서 http://localhost:5173 에 접속합니다. 로컬 개발의 AIT 버튼은 공식 개발 도구이며 실제 출시 번들에는 포함되지 않습니다. 휴대폰 브라우저에서는 컴퓨터와 같은 Wi-Fi에서 Vite가 출력하는 Network 주소로 접속할 수 있습니다.

```sh
npm run build
npm run preview
```

빌드는 TypeScript 검사, `dist/` 웹 빌드, `today-economy-flow.ait` 앱 번들 생성을 순서대로 수행합니다. `npm run build:web`은 웹만 빌드합니다.

## 콘텐츠

`src/content/sample.json`에 날짜, 제목, 핵심, 뉴스 섹션, 기사별 출처, 마무리, 용어를 분리했습니다. 현재 내용과 매체·기사 제목은 모두 가상 예시이며 화면에서 이를 표시합니다.

- 본문의 `[[base-rate|기준금리]]` 형식은 일반 텍스트로 표시합니다. 기사별 `explanation`의 `termLabel`, `termDescription`으로 기사 아래에 짧은 용어 뜻을 보여줍니다.
- 각 섹션의 `sources`에 기사 제목과 매체를 넣습니다. 실제 기사는 `url`에 HTTPS 기사 주소를 넣으면 링크로 표시합니다.
- 데이터 계약은 `src/content/types.ts`, 불러오기와 형식 검사는 `src/content/load.ts`에 있습니다.

GitHub Pages에 같은 형식의 JSON을 올린 후 `.env.local`에 아래 값을 설정하고 다시 빌드하면 원격 콘텐츠로 교체됩니다. JSON 응답이 올바르지 않거나 요청이 실패하면 재시도 화면을 표시합니다. 실제 뉴스로 교체할 때 `isExample: false`를 설정합니다. 발행 날짜는 콘텐츠의 날짜를 그대로 표시합니다.

```dotenv
VITE_CONTENT_URL=https://YOUR_ACCOUNT.github.io/YOUR_REPOSITORY/today.json
```

원격 콘텐츠 서버는 토스 테스트·서비스 Origin의 CORS 요청을 허용해야 합니다. 사용자 데이터나 비밀 키를 콘텐츠에 넣지 않습니다.

## 앱인토스 설정과 실제 토스 테스트

SDK 3.7의 설정 파일은 `apps-in-toss.config.ts`입니다. 기본 앱 키는 콘솔에 등록된 `today-economy-flow`, 표시 이름은 **오늘의 경제**입니다. 브랜드 색상은 `#3182F6`이며 상단 내비게이션의 뒤로가기·홈·제목을 숨기고 배경을 투명하게 설정해 표지 사진이 상단바 뒤로 이어지도록 했습니다. 토스가 표시하는 더보기·닫기 버튼과 휴대폰 상태바는 유지됩니다. SDK 3.x에서는 표시 이름과 앱 아이콘을 콘솔에서 설정합니다.

1. 앱인토스 콘솔에서 등록된 **오늘의 경제** (`today-economy-flow`)를 선택하고 표시 이름과 아이콘을 확인합니다.
2. 콘솔 appName이 다르면 `apps-in-toss.config.ts`를 수정하거나 `AIT_APP_NAME=등록된키 npm run build`로 빌드합니다. `AIT_APP_NAME`은 셸 환경변수이며 `.env.local`에서 자동 로딩되지 않습니다.
3. `npm run build`로 생성한 `.ait`를 콘솔에 업로드합니다. 또는 로컬에 토큰이 등록되어 있으면 `npm run deploy`를 사용합니다.
4. 콘솔에서 생성된 테스트 QR/`intoss-private://` 스킴을 실제 휴대폰의 토스 앱으로 엽니다.
5. 즉시 본문 진입, 처음부터 끝까지 읽기, 큰 글자, 기사 아래 용어 뜻, 기본 내비게이션에서 미니앱 종료를 확인합니다.

현재 **실제 토스 앱·실물 휴대폰 검증은 미완료**입니다. 콘솔 앱과 기기 연결이 없어 로컬 모바일 브라우저 검증만 수행했습니다. 번들 생성 시 출력된 deploymentId만으로 토스 앱 테스트에 접속할 수는 없으며 업로드 후 생성된 QR이 필요합니다.

## 검증

```sh
npm test
```

설치된 Google Chrome을 이용합니다. 즉시 본문 진입, 기사 아래 용어 뜻, 기사별 출처, 320px 화면에서 긴 제목·문단과 글자 200% 확대, 마지막 문단까지 읽기를 확인합니다. 스크린샷은 `test-results/`에 생성됩니다.

공식 참고: [SDK 연동](https://developers-apps-in-toss.toss.im/ai-vibe-coding/tutorials/webview), [TDS](https://tossmini-docs.toss.im/tds-mobile/start/), [토스 테스트](https://developers-apps-in-toss.toss.im/guide/operation/toss).

### 디자인과 사진

토스피드의 [개편 소개](https://toss.im/tossfeed/article/brandnew-tossfeed)를 참고해 제목의 위계, 여백, 본문의 읽기 간격을 조정했습니다. 샘플의 사진은 뉴스 현장 사진이 아닌 경제 관련 자료 사진입니다. `public/images`에 저장해 외부 이미지 서버 연결 없이 표시합니다.

- `market.jpg`: https://images.unsplash.com/photo-1542838132-92c53300491e
- `finance.jpg`: https://images.unsplash.com/photo-1486406146926-c627a92ad1ab
- `trade.jpg`: https://images.unsplash.com/photo-1578575437130-527eed3abbec

사진 이용 조건: [Unsplash License](https://unsplash.com/license). 콘텐츠의 선택 항목 `coverImage` 및 `sections[].image`에 `src`, `alt`, `credit`, `creditUrl`을 지정하면 사진과 출처가 표시됩니다. 사진이 없는 기존 콘텐츠도 그대로 사용할 수 있습니다.

## GitHub Pages 콘텐츠 운영

이 저장소의 `content/`만 https://aksworns22.github.io/economy-flow/ 로 배포합니다. 앱 코드는 Pages 배포에 포함하지 않습니다.

1. GitHub Settings → Pages → Source를 **GitHub Actions**로 설정합니다.
2. `.env.local`에 `VITE_CONTENT_URL=https://aksworns22.github.io/economy-flow/today.json`을 설정하고 `npm run build`로 앱 번들을 다시 만듭니다. 이후 글과 이미지 교체에는 앱 재배포가 필요 없습니다.
3. 수동 편집은 `content/today.json` 및 `content/images/`를 변경하고 main에 반영합니다. `node --experimental-strip-types scripts/validate-content.ts`로 검증합니다.
4. AI 생성은 Settings → Secrets and variables → Actions에 `OPENAI_API_KEY`를 등록한 뒤 **Generate daily content PR**을 수동 실행합니다. 기본 모델은 `gpt-5.5`, `gpt-image-1.5`이며 Actions Variables의 `CONTENT_MODEL`, `IMAGE_MODEL`로 변경할 수 있습니다. API 호출에는 별도 비용이 발생합니다.
5. Settings → Actions → General에서 GitHub Actions의 PR 생성 권한을 허용합니다. 생성 PR과 실행 artifact의 원문 자료·AI 검토를 직접 확인한 뒤 병합합니다.
6. **Publish content to Pages**가 성공하면 공개 JSON과 사진을 확인합니다. 문제 발견 시 해당 콘텐츠 커밋을 되돌리고 재배포합니다.

생성은 뉴스 검색, 초안 작성, AI 검토, 표지 이미지 1장 생성 순서로 진행하며 API 재시도를 자동 수행하지 않습니다. AI 검토는 원문 대조를 대신하지 않습니다. 예약 실행은 검토 운영이 안정된 후 추가합니다. 초기 Pages 콘텐츠는 기존 예시이며 앱에도 예시 표시를 합니다. 생성 시 이전 콘텐츠는 `content/archive/`에 보관됩니다.

출시 빌드는 `.env.production`의 Pages 주소를 사용합니다. 앱은 실행·화면 복귀 시 콘텐츠를 요청하고 실패 시 마지막 정상 콘텐츠를 표시합니다. 캐시가 없으면 재시도 화면을 표시합니다. 기사별 AI 이미지와 정확한 비용 계측은 후속 작업입니다.

공식 API 참고: [웹 검색](https://developers.openai.com/api/docs/guides/tools-web-search), [이미지 생성](https://developers.openai.com/api/reference/resources/images/methods/generate).
