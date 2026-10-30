import type { NotificationPreferences, UserAttendanceRecord, UserProfile } from '../types/profile'

export const previewProfile: UserProfile = {
  name: '정은우', generation: 17, role: '운영진', initial: '정',
}

export const previewProfileSummary = {
  attendanceRate: 79, late: 2, absent: 1, recentSessions: 4, recentAttendance: 3,
}

export const previewAttendanceHistory: UserAttendanceRecord[] = Array.from({ length: 6 }, (_, index) => ({
  id: String(index + 1), title: '정규 세션', date: '2026.09.15', status: 'present',
}))

export const defaultNotificationPreferences: NotificationPreferences = { sessionStart: false, newNotice: true }
