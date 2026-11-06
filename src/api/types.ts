export interface AccessTokenResponse { accessToken: string; onboardingCompleted: boolean; name: string | null; generation: number | null }
export interface MyInfo { name: string; generation: number; role: 'MEMBER' | 'ADMIN' }
export interface PageResponse<T> { items: T[]; page: number; size: number; totalElements: number; totalPages: number; hasNext: boolean }
export interface ScheduleSummary { id: string; type: 'SESSION' | 'EVENT'; title: string; startsAt: string; location: string | null }
export interface NoticeSummary { id: string; title: string; isPinned: boolean; author: { id: string; name: string }; createdAt: string; updatedAt: string }
export interface NoticeDetailResponse extends NoticeSummary { content: string; imageUrls: string[] }
export interface AttendanceSummary { periodCode: string; attendanceRate: number | null; presentCount: number; lateCount: number; absentCount: number; totalSessionCount: number }
export interface AttendanceHistory { sessionId: string; sessionTitle: string; startsAt: string; attendanceStatus: 'PRESENT' | 'LATE' | 'ABSENT'; checkedInAt: string | null }
export interface NotificationSettings { sessionStartEnabled: boolean; newNoticeEnabled: boolean }
export interface HomeResponse {
 serverTime: string
 member: MyInfo
 session: null | { id: string; title: string; scheduledStartAt: string; status: 'SCHEDULED' | 'IN_PROGRESS' | 'ENDED'; attendanceStatus: 'NOT_CHECKED_IN' | 'PRESENT' | 'LATE' | 'ABSENT'; checkInStatus: 'AVAILABLE' | 'LATE_AVAILABLE' | 'UNAVAILABLE'; checkedInAt: string | null }
 statistics: { periodCode: string; attendanceRate: number | null; attendedSessionCount: number; totalSessionCount: number }
 notices: { id: string; title: string; createdAt: string }[]
 upcomingSchedules: ScheduleSummary[]
}
