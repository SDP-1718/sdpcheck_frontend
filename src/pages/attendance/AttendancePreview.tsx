import { Navigate, useParams } from 'react-router'
import type { AttendanceOutcome } from '../../types/attendance'
import Attendance from './Attendance'
import AttendanceResult from './AttendanceResult'

const examples: Record<string, AttendanceOutcome> = {
  present: { status: 'present', checkedAt: '19:03' },
  late: { status: 'late', checkedAt: '19:18' },
  duplicate: { status: 'duplicate', checkedAt: '19:03' },
  expired: { status: 'expired' },
}

export default function AttendancePreview() {
  const { status } = useParams()
  if (!import.meta.env.DEV) return <Navigate to="/home" replace />
  if (status === 'scan') return <Attendance preview />
  const result = status && Object.hasOwn(examples, status) ? examples[status] : null
  return result ? <AttendanceResult result={result} /> : <Navigate to="/attendance" replace />
}
