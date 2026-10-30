# 출석체크 UI

## 화면

- `/attendance`: QR 촬영, 카메라 권한 안내, 재시도 및 취소.
- 결과 상태: 출석 완료, 지각, 이미 출석, 코드 만료.
- 취소·결과 화면의 돌아가기는 `/home`으로 이동.
- 촬영 화면을 나가거나 코드를 인식하면 카메라 트랙과 스캔 타이머를 종료.

## 서버 연동 전 상태

실제 출석 요청은 아직 연결하지 않았습니다. `Attendance`의 `submitCode`에 서버 요청 함수를 전달하면 검증된 응답으로 결과 화면을 표시합니다. 함수 형식은 `SubmitAttendanceCode`, 결과 형식은 `AttendanceOutcome`을 사용합니다.

서버 연결 전 스캔한 QR을 성공으로 처리하거나 출석 기록을 저장하지 않습니다. 카메라를 지원하지 않거나 브라우저의 QR 인식 기능을 사용할 수 없으면 안내와 재시도를 표시합니다. 브라우저 네이티브 QR 인식 기능을 사용하며, 모바일 브라우저별 지원 확인과 추가 QR 디코더 도입은 API 연동 단계에서 검토해야 합니다.

## 개발 미리보기

`npm run dev`에서만 아래 경로를 제공합니다. 카메라 권한 요청과 출석 기록 저장 없이 화면을 확인할 수 있습니다.

- `/attendance/preview/scan`
- `/attendance/preview/present`
- `/attendance/preview/late`
- `/attendance/preview/duplicate`
- `/attendance/preview/expired`

배포 빌드에는 미리보기 경로를 포함하지 않습니다.
