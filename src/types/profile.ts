export interface UserProfile {
  name: string
  generation: number
  role: string
  initial: string
}

export interface UserAttendanceRecord {
  id: string
  title: string
  date: string
  status: 'present' | 'late' | 'absent'
}

export interface NotificationPreferences {
  sessionStart: boolean
  newNotice: boolean
}
