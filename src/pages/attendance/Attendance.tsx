import { useCallback, useRef, useState } from 'react'
import { Clock3 } from 'lucide-react'
import { Link } from 'react-router'
import { useQrCamera } from '../../hooks/useQrCamera'
import type { QrCameraState } from '../../hooks/useQrCamera'
import type { AttendanceOutcome, SubmitAttendanceCode } from '../../types/attendance'
import AttendanceResult from './AttendanceResult'

function cameraMessage(state: QrCameraState) {
  if (state.phase === 'processing') return '출석을 확인하고 있어요'
  if (state.phase !== 'error') return null
  switch (state.reason) {
    case 'permission': return '카메라 권한을 허용한 뒤 다시 시도해주세요.'
    case 'missing': return '사용할 수 있는 카메라를 찾지 못했어요.'
    case 'busy': return '다른 앱에서 카메라를 사용 중이에요. 닫은 뒤 다시 시도해주세요.'
    case 'unsupported': return '이 브라우저에서는 QR 스캔을 사용할 수 없어요. 지원하는 브라우저에서 다시 열어주세요.'
    case 'submission': return '현재 출석 확인을 이용할 수 없어요. 잠시 후 다시 시도해주세요.'
    default: return '카메라를 사용할 수 없어요. 연결을 확인하고 다시 시도해주세요.'
  }
}

export default function Attendance({ preview = false, submitCode }: {
  preview?: boolean
  submitCode?: SubmitAttendanceCode
}) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [result, setResult] = useState<AttendanceOutcome | null>(null)
  const handleCode = useCallback(async (code: string) => {
    // Only a verified server response may show a real check-in result.
    if (!submitCode) throw new Error('Attendance submission is not connected')
    const outcome = await submitCode(code)
    setResult(outcome)
  }, [submitCode])
  const { state, retry } = useQrCamera(videoRef, handleCode, !preview && !result)
  const message = preview ? null : cameraMessage(state)

  if (result) return <AttendanceResult result={result} />
  return (
    <section className="attendance-scan" aria-labelledby="attendance-scan-title">
      <header className="attendance-scan-header">
        <h1 id="attendance-scan-title">출석체크</h1>
        <p>QR코드를 스캔해주세요</p>
      </header>
      <div className={`attendance-viewfinder ${state.phase === 'scanning' && !preview ? 'is-scanning' : ''}`} aria-label="QR 코드 촬영 영역">
        <video ref={videoRef} autoPlay muted playsInline aria-label="카메라 미리보기" />
        <div className="attendance-scan-line" aria-hidden="true" />
        {(preview || state.phase !== 'scanning') && <Clock3 className="attendance-camera-clock" size={40} strokeWidth={1.5} aria-hidden="true" />}
        <span className="scan-corner top-left" aria-hidden="true" />
        <span className="scan-corner top-right" aria-hidden="true" />
        <span className="scan-corner bottom-left" aria-hidden="true" />
        <span className="scan-corner bottom-right" aria-hidden="true" />
      </div>
      {message && <div className="attendance-camera-message" role="status">
        <p>{message}</p>
        {state.phase === 'error' && <button type="button" onClick={retry}>다시 시도</button>}
      </div>}
      <Link className="attendance-bottom attendance-cancel" to="/home">취소</Link>
    </section>
  )
}
