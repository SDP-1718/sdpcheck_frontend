export type AttendanceStatus = 'present' | 'late' | 'duplicate' | 'expired'

export interface AttendanceOutcome {
  status: AttendanceStatus
  checkedAt?: string
}

export type SubmitAttendanceCode = (code: string) => Promise<AttendanceOutcome>
