import { Check, X } from 'lucide-react'
import { Link } from 'react-router'
import type { AttendanceOutcome, AttendanceStatus } from '../../types/attendance'

const statusCopy: Record<AttendanceStatus, { title: string; subtitle: string }> = {
  present: { title: '출석 완료!', subtitle: '출석이 확인되었어요' },
  late: { title: '지각 처리되었습니다', subtitle: '출석이 확인되었어요' },
  duplicate: { title: '이미 출석체크되었어요', subtitle: '출석이 확인되었어요' },
  expired: { title: '코드가 만료됐어요', subtitle: '다시 스캔해주세요' },
}

function checkedTime(value: string | undefined) {
  if (!value) return null
  if (/^(?:[01]\d|2[0-3]):[0-5]\d$/.test(value)) return value
  const date = new Date(value)
  if (!Number.isFinite(date.getTime())) return null
  return new Intl.DateTimeFormat('ko-KR', {
    timeZone: 'Asia/Seoul', hour: '2-digit', minute: '2-digit', hourCycle: 'h23',
  }).format(date)
}

export default function AttendanceResult({ result }: { result: AttendanceOutcome }) {
  const copy = statusCopy[result.status]
  const time = checkedTime(result.checkedAt)
  const subtitle = result.status !== 'expired' && time ? `${time}에 완료되었어요` : copy.subtitle
  return (
    <section className={`attendance-result attendance-${result.status}`} aria-labelledby="attendance-result-title">
      <div className="attendance-result-content" role="status">
        <div className="attendance-status-icon" aria-hidden="true">
          {result.status === 'expired' ? <X size={32} strokeWidth={2.5} /> : <Check size={32} strokeWidth={2.5} />}
        </div>
        <h1 id="attendance-result-title">{copy.title}</h1>
        <p>{subtitle}</p>
      </div>
      <Link className="attendance-bottom attendance-return" to="/home">돌아가기</Link>
    </section>
  )
}
