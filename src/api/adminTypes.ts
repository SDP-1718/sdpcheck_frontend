import type { NoticeSummary } from './types'
export type SessionStatus = 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELED'
export interface SessionDetail { sessionId:string;title:string;sessionDate:string;startTime:string;endTime:string|null;location:string|null;status:SessionStatus }
export interface MySession {state:'NONE'|'UPCOMING'|'IN_PROGRESS'|'ENDED';session:SessionDetail|null;checkedIn:boolean;attendanceStatus:'PRESENT'|'LATE'|'ABSENT'|null;checkedInAt:string|null}
export interface SessionQr {sessionId:string;qrToken:string;expiresAt:string}
export interface SessionCheckIns {sessionId:string;sessionStatus:SessionStatus;checkInClosesAt:string|null;summary:{totalCount:number;checkedInCount:number;presentCount:number;lateCount:number;absentCount:number;notCheckedInCount:number;attendanceRate:number};members:{memberId:number;name:string;generation:number;status:'PRESENT'|'LATE'|'ABSENT'|'NOT_CHECKED_IN';checkedInAt:string|null}[]}
export interface AdminScheduleItem {id:string;type:'GENERAL'|'SESSION';title:string;startsAt:string;location:string|null;canManage:boolean;version:number}
export interface AdminScheduleList {items:AdminScheduleItem[];page:{page:number;size:number;totalElements:number;totalPages:number}}
export interface AdminNoticeList {pinnedNotice:NoticeSummary|null;items:NoticeSummary[]}
export interface AdminNotice {id:string;title:string;content:string;isPinned:boolean;images:{fileId:string;url:string;expiresAt:string|null}[]}
export interface StatisticsSummary {periodCode:string;averageAttendanceRate:number;totalSessionCount:number;activeMemberCount:number;totalMemberCount:number}
export type StatisticsSort='ATTENDANCE_RATE_ASC'|'ATTENDANCE_RATE_DESC'|'NAME_ASC'
export interface MemberStatistics {memberId:number;name:string;generation:number;presentCount:number;lateCount:number;absentCount:number;totalSessionCount:number;attendanceRate:number;isAtRisk:boolean}
export interface MemberStatisticsPage {periodCode:string;members:MemberStatistics[];page:number;size:number;hasNext:boolean}
