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

출시 빌드는 `.env.production`의 `VITE_CONTENT_URL`을 사용합니다. 최초 연결 시 `npm run build`로 만든 앱 번들을 토스에 업로드해야 하며, 이후 글과 이미지 변경에는 앱 재배포가 필요 없습니다. 앱은 실행·화면 복귀 시 콘텐츠를 요청하고 실패 시 마지막 정상 콘텐츠를 표시합니다. 캐시가 없으면 재시도 화면을 표시합니다.

### Codex에서 콘텐츠 만들기

현재는 Codex에서 뉴스 조사·글 작성·이미지 생성·업로드를 진행합니다. GitHub Actions는 콘텐츠 검증과 Pages 배포만 수행합니다. AI API 키나 예약 생성 설정은 필요 없습니다.

1. 한국 언론과 국내 기관의 원문을 우선 사용하고 날짜·수치·사실을 대조하여 경제 브리핑을 작성합니다. 해외 공식 자료는 사실 확인이 필요한 경우 보완 출처로 사용합니다. `src/content/types.ts`의 형식을 따르고 `description`도 주제에 맞게 작성합니다. 실제 콘텐츠는 `isExample: false`로 설정합니다.
2. 표지와 각 기사 본문의 이미지를 모두 Codex 이미지 생성으로 만들고 `content/images/YYYY-MM-DD/`에 저장합니다. 수정본은 새 파일명으로 저장합니다. JSON 이미지 주소는 `https://aksworns22.github.io/economy-flow/images/YYYY-MM-DD/파일명`을 사용하고 `isAiGenerated: true`, `credit: "AI 생성 이미지"`, HTTPS `creditUrl`을 지정합니다. 생성 정보는 메타데이터로 보관하되 화면에 AI 생성 문구를 표시하지 않습니다.
3. 기존 `content/today.json`을 `content/archive/날짜-버전.json`으로 보관합니다. 같은 날짜의 수정본도 덮어쓰지 않도록 고유 버전이나 시각을 파일명에 포함합니다.
4. 새 `content/today.json`을 작성하고 `node --experimental-strip-types scripts/validate-content.ts`로 형식과 이미지 파일을 검증합니다. 형식 검사는 뉴스의 사실 정확성을 보장하지 않습니다.
5. 생성된 이미지와 본문을 확인한 후 콘텐츠 변경을 커밋하고 GitHub에 push합니다. main에 반영되면 **Publish content to Pages**가 자동 실행됩니다. 검토가 필요한 경우 PR을 만든 뒤 병합합니다.
6. 배포 성공 후 공개 JSON과 이미지 URL을 확인합니다. 문제가 있으면 콘텐츠 커밋을 되돌리고 재배포합니다.

Codex에 요청할 예시:

> 오늘의 경제 콘텐츠를 업데이트해줘. 최근 24시간 뉴스의 원문과 수치를 확인하고, 현재 JSON 형식으로 작성해줘. 표지는 AI 일러스트로 만들어줘. 기존 콘텐츠를 보관하고 검증한 뒤 GitHub에 올려 Pages 배포까지 확인해줘.

초기 Pages 콘텐츠는 기존 예시입니다. 정확한 비용 계측은 후속 작업입니다.

콘텐츠 검증 테스트: `node --experimental-strip-types --test scripts/content.test.ts`.
