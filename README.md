# My Board

개인 일정·업무·할 일 대시보드 (`index.html` 단일 파일).

## 배포 (GitHub Pages)
Settings → Pages → Source: **Deploy from a branch** → `main` / `(root)` → Save.
몇 분 뒤 `https://jina-thefounders.github.io/personal/` 에서 열립니다.

## Google 연동 (캘린더 동기화 + 기기 간 저장)
1. Google Cloud Console에서 **Google Calendar API**, **Google Drive API** 사용 설정
2. OAuth 동의 화면 구성 후 테스트 사용자에 본인 계정 추가
3. 사용자 인증 정보 → **OAuth 클라이언트 ID (웹 애플리케이션)** 생성
   - 승인된 JavaScript 원본: `https://jina-thefounders.github.io`
4. 대시보드 → **Google** 버튼 → 클라이언트 ID 입력, "Google Drive에 저장" 체크 → 연결 후 동기화
5. **기기 연결 링크 복사** → 휴대폰 등 다른 기기에서 그 링크로 처음 한 번 열기

데이터는 브라우저(localStorage)와, 켜두면 본인 Google Drive의 앱 전용 숨김 폴더(`drive.appdata`)에 저장됩니다.
클라이언트 ID는 코드에 포함하지 않고 각 기기에서 입력/링크로 설정합니다. 액세스 토큰은 저장하지 않습니다.
