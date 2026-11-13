import { useCallback, useRef, useState } from 'react'
import { Clock3, Plus, SwitchCamera } from 'lucide-react'
import { Link } from 'react-router'
import { useQrCamera } from '../../hooks/useQrCamera'
import { usePinchZoom } from '../../hooks/usePinchZoom'
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
  const pinch = usePinchZoom()
  const [result, setResult] = useState<AttendanceOutcome | null>(null)
  const [submissionError,setSubmissionError] = useState('')
  const handleCode = useCallback(async (code: string) => {
    // Only a verified server response may show a real check-in result.
    if (!submitCode) throw new Error('Attendance submission is not connected')
    let outcome: AttendanceOutcome
    try { outcome = await submitCode(code) }
    catch (error) { setSubmissionError(error instanceof Error ? error.message : '출석 확인을 처리하지 못했어요.'); throw error }
    setResult(outcome)
  }, [submitCode])
  const { state, retry, switchCamera, canSwitch } = useQrCamera(videoRef, handleCode, !preview && !result, pinch.zoom)
  const message = preview ? null : state.phase === 'error' && state.reason === 'submission' ? submissionError || cameraMessage(state) : cameraMessage(state)

  if (result) return <AttendanceResult result={result} />
  return (
    <section className="attendance-scan" aria-labelledby="attendance-scan-title">
      <header className="attendance-scan-header">
        <h1 id="attendance-scan-title">출석체크</h1>
        <p>QR코드를 스캔해주세요</p>
      </header>
      <div className={`attendance-viewfinder ${state.phase === 'scanning' && !preview ? 'is-scanning' : ''}`} aria-label="QR 코드 촬영 영역. 두 손가락으로 확대하거나 축소할 수 있어요." tabIndex={!preview && state.phase === 'scanning' ? 0 : undefined} {...(!preview && state.phase === 'scanning' ? pinch.handlers : {})}>
        <video ref={videoRef} style={{transform:`scale(${pinch.zoom})`}} autoPlay muted playsInline aria-label="카메라 미리보기" />
        {!preview && state.phase === 'scanning' && <span className="attendance-zoom-label" aria-label={`확대 배율 ${pinch.zoom.toFixed(1)}배`}>{pinch.zoom.toFixed(1)}×</span>}
        <Plus className="attendance-crosshair" size={32} strokeWidth={1.5} aria-hidden="true" />
        {(preview || state.phase !== 'scanning') && <Clock3 className="attendance-camera-clock" size={40} strokeWidth={1.5} aria-hidden="true" />}
      </div>
      {!preview && canSwitch && state.phase !== 'processing' && <button type="button" className="attendance-camera-switch" disabled={state.phase === 'loading'} onClick={()=>{pinch.reset();switchCamera()}}><SwitchCamera size={20} aria-hidden="true"/>카메라 전환</button>}
      {message && <div className="attendance-camera-message" role="status">
        <p>{message}</p>
        {state.phase === 'error' && <button type="button" onClick={()=>{pinch.reset();retry()}}>다시 시도</button>}
      </div>}
      <Link className="attendance-bottom attendance-cancel" to="/home">취소</Link>
    </section>
  )
}
