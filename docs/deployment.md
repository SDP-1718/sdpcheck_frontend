# Vercel 배포

## 프로젝트 설정
- GitHub 저장소: SDP-1718/sdpcheck_frontend
- Framework Preset: Vite
- Root Directory: 저장소 루트 (`.`)
- Build Command: `npm run build`
- Output Directory: `dist`
- Production Branch: `main`
- 현재 UI 미리보기에는 별도 환경변수가 필요하지 않습니다.

`vercel.json`은 React Router 경로 직접 접속 및 새로고침 시 `index.html`을 반환하도록 설정합니다.
GitHub 저장소 연결·커밋·푸시·PR·머지 및 Deploy 실행은 사용자가 직접 진행합니다.

## 배포 후 확인
- `/onboarding`, `/home`, `/notices/1`, `/schedule`, `/mypage`, `/admin/sessions`를 직접 열고 새로고침합니다.
- 폰트·아이콘과 모바일 화면을 확인합니다.
- 공지·일정과 통계는 로컬 샘플 데이터입니다. 도메인별로 브라우저 저장소가 분리됩니다.
- 개발용 가입 성공 처리와 `/attendance/preview/*` 경로는 배포 빌드에 포함되지 않습니다.
- 카카오 버튼은 현재 회원정보 UI로 이동합니다. 실제 로그인·회원가입·출석·AI 처리는 API 연결 전입니다.

## API 연결 시
Swagger 확인 후 API 주소 및 필요한 공개 환경변수를 정합니다.
Vite의 `VITE_*` 환경변수는 브라우저에 노출되므로 서버 비밀키를 넣지 않습니다.
배포 도메인을 백엔드의 CORS 허용 주소 및 카카오 OAuth 콜백 설정에 맞춰 등록합니다.
프런트엔드의 `/api` 프록시 또는 Vercel Functions를 도입할 때에는 전체 경로 rewrite도 함께 검토합니다.

공식 문서: https://vercel.com/docs/frameworks/frontend/vite
