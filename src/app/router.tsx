import { createBrowserRouter, Navigate } from 'react-router'
import Root from './Root'
import Layout from '../components/layout/Layout'
import Onboarding from '../pages/onboarding/Onboarding'
import { RegistrationComplete } from '../pages/onboarding/MemberInformation'
import Home from '../pages/home/Home'
import SchedulePage from '../pages/schedule/SchedulePage'
import MyPage from '../pages/mypage/MyPage'
import Attendance from '../pages/attendance/Attendance'
import AttendancePreview from '../pages/attendance/AttendancePreview'
import { Notices, NoticeDetail } from '../pages/notices/Notices'
import Placeholder from '../pages/Placeholder'

import AdminLayout from '../pages/admin/AdminLayout'
import Sessions, { SessionEditor } from '../pages/admin/Sessions'
import { AdminNotices, NoticeEditor } from '../pages/admin/AdminNotices'
import { AdminSchedule, ScheduleEditor } from '../pages/admin/AdminSchedule'
import Statistics from '../pages/admin/Statistics'
import Permissions from '../pages/admin/Permissions'

import { useMockApi } from '../api/config'
import FeatureUnavailable from '../components/common/FeatureUnavailable'
import { RequireSession } from '../auth/RequireSession'
import { AuthCallback, AuthMemberInformation } from '../pages/auth/AuthCallback'
import LiveHome from '../pages/live/LiveHome'
import LiveMyPage from '../pages/live/LiveMyPage'
import { LiveNotices, LiveNoticeDetail, LiveSchedule } from '../pages/live/LiveContent'
import LiveAttendance from '../pages/live/LiveAttendance'
import LiveSessions, { LiveSessionEditor } from '../pages/live/admin/LiveSessions'
import LiveAdminNotices, { LiveNoticeEditor } from '../pages/live/admin/LiveAdminNotices'
import LiveAdminSchedule, { LiveScheduleEditor } from '../pages/live/admin/LiveAdminSchedule'
import LivePermissions from '../pages/live/admin/LivePermissions'
export const router = createBrowserRouter([{ element: <Root />, children: [{ element: <Layout />, children: [
  { path: '/', element: <Navigate to="/onboarding" replace /> },
  { path: '/onboarding', element: <Onboarding /> },
  { path: '/onboarding/preview', element: <Navigate to="/onboarding/profile" replace /> },
  { path: '/auth/callback', element: <AuthCallback /> },
  { path: '/onboarding/profile', element: <AuthMemberInformation /> },
  { path: '/onboarding/complete', element: <RegistrationComplete /> },
  { element: <RequireSession />, children: [
  { path: '/home', element: useMockApi ? <Home /> : <LiveHome /> },
  { path: '/attendance', element: useMockApi ? <Attendance /> : <LiveAttendance /> },
  ...(import.meta.env.DEV ? [{ path: '/attendance/preview/:status', element: <AttendancePreview /> }] : []),
  { path: '/notices', element: useMockApi ? <Notices /> : <LiveNotices /> },
  { path: '/notices/:id', element: useMockApi ? <NoticeDetail /> : <LiveNoticeDetail /> },
  { path: '/schedule', element: useMockApi ? <SchedulePage /> : <LiveSchedule /> },
  { path: '/mypage', element: useMockApi ? <MyPage /> : <LiveMyPage /> },
  { element: <RequireSession admin />, children: [
  { path: '/admin', element: <Navigate to="/admin/sessions" replace /> },
  { path: '/admin/permissions', element: useMockApi ? <Permissions /> : <LivePermissions /> },
  { element: <AdminLayout />, children: [
    { path: '/admin/sessions', element: useMockApi ? <Sessions /> : <LiveSessions /> },
    { path: '/admin/sessions/new', element: useMockApi ? <><Sessions /><SessionEditor /></> : <><LiveSessions /><LiveSessionEditor /></> },
    { path: '/admin/sessions/:sessionId', element: <LiveSessions /> },
    { path: '/admin/sessions/:sessionId/edit', element: <><LiveSessions /><LiveSessionEditor /></> },
    { path: '/admin/notices', element: useMockApi ? <AdminNotices /> : <LiveAdminNotices /> },
    { path: '/admin/notices/new', element: useMockApi ? <><AdminNotices /><NoticeEditor /></> : <><LiveAdminNotices /><LiveNoticeEditor /></> },
    { path: '/admin/notices/:id/edit', element: useMockApi ? <><AdminNotices /><NoticeEditor /></> : <><LiveAdminNotices /><LiveNoticeEditor /></> },
    { path: '/admin/schedule', element: useMockApi ? <AdminSchedule /> : <LiveAdminSchedule /> },
    { path: '/admin/schedule/new', element: useMockApi ? <><AdminSchedule /><ScheduleEditor /></> : <><LiveAdminSchedule /><LiveScheduleEditor /></> },
    { path: '/admin/schedule/:id/edit', element: useMockApi ? <><AdminSchedule /><ScheduleEditor /></> : <><LiveAdminSchedule /><LiveScheduleEditor /></> },
    { path: '/admin/statistics', element: useMockApi ? <Statistics /> : <FeatureUnavailable title="출석 통계" /> },
  ] },
  ] },
  ] },
  { path: '*', element: <Placeholder title="페이지를 찾을 수 없습니다" /> },
] }] }])
