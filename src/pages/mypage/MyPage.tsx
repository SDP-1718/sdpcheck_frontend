import { useState } from 'react'
import { Link, useNavigate } from 'react-router'
import { ChevronRight } from 'lucide-react'
import ConfirmDialog from '../../components/common/ConfirmDialog'
import Toggle from '../../components/common/Toggle'
import { useLocalState } from '../../hooks/useLocalState'
import { defaultNotificationPreferences, previewAttendanceHistory, previewProfile, previewProfileSummary } from '../../mocks/profile'

const attendanceLabels = { present: '출석', late: '지각', absent: '결석' }

export default function MyPage() {
  const navigate = useNavigate()
  const [logoutOpen, setLogoutOpen] = useState(false)
  const [preferences, setPreferences] = useLocalState('sdp-preview-notifications-v1', defaultNotificationPreferences)
  const summary = previewProfileSummary
  return (
    <section className="mypage" aria-label="마이페이지">
      <header className="profile-header">
        <div className="profile-avatar" aria-hidden="true">{previewProfile.initial}</div>
        <div><h1>{previewProfile.name}</h1><p>{previewProfile.generation}기 · {previewProfile.role}</p></div>
      </header>
      <p className="profile-encouragement">최근 {summary.recentSessions}번 중 {summary.recentAttendance}번 출석하셨어요, 꾸준히 잘하고 있어요!</p>
      <div className="profile-statistics" aria-label="내 출석 통계">
        <div><strong>{summary.attendanceRate}%</strong><span>평균 출석률</span></div>
        <div><strong>{summary.late}회</strong><span>지각</span></div>
        <div><strong>{summary.absent}회</strong><span>결석</span></div>
      </div>
      <h2 className="profile-history-heading">출석 이력</h2>
      <ul className="profile-history">
        {previewAttendanceHistory.map(record => <li key={record.id}>
          <div><h3>{record.title}</h3><time>{record.date}</time></div>
          <span className={`profile-attendance-status ${record.status}`}>{attendanceLabels[record.status]}</span>
        </li>)}
      </ul>
      <h2 className="profile-notifications-heading">출석 이력</h2>
      <div className="profile-notifications" role="group" aria-label="알림 설정">
        <div><span>세션 시작 알림</span><Toggle label="세션 시작 알림" checked={preferences.sessionStart}
          onChange={value => setPreferences(previous => ({ ...previous, sessionStart: value }))} /></div>
        <div><span>새 공지 알림</span><Toggle label="새 공지 알림" checked={preferences.newNotice}
          onChange={value => setPreferences(previous => ({ ...previous, newNotice: value }))} /></div>
      </div>
      <h2 className="profile-permissions-heading">권한</h2>
      <Link className="profile-permissions-link" to="/admin/permissions"><span>권한 설정</span><ChevronRight size={20} aria-hidden="true" /></Link>
      <div className="profile-logout"><button type="button" onClick={() => setLogoutOpen(true)}>로그아웃</button></div>
      {logoutOpen && <ConfirmDialog title="로그아웃할까요?" confirmLabel="로그아웃"
        onCancel={() => setLogoutOpen(false)} onConfirm={() => navigate('/onboarding', { replace: true })}>
        다시 로그인하면 바로 이용할 수 있어요
      </ConfirmDialog>}
    </section>
  )
}
