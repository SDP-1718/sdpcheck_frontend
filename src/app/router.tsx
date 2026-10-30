import { createBrowserRouter, Navigate } from 'react-router'
import Layout from '../components/layout/Layout'
import Placeholder from '../pages/Placeholder'
import Onboarding from '../pages/onboarding/Onboarding'
import Root from './Root'
import Home from '../pages/home/Home'
import { Notices, NoticeDetail } from '../pages/notices/Notices'

import Attendance from '../pages/attendance/Attendance'
import AttendancePreview from '../pages/attendance/AttendancePreview'

const routes = [
  { path: '/', element: <Navigate to="/onboarding" replace /> },
  { path: '/onboarding', element: <Onboarding /> },
  { path: '/onboarding/preview', element: <Placeholder title="로그인" /> },
  { path: '/home', element: <Home /> },
  { path: '/attendance', element: <Attendance /> },
  ...(import.meta.env.DEV ? [{ path: '/attendance/preview/:status', element: <AttendancePreview /> }] : []),
  { path: '/notices', element: <Notices /> },
  { path: '/notices/:id', element: <NoticeDetail /> },
  { path: '/schedule', element: <Placeholder title="일정" /> },
  { path: '/mypage', element: <Placeholder title="마이페이지" /> },
  { path: '/admin', element: <Navigate to="/admin/sessions" replace /> },
  { path: '/admin/sessions', element: <Placeholder title="관리자 세션" /> },
  { path: '/admin/notices', element: <Placeholder title="관리자 공지" /> },
  { path: '/admin/schedule', element: <Placeholder title="관리자 일정" /> },
  { path: '/admin/statistics', element: <Placeholder title="관리자 통계" /> },
  { path: '/admin/permissions', element: <Placeholder title="권한 관리" /> },
  { path: '*', element: <Placeholder title="페이지를 찾을 수 없습니다" /> },
]

export const router = createBrowserRouter([{ element: <Root />, children: [{ element: <Layout />, children: routes }] }] )
