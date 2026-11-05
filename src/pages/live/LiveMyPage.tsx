import { useState } from 'react'
import { Link, useNavigate } from 'react-router'
import { useAuth } from '../../auth/AuthState'
import { useApiPages, useApiQuery } from '../../hooks/useApiQuery'
import { apiRequest } from '../../api/client'
import { dateParts } from '../../api/dates'
import { errorMessage } from '../../api/errors'
import { formatAttendanceRate } from '../../utils/attendance'
import type { AttendanceHistory, AttendanceSummary, NotificationSettings } from '../../api/types'
import AsyncState from '../../components/common/AsyncState'
import Toggle from '../../components/common/Toggle'
import ConfirmDialog from '../../components/common/ConfirmDialog'
const labels={PRESENT:'출석',LATE:'지각',ABSENT:'결석'}
export default function LiveMyPage(){
 const {session,logout}=useAuth(),navigate=useNavigate()
 const summary=useApiQuery<AttendanceSummary>('/api/v1/members/me/attendance-summary')
 const insight=useApiQuery<{insight:string}>('/api/v1/members/me/attendance-insight')
 const history=useApiPages<AttendanceHistory>('/api/v1/members/me/attendances')
 const preferences=useApiQuery<NotificationSettings>('/api/v1/members/me/notification-settings')
 const [saved,setSaved]=useState<NotificationSettings|null>(null),[saving,setSaving]=useState(false),[message,setMessage]=useState(''),[logoutOpen,setLogoutOpen]=useState(false),[loggingOut,setLoggingOut]=useState(false)
 if(session.status!=='authenticated')return null
 const member=session.member,settings=saved??preferences.data
 async function update(key:keyof NotificationSettings,value:boolean){
  if(saving)return
  setSaving(true);setMessage('')
  try{setSaved(await apiRequest<NotificationSettings>('/api/v1/members/me/notification-settings',{method:'PATCH',body:JSON.stringify({[key]:value})}))}
  catch{setMessage('알림 설정을 저장하지 못했어요. 다시 시도해주세요.')}
  finally{setSaving(false)}
 }
 return <section className="mypage"><header className="profile-header"><div className="profile-avatar">{member.name.slice(0,1)}</div><div><h1>{member.name}</h1><p>{member.generation}기 · {member.role==='ADMIN'?'운영진':'학회원'}</p></div></header>
 {insight.data&&<p className="profile-encouragement">{insight.data.insight}</p>}
 {summary.error?<AsyncState error message={errorMessage(summary.error)} onRetry={summary.retry}/>:summary.data?<div className="profile-statistics"><div><strong>{formatAttendanceRate(summary.data.attendanceRate)}</strong><span>평균 출석률</span></div><div><strong>{summary.data.lateCount}회</strong><span>지각</span></div><div><strong>{summary.data.absentCount}회</strong><span>결석</span></div></div>:<AsyncState/>}
 <h2 className="profile-history-heading">출석 이력</h2><ul className="profile-history">{history.items.map(item=><li key={item.sessionId}><div><h3>{item.sessionTitle}</h3><time>{dateParts(item.startsAt).date.replaceAll('-','.')}</time></div><span className={`profile-attendance-status ${item.attendanceStatus==='PRESENT'?'present':item.attendanceStatus==='LATE'?'late':'absent'}`}>{labels[item.attendanceStatus]}</span></li>)}</ul>
 {history.loading&&<AsyncState/>}{history.error&&<AsyncState error onRetry={history.retry}/>} {!history.loading&&!history.error&&!history.items.length&&<p className="api-inline-empty">출석 이력이 없어요</p>}{history.hasNext&&!history.loading&&!history.error&&<button className="secondary api-more" onClick={history.loadMore}>더보기</button>}
 <h2 className="profile-notifications-heading">알림 설정</h2>{preferences.error?<AsyncState error onRetry={preferences.retry}/>:settings?<fieldset className="profile-notifications" disabled={saving}><div><span>세션 시작 알림</span><Toggle label="세션 시작 알림" checked={settings.sessionStartEnabled} onChange={value=>{void update('sessionStartEnabled',value)}}/></div><div><span>새 공지 알림</span><Toggle label="새 공지 알림" checked={settings.newNoticeEnabled} onChange={value=>{void update('newNoticeEnabled',value)}}/></div></fieldset>:<AsyncState/>}
 {message&&<p className="api-inline-empty" role="alert">{message}</p>}
 {member.role==='ADMIN'&&<><h2 className="profile-permissions-heading">권한</h2><Link className="profile-permissions-link" to="/admin/permissions">권한 설정</Link></>}
 <div className="profile-logout"><button disabled={loggingOut} onClick={()=>setLogoutOpen(true)}>{loggingOut?'로그아웃 중...':'로그아웃'}</button></div>
 {logoutOpen&&<ConfirmDialog title="로그아웃할까요?" confirmLabel="로그아웃" onCancel={()=>setLogoutOpen(false)} onConfirm={()=>{
 setLogoutOpen(false);setLoggingOut(true)
 void logout().then(()=>navigate('/onboarding',{replace:true})).catch(()=>navigate('/onboarding?logout=failed',{replace:true}))
 }}>다시 로그인하면 바로 이용할 수 있어요</ConfirmDialog>}
 </section>
}
