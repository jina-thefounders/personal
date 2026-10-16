# Task Cubes

개인 일정·업무·할 일 대시보드 (`index.html` 단일 파일).

## 배포 (GitHub Pages)
Settings → Pages → Source: **Deploy from a branch** → `main` / `(root)` → Save.
몇 분 뒤 `https://jina-thefounders.github.io/personal/` 에서 열립니다.

## 자동 동기화 서버 (Apps Script)
**추천 방식.** 내 Google 계정 안에서 돌아가는 작은 서버(Google Apps Script)를 통해 동기화합니다.
대시보드가 Google에 직접 로그인하지 않으므로 **1시간마다 다시 연결할 필요가 없고**, 모든 기기가 자동으로 동기화됩니다.

- 보드 데이터: 아래에서 만드는 Google 시트(`board` 탭)에 저장
- 구글 캘린더: 스크립트가 내 권한으로 대신 읽고 씀 (양방향, 색상 포함)
- 권한: 그 시트 하나(`spreadsheets.currentonly`), 캘린더 일정(`calendar.events`), 캘린더 목록 읽기(색상용)

### 설정 (한 번, 약 5분 · 개인 Google 계정으로)
1. [sheets.new](https://sheets.new) 에서 새 스프레드시트를 만들고 이름을 `Task Cubes 동기화` 로 정합니다.
2. 메뉴 **확장 프로그램 → Apps Script** 를 엽니다.
3. 왼쪽 **프로젝트 설정(⚙)** → 「편집기에서 `appsscript.json` 매니페스트 파일 표시」를 체크합니다.
4. **편집기(< >)** 로 돌아와서
   - `Code.gs` 내용을 모두 지우고 [`apps-script/Code.gs`](apps-script/Code.gs) 내용을 붙여넣습니다.
   - `appsscript.json` 내용을 모두 지우고 [`apps-script/appsscript.json`](apps-script/appsscript.json) 내용을 붙여넣습니다.
   - 저장(💾)합니다.
5. 상단의 함수 선택에서 **`setup`** 을 고르고 **실행** → 권한 검토 → 개인 계정 선택 →
   「Google에서 확인하지 않은 앱」 화면에서 **고급 → (프로젝트 이름)(으)로 이동** → **허용**.
   아래 **실행 로그**에 `Task Cubes 비밀 키: …` 가 나오면 그 키를 복사합니다.
6. 오른쪽 위 **배포 → 새 배포** → 유형 ⚙ **웹 앱** →
   「다음 사용자 인증 정보로 실행」 **나**, 「액세스 권한이 있는 사용자」 **모든 사용자** → **배포** → **웹 앱 URL** 을 복사합니다.
7. 대시보드 → **Google** 버튼 → 「웹 앱 URL」과 「비밀 키」를 붙여넣고 **연결 테스트**.
8. 같은 창의 **기기 연결 링크 복사** → 휴대폰 등 다른 기기에서 그 링크를 한 번 엽니다.

### 알아둘 점
- 웹 앱 URL과 비밀 키를 함께 아는 사람만 보드에 접근할 수 있습니다. 키는 코드·저장소에 넣지 않고 각 기기에만 저장됩니다.
  기기 연결 링크에도 키가 들어 있으니 공유하지 마세요. 유출이 의심되면 스크립트 편집기에서 `resetKey` 를 실행하고 새 키를 다시 입력하세요.
- 시트의 `board` 탭은 대시보드가 쓰는 데이터라 직접 수정하지 마세요.
- `Code.gs` 를 고친 뒤에는 **배포 → 배포 관리 → ✏ → 버전: 새 버전 → 배포** 해야 반영됩니다(URL은 그대로).

## (대안) 직접 Google 로그인 연동
약 1시간마다 「연결」을 다시 눌러야 하는 방식입니다. 동기화 서버를 쓰면 필요 없습니다.

### 설정
1. Google Cloud Console에서 **Google Calendar API**, **Google Drive API** 사용 설정
2. OAuth 동의 화면 구성 후 테스트 사용자에 본인 계정 추가
3. 사용자 인증 정보 → **OAuth 클라이언트 ID (웹 애플리케이션)** 생성
   - 승인된 JavaScript 원본: `https://jina-thefounders.github.io`
4. 대시보드 → **Google** 버튼 → 클라이언트 ID 입력, "Google Drive에 저장" 체크 → 연결 후 동기화
5. **기기 연결 링크 복사** → 휴대폰 등 다른 기기에서 그 링크로 처음 한 번 열기

데이터는 브라우저(localStorage)와, 켜두면 본인 Google Drive의 앱 전용 숨김 폴더(`drive.appdata`)에 저장됩니다.
클라이언트 ID는 코드에 포함하지 않고 각 기기에서 입력/링크로 설정합니다. 액세스 토큰(약 1시간 유효)은 만료될 때까지 이 브라우저에만 보관하고, 연결 해제 시 삭제합니다.

## 수정 후 배포
`index.html` 상단의 `<meta name="app-version">` 값을 올리면, 열려 있는 기기들이 새 버전을 감지해 자동으로 새로고침합니다.
